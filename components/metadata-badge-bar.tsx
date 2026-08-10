"use client";

import { AnalysisResult } from "@/types";
import { Star, GitBranch, FileCode, Hash, Database } from "lucide-react";

interface Props {
  result: AnalysisResult;
}

export default function MetadataBadgeBar({ result }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-[var(--surface-border)]">
      <div className="flex items-center gap-1.5">
        <a
          href={result.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lg text-[var(--content-primary)] hover:text-[var(--accent-primary)] transition-base mono"
        >
          {result.repoFullName}
        </a>
        {result.cached && (
          <span className="badge">
            <Database size={10} />
            Cached
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        {result.primaryLanguage && (
          <span className="badge">
            <FileCode size={11} />
            {result.primaryLanguage}
          </span>
        )}
        <span className="badge">
          <Star size={11} />
          {result.starsCount.toLocaleString()}
        </span>
        <span className="badge">
          <FileCode size={11} />
          {result.filesAnalyzedCount} files analyzed
        </span>
        <span className="badge mono text-[10px]">
          <Hash size={10} />
          {result.commitSha.slice(0, 7)}
        </span>
        <span className="badge">
          <GitBranch size={11} />
          HEAD
        </span>
      </div>
    </div>
  );
}
