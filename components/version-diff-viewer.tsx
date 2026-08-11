"use client";

import { useState } from "react";
import { VersionDiffSummary } from "@/types";
import { BranchRef } from "@/components/branch-ref-selector";
import {
  GitCompare,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  FileCode,
  ArrowRight,
  CheckSquare,
  Loader2,
  GitBranch,
} from "lucide-react";

interface Props {
  repoUrl: string;
  defaultBranch?: string;
}

export default function VersionDiffViewer({ repoUrl, defaultBranch = "main" }: Props) {
  const [baseRef, setBaseRef] = useState(defaultBranch);
  const [compareRef, setCompareRef] = useState("");
  const [refs, setRefs] = useState<BranchRef[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [diffing, setDiffing] = useState(false);
  const [diffResult, setDiffResult] = useState<VersionDiffSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchRefs() {
    if (refs.length > 0) return;
    setLoadingRefs(true);
    try {
      const res = await fetch(`/api/refs?repo=${encodeURIComponent(repoUrl)}`);
      const data = await res.json();
      if (data.refs) {
        setRefs(data.refs);
        if (data.refs.length > 1 && !compareRef) {
          // Select a default comparison ref if available
          const other = data.refs.find((r: BranchRef) => r.name !== baseRef);
          if (other) setCompareRef(other.name);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingRefs(false);
    }
  }

  async function handleCompare() {
    if (!compareRef || baseRef === compareRef) {
      setError("Please select two different branches or tags to compare.");
      return;
    }

    setDiffing(true);
    setError(null);
    setDiffResult(null);

    try {
      const res = await fetch("/api/analyze/diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, baseRef, compareRef }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to compare versions");
      }

      setDiffResult(data.diff);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDiffing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Version Selector Header ── */}
      <div className="card p-6 border-[var(--surface-border)]">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare size={18} className="text-[var(--accent-primary)]" />
          <h2 className="text-base font-semibold text-[var(--content-primary)]">
            Architecture Evolution & Version Diff
          </h2>
        </div>

        <p className="text-xs text-[var(--content-secondary)] leading-relaxed mb-5">
          Select two Git branches or tags to compare architectural shifts, breaking changes, added/removed modules, and step-by-step migration guidance.
        </p>

        <div className="flex items-center gap-3 flex-wrap" onClick={fetchRefs}>
          {/* Base Ref Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-mono text-[var(--content-muted)] uppercase mb-1">
              Base Reference
            </label>
            <div className="relative">
              <input
                type="text"
                value={baseRef}
                onChange={(e) => setBaseRef(e.target.value)}
                placeholder="e.g. main or v1.0.0"
                className="w-full bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm font-mono text-[var(--content-primary)] focus:border-[var(--accent-primary)] outline-none"
              />
            </div>
          </div>

          <div className="pt-5 text-[var(--content-muted)] font-mono text-xs">vs</div>

          {/* Compare Ref Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-mono text-[var(--content-muted)] uppercase mb-1">
              Compare Reference
            </label>
            <div className="relative">
              <input
                type="text"
                value={compareRef}
                onChange={(e) => setCompareRef(e.target.value)}
                placeholder="e.g. feature-branch or v2.0.0"
                className="w-full bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm font-mono text-[var(--content-primary)] focus:border-[var(--accent-primary)] outline-none"
              />
            </div>
          </div>

          {/* Compare Action Button */}
          <div className="pt-5">
            <button
              onClick={handleCompare}
              disabled={diffing || !compareRef}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-[var(--radius-md)] font-medium text-sm transition-base disabled:opacity-50"
            >
              {diffing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Analyzing Diff…
                </>
              ) : (
                <>
                  <GitCompare size={15} />
                  Compare Architecture
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        {refs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-[var(--content-muted)]">Available refs:</span>
            {refs.slice(0, 6).map((r) => (
              <button
                key={r.name}
                onClick={() => setCompareRef(r.name)}
                className="px-2 py-0.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-[var(--radius-sm)] text-[11px] font-mono text-[var(--content-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-base"
              >
                {r.name}
              </button>
            ))}
          </div>
        )}

        {loadingRefs && (
          <p className="text-[11px] font-mono text-[var(--content-muted)] mt-2 flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Loading branches and tags…
          </p>
        )}
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div className="p-4 bg-[rgba(239,68,68,0.1)] border border-[var(--status-error)] rounded-[var(--radius-md)] text-xs text-[var(--status-error)] flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Diff Results ── */}
      {diffResult && (
        <div className="space-y-6 animate-slide-in">
          {/* Summary Box */}
          <div className="card p-6 border-[var(--surface-border)] bg-[var(--surface-elevated)]">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-2 font-mono text-sm text-[var(--content-primary)] font-semibold">
                <GitBranch size={15} className="text-[var(--accent-primary)]" />
                <span>{diffResult.baseRef}</span>
                <ArrowRight size={14} className="text-[var(--content-muted)]" />
                <span className="text-[var(--accent-primary)]">{diffResult.compareRef}</span>
              </div>
              <span className="px-2.5 py-1 bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-[var(--radius-sm)] text-xs font-mono text-[var(--content-secondary)]">
                {diffResult.totalFilesChanged} files changed
              </span>
            </div>
            <p className="text-xs text-[var(--content-secondary)] leading-relaxed text-justify">
              {diffResult.evolutionSummary}
            </p>
          </div>

          {/* Breaking Changes Alert */}
          {diffResult.breakingChanges && diffResult.breakingChanges.length > 0 && (
            <div className="card p-5 border-[var(--status-error)] bg-[rgba(239,68,68,0.05)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--status-error)] mb-2">
                <AlertTriangle size={16} />
                Potential Breaking Changes ({diffResult.breakingChanges.length})
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-xs text-[var(--content-primary)]">
                {diffResult.breakingChanges.map((change, idx) => (
                  <li key={idx} className="leading-relaxed">{change}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Modified Modules Grid */}
          {diffResult.modifiedModules && diffResult.modifiedModules.length > 0 && (
            <div>
              <h3 className="text-xs uppercase font-mono tracking-widest text-[var(--content-muted)] mb-3 flex items-center gap-2">
                <FileCode size={14} />
                Modified Modules & Architectural Shifts ({diffResult.modifiedModules.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {diffResult.modifiedModules.map((mod, idx) => (
                  <div key={idx} className="card p-4 border-[var(--surface-border)]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-semibold text-[var(--content-primary)] truncate">
                        {mod.name}
                      </span>
                      <ImpactBadge impact={mod.impact} />
                    </div>
                    <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added & Removed Modules Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Added Modules */}
            <div className="card p-5 border-[var(--surface-border)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--status-success)] mb-3 font-semibold">
                <PlusCircle size={15} />
                Added Modules ({diffResult.addedModules?.length ?? 0})
              </div>
              {diffResult.addedModules && diffResult.addedModules.length > 0 ? (
                <ul className="space-y-1.5 font-mono text-xs text-[var(--content-secondary)]">
                  {diffResult.addedModules.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-[var(--status-success)]">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--content-muted)] font-mono">No new modules added</p>
              )}
            </div>

            {/* Removed Modules */}
            <div className="card p-5 border-[var(--surface-border)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--status-error)] mb-3 font-semibold">
                <MinusCircle size={15} />
                Removed / Deprecated ({diffResult.removedModules?.length ?? 0})
              </div>
              {diffResult.removedModules && diffResult.removedModules.length > 0 ? (
                <ul className="space-y-1.5 font-mono text-xs text-[var(--content-secondary)]">
                  {diffResult.removedModules.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-[var(--status-error)]">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--content-muted)] font-mono">No modules removed</p>
              )}
            </div>
          </div>

          {/* Migration Guide */}
          {diffResult.migrationGuide && diffResult.migrationGuide.length > 0 && (
            <div className="card p-6 border-[var(--surface-border)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-primary)] mb-3 font-semibold">
                <CheckSquare size={15} />
                Migration & Upgrade Checklist
              </div>
              <div className="space-y-2">
                {diffResult.migrationGuide.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--content-secondary)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-center font-mono text-[10px] text-[var(--accent-primary)] shrink-0 font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-[rgba(239,68,68,0.15)] text-[var(--status-error)] border-[var(--status-error)]",
    medium: "bg-[rgba(234,179,8,0.15)] text-[var(--status-warning)] border-[var(--status-warning)]",
    low: "bg-[rgba(34,197,94,0.15)] text-[var(--status-success)] border-[var(--status-success)]",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono uppercase font-bold border ${styles[impact]}`}
    >
      {impact} Impact
    </span>
  );
}
