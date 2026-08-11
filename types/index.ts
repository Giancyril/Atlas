// Core TypeScript definitions for GitHub Repository Explainer

export interface RepoInfo {
  owner: string;
  repo: string;
  repoUrl: string;
  repoFullName: string;
  defaultBranch: string;
  commitSha: string;
  primaryLanguage: string | null;
  starsCount: number;
  description: string | null;
  isPrivate: boolean;
  size: number; // KB
}

export interface TreeNode {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
  url: string;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  tier: 1 | 2 | 3; // File priority tier (1=highest)
}

export interface ArchitectureSummary {
  overview: string;
  techStack: string[];
  coreConcepts: string[];
  primaryLanguage: string;
  projectType: string; // e.g. "web app", "CLI tool", "library"
}

export interface ModuleExplanation {
  name: string;
  path: string;
  description: string;
  purpose: string;
  files: FileExplanation[];
}

export interface FileExplanation {
  path: string;
  purpose: string;
  keyExports?: string[];
  githubUrl: string;
}

export interface CodeExplanations {
  modules: ModuleExplanation[];
  spotlightFiles: FileExplanation[]; // top 5-10 key files
}

export interface SetupStep {
  command: string;
  description: string;
}

export interface OnboardingGuide {
  runtimeRequirements: string[];
  setupSteps: SetupStep[];
  startReadingPath: string[];
  keyConventions: string[];
  goodFirstAreas: string[];
}

export interface AnalysisData {
  architectureSummary: ArchitectureSummary;
  mermaidDiagram: string;
  codeExplanations: CodeExplanations;
  onboardingGuide: OnboardingGuide;
  healthScorecard?: HealthScorecard;
  dependencySummary?: DependencySummary;
}

export interface AnalysisResult {
  id: string;
  cached: boolean;
  repoUrl: string;
  repoFullName: string;
  commitSha: string;
  branchRef?: string;
  primaryLanguage: string | null;
  starsCount: number;
  filesAnalyzedCount: number;
  data: AnalysisData;
  createdAt: string;
}

export interface AnalyzeRequest {
  repoUrl: string;
  forceReanalyze?: boolean;
  ref?: string; // branch or tag
}

export interface AnalyzeErrorResponse {
  error: string;
  code:
    | "INVALID_URL"
    | "NOT_FOUND"
    | "PRIVATE_REPO"
    | "RATE_LIMITED"
    | "REPO_TOO_LARGE"
    | "ANALYSIS_FAILED"
    | "INTERNAL_ERROR";
  details?: string;
}

export type AnalysisStage =
  | "idle"
  | "fetching_repo"
  | "selecting_files"
  | "analyzing"
  | "validating"
  | "done"
  | "error";

export interface AnalysisProgress {
  stage: AnalysisStage;
  message: string;
  percentage: number;
}

// ── Advanced Feature 1: Interactive Codebase Chat ──────────────────────────
export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  citations?: string[];
}

export interface ChatRequest {
  repoFullName: string;
  commitSha: string;
  analysisData: AnalysisData;
  messages: { sender: "user" | "assistant"; text: string }[];
  question: string;
}

export interface ChatResponse {
  answer: string;
  citations: string[];
  suggestedFollowups: string[];
}

// ── Advanced Feature 2: Health & Security Scorecard ──────────────────────
export interface HealthMetric {
  category: "Modularity" | "Documentation" | "Maintainability" | "Security & Quality";
  score: number; // 0-100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  summary: string;
  recommendation: string;
}

export interface HealthScorecard {
  overallGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  overallScore: number;
  metrics: HealthMetric[];
  highlights: string[];
  riskFactors: string[];
}

// ── Advanced Feature 3: Dependency Graph ─────────────────────────────────
export interface DependencyItem {
  name: string;
  version: string;
  type: "direct" | "dev" | "peer";
  category?: string;
}

export interface DependencySummary {
  manifestFile: string;
  ecosystem: "npm" | "pip" | "cargo" | "go" | "unknown";
  directCount: number;
  devCount: number;
  dependencies: DependencyItem[];
}

