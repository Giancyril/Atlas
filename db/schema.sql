-- GitHub Repository Explainer - PostgreSQL Schema
-- Run this file to initialize the database schema.

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
  files_analyzed_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_repo_sha UNIQUE (repo_full_name, commit_sha)
);

CREATE INDEX IF NOT EXISTS idx_repo_sha ON repo_analyses (repo_full_name, commit_sha);
CREATE INDEX IF NOT EXISTS idx_repo_url ON repo_analyses (repo_url);
CREATE INDEX IF NOT EXISTS idx_created_at ON repo_analyses (created_at DESC);

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
