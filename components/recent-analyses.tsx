"use client";

import { useEffect, useState } from "react";
import { History, Star, GitCommit, Code2, ArrowRight, Loader2 } from "lucide-react";

interface RecentAnalysis {
  id: string;
  repo_url: string;
  repo_full_name: string;
  commit_sha: string;
  primary_language: string | null;
  stars_count: number;
  files_analyzed_count: number;
  created_at: string;
}

interface Props {
  onSelect: (url: string) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  Ruby: "#701516",
  C: "#555555",
  "C++": "#f34b7d",
};

export default function RecentAnalyses({ onSelect }: Props) {
  const [analyses, setAnalyses] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analyze/recent")
      .then((r) => r.json())
      .then((d) => setAnalyses(d.analyses ?? []))
      .catch(() => setAnalyses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--content-muted)]">
        <Loader2 size={14} className="animate-spin" />
        Loading recent analyses…
      </div>
    );
  }

  if (analyses.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 pb-8 animate-slide-in">
      <div className="flex items-center gap-2 mb-3">
        <History size={14} className="text-[var(--content-muted)]" />
        <span className="text-xs uppercase tracking-widest font-mono text-[var(--content-muted)]">
          Recently Analyzed
        </span>
      </div>
      <div className="space-y-2">
        {analyses.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a.repo_url)}
            className="w-full card p-3 flex items-center gap-4 hover:border-[var(--accent-primary)] transition-base group text-left"
          >
            {/* Language dot */}
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                background: LANGUAGE_COLORS[a.primary_language ?? ""] ?? "var(--content-muted)",
              }}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--content-primary)] truncate group-hover:text-[var(--accent-primary)] transition-base">
                {a.repo_full_name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-[var(--content-muted)] font-mono">
                  <GitCommit size={10} />
                  {a.commit_sha.slice(0, 7)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[var(--content-muted)] font-mono">
                  <Star size={10} />
                  {a.stars_count.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[var(--content-muted)] font-mono">
                  <Code2 size={10} />
                  {a.files_analyzed_count} files
                </span>
                <span className="text-[11px] text-[var(--content-muted)] font-mono ml-auto">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <ArrowRight
              size={14}
              className="text-[var(--content-muted)] group-hover:text-[var(--accent-primary)] transition-base shrink-0"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
