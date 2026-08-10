"use client";

import { useState } from "react";
import { Github, Zap, ArrowRight, Star, GitBranch, Loader2, AlertCircle } from "lucide-react";
import { AnalysisResult, AnalyzeErrorResponse, AnalysisStage } from "@/types";
import DiagramViewer from "@/components/diagram-viewer";
import CodeExplainer from "@/components/code-explainer";
import OnboardingGuide from "@/components/onboarding-guide";
import StageLoader from "@/components/stage-loader";
import MetadataBadgeBar from "@/components/metadata-badge-bar";

const SAMPLE_REPOS = [
  { label: "expressjs/express", url: "https://github.com/expressjs/express" },
  { label: "fastapi/fastapi", url: "https://github.com/fastapi/fastapi" },
  { label: "shadcn/ui", url: "https://github.com/shadcn-ui/ui" },
  { label: "vercel/next.js", url: "https://github.com/vercel/next.js" },
];

const STAGE_MESSAGES: Record<AnalysisStage, { message: string; percentage: number }> = {
  idle: { message: "", percentage: 0 },
  fetching_repo: { message: "Fetching repository metadata & commit SHA…", percentage: 15 },
  selecting_files: { message: "Selecting key files to analyze…", percentage: 35 },
  analyzing: { message: "Synthesizing architecture with Gemini AI…", percentage: 65 },
  validating: { message: "Validating diagram & persisting to cache…", percentage: 90 },
  done: { message: "Analysis complete!", percentage: 100 },
  error: { message: "Analysis failed", percentage: 0 },
};

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [forceReanalyze, setForceReanalyze] = useState(false);
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<AnalyzeErrorResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"diagram" | "code" | "onboarding">("diagram");

  const isLoading = stage !== "idle" && stage !== "done" && stage !== "error";

  async function handleAnalyze(urlToAnalyze?: string) {
    const url = urlToAnalyze ?? repoUrl;
    if (!url.trim()) return;

    setStage("fetching_repo");
    setResult(null);
    setError(null);

    // Simulate multi-stage progress with actual fetch
    const stageTimer = (s: AnalysisStage, delay: number) =>
      new Promise<void>((r) => setTimeout(() => { setStage(s); r(); }, delay));

    try {
      // Show progressive stage updates while the real request is in flight
      const stagePromise = (async () => {
        await stageTimer("selecting_files", 2000);
        await stageTimer("analyzing", 4000);
        await stageTimer("validating", 8000);
      })();

      const fetchPromise = fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url, forceReanalyze }),
      });

      const [response] = await Promise.all([fetchPromise, stagePromise]);
      const data = await response.json();

      if (!response.ok) {
        setError(data as AnalyzeErrorResponse);
        setStage("error");
        return;
      }

      setResult(data as AnalysisResult);
      setStage("done");
      setActiveTab("diagram");
    } catch {
      setError({ error: "Network error — please check your connection and try again.", code: "INTERNAL_ERROR" });
      setStage("error");
    }
  }

  function handleSampleClick(url: string) {
    setRepoUrl(url);
    handleAnalyze(url);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-[var(--surface-border)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold text-[var(--content-primary)] tracking-tight">
              Repo Explainer
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-base"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        {/* Hero / Input Section */}
        <section className="px-6 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 badge badge-accent mb-6">
              <Zap size={11} />
              Powered by Google Gemini
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--content-primary)] mb-4 leading-tight">
              Understand any GitHub repo
              <br />
              <span className="text-[var(--accent-primary)]">in minutes</span>
            </h1>
            <p className="text-[var(--content-secondary)] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Paste a public GitHub repository URL and get an AI-generated architecture diagram,
              structured code explanations, and an onboarding guide — instantly.
            </p>

            {/* URL Input */}
            <div className="card p-1.5 max-w-2xl mx-auto mb-4">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 bg-[var(--surface-elevated)] rounded-[var(--radius-md)]">
                  <Github size={18} className="text-[var(--content-muted)] shrink-0" />
                  <input
                    id="repo-url-input"
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isLoading && handleAnalyze()}
                    placeholder="https://github.com/owner/repo"
                    className="flex-1 bg-transparent py-3 text-[var(--content-primary)] placeholder:text-[var(--content-muted)] font-mono text-sm outline-none min-w-0"
                    disabled={isLoading}
                    aria-label="GitHub repository URL"
                  />
                </div>
                <button
                  id="analyze-btn"
                  onClick={() => handleAnalyze()}
                  disabled={isLoading || !repoUrl.trim()}
                  className="flex items-center gap-2 px-5 py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold rounded-[var(--radius-md)] transition-base disabled:opacity-40 disabled:cursor-not-allowed text-sm shrink-0"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  {isLoading ? "Analyzing…" : "Analyze"}
                </button>
              </div>
            </div>

            {/* Force Re-analyze + Sample repos */}
            <div className="flex flex-col items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[var(--content-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  id="force-reanalyze"
                  checked={forceReanalyze}
                  onChange={(e) => setForceReanalyze(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent-primary)] rounded"
                />
                Force re-analyze (bypass cache)
              </label>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-[var(--content-muted)]">Try a sample:</span>
                {SAMPLE_REPOS.map((s) => (
                  <button
                    key={s.url}
                    id={`sample-${s.label.replace("/", "-")}`}
                    onClick={() => handleSampleClick(s.url)}
                    disabled={isLoading}
                    className="badge hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-base cursor-pointer disabled:opacity-40"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stage Loader ── */}
        {isLoading && (
          <div className="max-w-3xl mx-auto px-6 pb-10 animate-slide-in">
            <StageLoader stage={stage} stageMessages={STAGE_MESSAGES} />
          </div>
        )}

        {/* ── Error State ── */}
        {stage === "error" && error && (
          <div className="max-w-3xl mx-auto px-6 pb-12 animate-slide-in">
            <ErrorState error={error} onRetry={() => handleAnalyze()} />
          </div>
        )}

        {/* ── Results ── */}
        {stage === "done" && result && (
          <div className="max-w-7xl mx-auto px-6 pb-16 animate-slide-in">
            {/* Repo metadata bar */}
            <MetadataBadgeBar result={result} />

            {/* Tab navigation */}
            <div className="flex gap-1 mb-6 border-b border-[var(--surface-border)]">
              {(["diagram", "code", "onboarding"] as const).map((tab) => (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium transition-base border-b-2 -mb-px capitalize ${
                    activeTab === tab
                      ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                      : "border-transparent text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                  }`}
                >
                  {tab === "diagram" ? "🗺 Architecture" : tab === "code" ? "📂 Code Explorer" : "🚀 Onboarding"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="animate-slide-in">
              {activeTab === "diagram" && (
                <DiagramViewer
                  diagram={result.data.mermaidDiagram}
                  summary={result.data.architectureSummary}
                />
              )}
              {activeTab === "code" && (
                <CodeExplainer
                  explanations={result.data.codeExplanations}
                  repoFullName={result.repoFullName}
                  commitSha={result.commitSha}
                />
              )}
              {activeTab === "onboarding" && (
                <OnboardingGuide guide={result.data.onboardingGuide} />
              )}
            </div>
          </div>
        )}

        {/* ── Empty State / Features ── */}
        {stage === "idle" && (
          <section className="max-w-5xl mx-auto px-6 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FEATURE_CARDS.map((f) => (
                <div key={f.title} className="card p-6">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-[var(--content-primary)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--content-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--surface-border)] px-6 py-5 text-center text-xs text-[var(--content-muted)]">
        <p>Repo Explainer — Powered by Google Gemini &amp; GitHub API</p>
      </footer>
    </div>
  );
}

const FEATURE_CARDS = [
  {
    icon: "🗺",
    title: "Architecture Diagram",
    desc: "Auto-generated Mermaid.js diagrams showing how modules, layers, and services connect — interactive, zoomable, exportable.",
  },
  {
    icon: "📂",
    title: "Code Explorer",
    desc: "Navigate the codebase as a structured tree. Each folder and key file gets a purpose-driven summary with a direct GitHub link.",
  },
  {
    icon: "🚀",
    title: "Onboarding Guide",
    desc: "Step-by-step setup instructions extracted from package.json, Dockerfiles, and Makefiles — plus a curated reading order for new contributors.",
  },
];

function ErrorState({
  error,
  onRetry,
}: {
  error: AnalyzeErrorResponse;
  onRetry: () => void;
}) {
  const hints: Record<string, string> = {
    INVALID_URL: "Make sure the URL follows the format https://github.com/owner/repo",
    NOT_FOUND: "Double-check that the repository exists and is publicly accessible.",
    PRIVATE_REPO: "Only public repositories are supported. Check the repository visibility on GitHub.",
    RATE_LIMITED: "GitHub API rate limit reached. Wait a few minutes and try again.",
    REPO_TOO_LARGE: "Try a smaller repository, or wait for large-repo support in a future update.",
    ANALYSIS_FAILED: "Gemini analysis encountered an issue. Try again — this is usually transient.",
    INTERNAL_ERROR: "An unexpected server error occurred. Please try again.",
  };

  return (
    <div className="card p-6 border-[var(--status-error)] border">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-[var(--status-error)] mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-[var(--content-primary)] mb-1">{error.error}</p>
          <p className="text-sm text-[var(--content-secondary)] mb-4">
            {hints[error.code] ?? "Please try again."}
          </p>
          <button
            id="retry-btn"
            onClick={onRetry}
            className="text-sm px-4 py-2 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-[var(--radius-sm)] text-[var(--content-primary)] transition-base"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
