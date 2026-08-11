"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types";
import { generateMarkdownReport, generateReadmeBadge } from "@/lib/export/report-generator";
import { X, Download, Copy, Check, FileText, Code2, ShieldCheck } from "lucide-react";

interface Props {
  result: AnalysisResult;
  onClose: () => void;
}

export default function ShareExportModal({ result, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"md" | "json" | "badge">("md");
  const [copied, setCopied] = useState(false);

  const markdownContent = generateMarkdownReport(result);
  const jsonContent = JSON.stringify(result, null, 2);
  const badgeContent = generateReadmeBadge(result.repoFullName);

  const currentText =
    activeTab === "md" ? markdownContent : activeTab === "json" ? jsonContent : badgeContent;

  async function handleCopy() {
    await navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const filename = `${result.repoFullName.replace("/", "-")}-architecture-report.${
      activeTab === "json" ? "json" : "md"
    }`;
    const mimeType = activeTab === "json" ? "application/json" : "text/markdown";
    const blob = new Blob([currentText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-in">
      <div className="card w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-[var(--surface-border)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-border)] bg-[var(--surface-elevated)]">
          <div className="flex items-center gap-2">
            <ShareIcon size={18} className="text-[var(--accent-primary)]" />
            <h2 className="font-semibold text-lg text-[var(--content-primary)]">
              Export Analysis Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--content-muted)] hover:text-[var(--content-primary)] hover:bg-[var(--surface-hover)] transition-base"
          >
            <X size={18} />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--surface-border)] bg-[var(--surface-base)]">
          <button
            onClick={() => setActiveTab("md")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono transition-base ${
              activeTab === "md"
                ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] border border-[var(--accent-primary)]"
                : "text-[var(--content-secondary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <FileText size={13} />
            Markdown (.md)
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono transition-base ${
              activeTab === "json"
                ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] border border-[var(--accent-primary)]"
                : "text-[var(--content-secondary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Code2 size={13} />
            JSON Export
          </button>
          <button
            onClick={() => setActiveTab("badge")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono transition-base ${
              activeTab === "badge"
                ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] border border-[var(--accent-primary)]"
                : "text-[var(--content-secondary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <ShieldCheck size={13} />
            README Badge
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-[var(--radius-sm)] text-xs text-[var(--content-primary)] transition-base font-mono"
            >
              {copied ? <Check size={13} className="text-[var(--status-success)]" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            {activeTab !== "badge" && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white rounded-[var(--radius-sm)] text-xs font-semibold transition-base"
              >
                <Download size={13} />
                Download
              </button>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-auto p-6 bg-[var(--surface-base)]">
          <pre className="code-block text-xs whitespace-pre-wrap font-mono leading-relaxed select-all">
            {currentText}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ShareIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
