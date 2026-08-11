-- GitHub Repository Explainer (ATLAS) - PostgreSQL Schema v2
-- Run this file to initialize the database schema.
-- Idempotent — safe to re-run.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS repo_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_url VARCHAR(512) NOT NULL,
  repo_full_name VARCHAR(255) NOT NULL,
  commit_sha VARCHAR(40) NOT NULL,
  default_branch VARCHAR(100) DEFAULT 'main',
  primary_language VARCHAR(50),
  stars_count INT DEFAULT 0,
  description TEXT,
  architecture_summary JSONB NOT NULL,
  mermaid_diagram TEXT NOT NULL,
  code_explanations JSONB NOT NULL,
  onboarding_guide JSONB NOT NULL,
  health_scorecard JSONB,           -- Feature 2: Health & Security Scorecard
  dependency_summary JSONB,         -- Feature 3: Dependency Graph
  files_analyzed_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_repo_sha UNIQUE (repo_full_name, commit_sha)
);

CREATE INDEX IF NOT EXISTS idx_repo_sha ON repo_analyses (repo_full_name, commit_sha);
CREATE INDEX IF NOT EXISTS idx_repo_url ON repo_analyses (repo_url);
CREATE INDEX IF NOT EXISTS idx_created_at ON repo_analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_primary_language ON repo_analyses (primary_language);

-- Trigger to auto-update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_updated_at ON repo_analyses;
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON repo_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Feature 1: Chat sessions — persisted Q&A conversations per repo analysis
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES repo_analyses(id) ON DELETE CASCADE,
  repo_full_name VARCHAR(255) NOT NULL,
  commit_sha VARCHAR(40) NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_analysis ON chat_sessions (analysis_id);
CREATE INDEX IF NOT EXISTS idx_chat_repo ON chat_sessions (repo_full_name, commit_sha);

DROP TRIGGER IF EXISTS trigger_update_chat_updated_at ON chat_sessions;
CREATE TRIGGER trigger_update_chat_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

