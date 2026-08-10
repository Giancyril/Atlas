"use client";

import { AnalysisStage } from "@/types";
import { CheckCircle, Loader2, Circle } from "lucide-react";

const STAGES: { key: AnalysisStage; label: string }[] = [
  { key: "fetching_repo", label: "Fetching repository" },
  { key: "selecting_files", label: "Selecting key files" },
  { key: "analyzing", label: "Gemini AI analysis" },
  { key: "validating", label: "Validating & caching" },
];

const STAGE_ORDER: AnalysisStage[] = [
  "fetching_repo",
  "selecting_files",
  "analyzing",
  "validating",
  "done",
];

interface Props {
  stage: AnalysisStage;
  stageMessages: Record<AnalysisStage, { message: string; percentage: number }>;
}

export default function StageLoader({ stage, stageMessages }: Props) {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  const { message, percentage } = stageMessages[stage] ?? { message: "", percentage: 0 };

  return (
    <div className="card p-6">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[var(--content-muted)] mb-2">
          <span>{message}</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-1 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Stage steps */}
      <div className="flex flex-col gap-3">
        {STAGES.map((s, i) => {
          const stageIdx = STAGE_ORDER.indexOf(s.key);
          const isDone = currentIdx > stageIdx || stage === "done";
          const isActive = currentIdx === stageIdx;

          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle size={18} className="text-[var(--status-success)]" />
                ) : isActive ? (
                  <Loader2 size={18} className="text-[var(--accent-primary)] animate-spin" />
                ) : (
                  <Circle size={18} className="text-[var(--content-muted)]" />
                )}
              </div>
              <span
                className={`text-sm transition-base ${
                  isDone
                    ? "text-[var(--content-secondary)]"
                    : isActive
                    ? "text-[var(--content-primary)] font-medium"
                    : "text-[var(--content-muted)]"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
