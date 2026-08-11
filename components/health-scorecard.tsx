"use client";

import { HealthScorecard as HealthScorecardType } from "@/types";
import { ShieldCheck, CheckCircle2, AlertTriangle, Lightbulb, Award } from "lucide-react";

interface Props {
  scorecard?: HealthScorecardType;
}

export default function HealthScorecard({ scorecard }: Props) {
  if (!scorecard) return null;

  const gradeColors: Record<string, string> = {
    "A+": "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    A: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    B: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    C: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    D: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    F: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Overall Score Header */}
      <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-extrabold font-mono shadow-lg shrink-0 ${
              gradeColors[scorecard.overallGrade] ?? gradeColors.A
            }`}
          >
            {scorecard.overallGrade}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={18} className="text-[var(--accent-primary)]" />
              <h2 className="font-bold text-xl text-[var(--content-primary)]">
                Codebase Health &amp; Security Scorecard
              </h2>
            </div>
            <p className="text-sm text-[var(--content-secondary)]">
              Automated evaluation based on modularity, documentation, maintainability, and security posture.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[var(--surface-border)] pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div>
            <span className="text-xs font-mono text-[var(--content-muted)] uppercase tracking-wider block mb-1">
              Overall Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold mono text-[var(--content-primary)]">
                {scorecard.overallScore}
              </span>
              <span className="text-sm text-[var(--content-muted)] font-mono">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scorecard.metrics.map((metric) => (
          <div key={metric.category} className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--content-primary)] text-base">
                {metric.category}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full border text-xs font-bold font-mono ${
                  gradeColors[metric.grade] ?? gradeColors.A
                }`}
              >
                Grade {metric.grade} ({metric.score}/100)
              </span>
            </div>

            {/* Score progress bar */}
            <div className="h-1.5 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                style={{ width: `${metric.score}%` }}
              />
            </div>

            <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
              {metric.summary}
            </p>

            <div className="flex items-start gap-2 text-xs text-[var(--accent-primary)] bg-[var(--surface-elevated)] p-2.5 rounded-[var(--radius-sm)] border border-[var(--surface-border)]">
              <Lightbulb size={14} className="shrink-0 mt-0.5" />
              <span>{metric.recommendation}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Highlights & Risk Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-[var(--status-success)]" />
            <h3 className="font-semibold text-[var(--content-primary)]">Key Architectural Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {scorecard.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-xs text-[var(--content-secondary)]">
                <CheckCircle2 size={14} className="text-[var(--status-success)] shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Factors */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-[var(--status-warning)]" />
            <h3 className="font-semibold text-[var(--content-primary)]">Potential Risk Factors</h3>
          </div>
          <ul className="space-y-2.5">
            {scorecard.riskFactors.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-xs text-[var(--content-secondary)]">
                <AlertTriangle size={14} className="text-[var(--status-warning)] shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
