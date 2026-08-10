"use client";

import { useState } from "react";
import { CodeExplanations, ModuleExplanation } from "@/types";
import { ChevronRight, Folder, FileCode, ExternalLink } from "lucide-react";

interface Props {
  explanations: CodeExplanations;
  repoFullName: string;
  commitSha: string;
}

export default function CodeExplainer({ explanations, repoFullName, commitSha }: Props) {
  const [activeModule, setActiveModule] = useState<ModuleExplanation | null>(
    explanations.modules[0] ?? null
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set([explanations.modules[0]?.path ?? ""])
  );

  function toggleModule(path: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar tree */}
      <div className="card p-4 h-fit">
        <h2 className="text-xs uppercase tracking-wider text-[var(--content-muted)] mb-3 px-2">
          Module Tree
        </h2>
        <div className="space-y-0.5">
          {explanations.modules.map((mod) => (
            <div key={mod.path}>
              <button
                onClick={() => {
                  setActiveModule(mod);
                  toggleModule(mod.path);
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-[var(--radius-sm)] text-left transition-base group ${
                  activeModule?.path === mod.path
                    ? "bg-[var(--accent-glow)] text-[var(--accent-primary)]"
                    : "text-[var(--content-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--content-primary)]"
                }`}
              >
                <ChevronRight
                  size={12}
                  className={`shrink-0 transition-transform duration-200 ${
                    expandedModules.has(mod.path) ? "rotate-90" : ""
                  }`}
                />
                <Folder size={14} className="shrink-0" />
                <span className="text-sm mono truncate">{mod.path || mod.name}</span>
              </button>

              {/* Files nested under module */}
              {expandedModules.has(mod.path) && mod.files.length > 0 && (
                <div className="ml-6 mt-0.5 space-y-0.5 animate-slide-in">
                  {mod.files.map((file) => (
                    <a
                      key={file.path}
                      href={file.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-[var(--content-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition-base group"
                    >
                      <FileCode size={12} className="shrink-0" />
                      <span className="text-xs mono truncate">{file.path.split("/").pop()}</span>
                      <ExternalLink
                        size={10}
                        className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-base"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content panel */}
      <div className="lg:col-span-2 space-y-4">
        {activeModule ? (
          <div className="animate-slide-in">
            <div className="card p-6 mb-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-semibold text-[var(--content-primary)] text-lg mb-0.5">
                    {activeModule.name}
                  </h2>
                  <code className="text-xs text-[var(--content-muted)] font-mono bg-[var(--surface-elevated)] px-2 py-0.5 rounded">
                    {activeModule.path}
                  </code>
                </div>
              </div>
              <p className="text-sm text-[var(--content-secondary)] mb-2 leading-relaxed">
                {activeModule.description}
              </p>
              <p className="text-sm text-[var(--content-secondary)] leading-relaxed">
                <span className="text-[var(--content-muted)] font-medium">Purpose: </span>
                {activeModule.purpose}
              </p>
            </div>

            {/* Key files */}
            <div className="space-y-3">
              {activeModule.files.map((file) => (
                <div key={file.path} className="card-elevated p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCode size={14} className="text-[var(--accent-primary)]" />
                    <a
                      href={file.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                    >
                      {file.path}
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <p className="text-sm text-[var(--content-secondary)] mb-2">{file.purpose}</p>
                  {file.keyExports && file.keyExports.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {file.keyExports.map((exp) => (
                        <code
                          key={exp}
                          className="text-xs bg-[var(--surface-base)] border border-[var(--surface-border)] text-[var(--content-secondary)] px-2 py-0.5 rounded font-mono"
                        >
                          {exp}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center text-[var(--content-muted)]">
            Select a module from the tree to explore its code explanations.
          </div>
        )}

        {/* Spotlight files */}
        {explanations.spotlightFiles.length > 0 && (
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--content-primary)] mb-4 text-sm uppercase tracking-wider text-[var(--content-muted)]">
              🔦 Spotlight Files
            </h3>
            <div className="space-y-3">
              {explanations.spotlightFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--surface-border)]"
                >
                  <FileCode size={15} className="text-[var(--accent-secondary)] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <a
                      href={file.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-sm text-[var(--accent-secondary)] hover:underline flex items-center gap-1"
                    >
                      {file.path}
                      <ExternalLink size={11} />
                    </a>
                    <p className="text-xs text-[var(--content-secondary)] mt-1">{file.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
