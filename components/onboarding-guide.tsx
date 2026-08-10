"use client";

import { OnboardingGuide as OnboardingGuideType } from "@/types";
import { Terminal, BookOpen, Lightbulb, Compass, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  guide: OnboardingGuideType;
}

export default function OnboardingGuide({ guide }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Setup Steps */}
      <div className="card p-6">
        <SectionHeader icon={<Terminal size={16} />} title="Local Setup" />
        {guide.runtimeRequirements.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-[var(--content-muted)] uppercase tracking-wider mb-2">
              Requirements
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guide.runtimeRequirements.map((req) => (
                <span key={req} className="badge text-xs">
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {guide.setupSteps.map((step, i) => (
            <SetupStepCard key={i} index={i + 1} step={step} />
          ))}
        </div>
      </div>

      {/* Reading Order */}
      <div className="card p-6">
        <SectionHeader icon={<BookOpen size={16} />} title="Where to Start Reading" />
        <p className="text-sm text-[var(--content-secondary)] mb-4">
          Follow this curated reading path to understand the codebase quickly:
        </p>
        <ol className="space-y-2">
          {guide.startReadingPath.map((filePath, i) => (
            <li key={filePath} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-center text-xs text-[var(--content-muted)] font-mono shrink-0">
                {i + 1}
              </span>
              <code className="text-sm mono text-[var(--accent-primary)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded border border-[var(--surface-border)] truncate">
                {filePath}
              </code>
            </li>
          ))}
        </ol>
      </div>

      {/* Key Conventions */}
      <div className="card p-6">
        <SectionHeader icon={<Lightbulb size={16} />} title="Key Conventions" />
        <ul className="space-y-2.5">
          {guide.keyConventions.map((convention) => (
            <li key={convention} className="flex items-start gap-2.5 text-sm text-[var(--content-secondary)]">
              <span className="text-[var(--accent-primary)] mt-1 text-xs">▸</span>
              {convention}
            </li>
          ))}
        </ul>
      </div>

      {/* Good First Areas */}
      <div className="card p-6">
        <SectionHeader icon={<Compass size={16} />} title="Good First Areas to Explore" />
        <p className="text-sm text-[var(--content-secondary)] mb-4">
          Low-complexity modules ideal for getting started with contributions:
        </p>
        <div className="space-y-2">
          {guide.goodFirstAreas.map((area) => (
            <div
              key={area}
              className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--surface-border)]"
            >
              <span className="text-[var(--status-success)] text-sm">✓</span>
              <code className="text-sm mono text-[var(--content-secondary)]">{area}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-[var(--accent-primary)]">{icon}</span>
      <h3 className="font-semibold text-[var(--content-primary)]">{title}</h3>
    </div>
  );
}

function SetupStepCard({
  index,
  step,
}: {
  index: number;
  step: { command: string; description: string };
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(step.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--surface-border)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--surface-elevated)] border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--content-muted)]">Step {index}</span>
          <span className="text-xs text-[var(--content-secondary)]">{step.description}</span>
        </div>
        <button
          onClick={handleCopy}
          title="Copy command"
          className="p-1 rounded text-[var(--content-muted)] hover:text-[var(--content-primary)] transition-base"
        >
          {copied ? <Check size={12} className="text-[var(--status-success)]" /> : <Copy size={12} />}
        </button>
      </div>
      <div className="px-4 py-3 bg-[var(--surface-base)]">
        <code className="text-sm mono text-[var(--status-success)]">$ {step.command}</code>
      </div>
    </div>
  );
}
