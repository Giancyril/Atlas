"use client";

import { useEffect, useRef, useState } from "react";
import { ArchitectureSummary } from "@/types";
import { Maximize2, X, Download, Copy, Check, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  diagram: string;
  summary: ArchitectureSummary;
}

export default function DiagramViewer({ diagram, summary }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    renderDiagram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram]);

  async function renderDiagram() {
    if (!containerRef.current) return;
    setRenderError(null);

    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#1a2438",
          primaryTextColor: "#e8edf5",
          primaryBorderColor: "#1e2a3e",
          lineColor: "#4a5a72",
          secondaryColor: "#0f1623",
          tertiaryColor: "#141d2e",
          background: "#090d16",
          mainBkg: "#0f1623",
          nodeBorder: "#1e2a3e",
          clusterBkg: "#141d2e",
          titleColor: "#e8edf5",
          edgeLabelBackground: "#0f1623",
          attributeBackgroundColorEven: "#141d2e",
          attributeBackgroundColorOdd: "#0f1623",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
        },
        securityLevel: "loose",
      });

      const id = "mermaid-diagram-" + Date.now();
      const { svg } = await mermaid.render(id, diagram);
      containerRef.current.innerHTML = svg;
    } catch (err: unknown) {
      console.error("[DiagramViewer] Mermaid render error:", err);
      setRenderError("Diagram could not be rendered. The raw Mermaid syntax is shown below.");
      if (containerRef.current) containerRef.current.innerHTML = "";
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadSvg() {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "architecture-diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Architecture summary sidebar */}
      <div className="card p-6">
        <h2 className="font-semibold text-[var(--content-primary)] mb-1 text-sm uppercase tracking-wider text-[var(--content-muted)]">
          Architecture Summary
        </h2>
        <p className="text-sm text-[var(--content-secondary)] mb-4 leading-relaxed">
          {summary.overview}
        </p>

        <div className="mb-4">
          <p className="text-xs text-[var(--content-muted)] uppercase tracking-wider mb-2">
            Project Type
          </p>
          <span className="badge badge-accent">{summary.projectType}</span>
        </div>

        <div className="mb-4">
          <p className="text-xs text-[var(--content-muted)] uppercase tracking-wider mb-2">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.techStack.map((t) => (
              <span key={t} className="badge text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--content-muted)] uppercase tracking-wider mb-2">
            Core Concepts
          </p>
          <ul className="space-y-1.5">
            {summary.coreConcepts.map((c) => (
              <li
                key={c}
                className="text-xs text-[var(--content-secondary)] flex items-start gap-1.5"
              >
                <span className="text-[var(--accent-primary)] mt-0.5">▸</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Diagram panel */}
      <div className="lg:col-span-2 card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--surface-border)] bg-[var(--surface-elevated)]">
          <span className="text-xs text-[var(--content-muted)] font-mono">
            architecture.mermaid
          </span>
          <div className="flex items-center gap-1">
            <ToolbarBtn onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))} title="Zoom out">
              <ZoomOut size={14} />
            </ToolbarBtn>
            <span className="text-xs text-[var(--content-muted)] w-10 text-center font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <ToolbarBtn onClick={() => setZoom((z) => Math.min(3, z + 0.2))} title="Zoom in">
              <ZoomIn size={14} />
            </ToolbarBtn>
            <div className="w-px h-4 bg-[var(--surface-border)] mx-1" />
            <ToolbarBtn onClick={handleCopy} title="Copy Mermaid source">
              {copied ? <Check size={14} className="text-[var(--status-success)]" /> : <Copy size={14} />}
            </ToolbarBtn>
            <ToolbarBtn onClick={handleDownloadSvg} title="Download SVG">
              <Download size={14} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => setIsFullscreen(true)} title="Fullscreen">
              <Maximize2 size={14} />
            </ToolbarBtn>
          </div>
        </div>

        {/* Diagram canvas */}
        <div className="overflow-auto p-6 min-h-[400px] bg-[var(--surface-base)] mermaid-container">
          {renderError ? (
            <div>
              <p className="text-sm text-[var(--status-warning)] mb-4">{renderError}</p>
              <pre className="code-block text-xs whitespace-pre-wrap">{diagram}</pre>
            </div>
          ) : (
            <div
              ref={containerRef}
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 200ms ease" }}
            />
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[var(--surface-base)] flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--surface-border)]">
            <span className="text-sm font-medium text-[var(--content-primary)]">
              Architecture Diagram — Fullscreen
            </span>
            <button
              id="close-fullscreen-btn"
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-[var(--content-secondary)] transition-base"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-8 mermaid-container">
            <div
              dangerouslySetInnerHTML={{
                __html: containerRef.current?.innerHTML ?? "",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--surface-hover)] transition-base"
    >
      {children}
    </button>
  );
}
