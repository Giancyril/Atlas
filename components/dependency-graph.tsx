"use client";

import { useState } from "react";
import { DependencySummary } from "@/types";
import { Box, Search, ExternalLink, ShieldAlert, Cpu, Layers } from "lucide-react";

interface Props {
  summary?: DependencySummary;
}

export default function DependencyGraph({ summary }: Props) {
  const [filterType, setFilterType] = useState<"all" | "direct" | "dev">("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!summary || summary.dependencies.length === 0) {
    return (
      <div className="card p-8 text-center text-[var(--content-muted)]">
        <Box size={24} className="mx-auto mb-2 opacity-50" />
        No package manifest dependencies detected for this repository.
      </div>
    );
  }

  const filteredDeps = summary.dependencies.filter((d) => {
    const matchesType = filterType === "all" || d.type === filterType;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.category && d.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Top summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Layers size={18} className="text-[var(--accent-primary)]" />}
          label="Manifest File"
          value={summary.manifestFile}
          sub={`Ecosystem: ${summary.ecosystem.toUpperCase()}`}
        />
        <StatCard
          icon={<Box size={18} className="text-[var(--status-success)]" />}
          label="Total Dependencies"
          value={summary.dependencies.length.toString()}
          sub="Direct & Dev"
        />
        <StatCard
          icon={<Cpu size={18} className="text-[var(--accent-secondary)]" />}
          label="Production (Direct)"
          value={summary.directCount.toString()}
          sub="Core runtime packages"
        />
        <StatCard
          icon={<ShieldAlert size={18} className="text-[var(--status-warning)]" />}
          label="Dev / Tooling"
          value={summary.devCount.toString()}
          sub="Build & test tools"
        />
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {(["all", "direct", "dev"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono capitalize transition-base ${
                filterType === type
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--surface-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
              }`}
            >
              {type === "all" ? "All" : type === "direct" ? "Production" : "Development"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-[var(--radius-sm)] w-full md:w-64">
          <Search size={14} className="text-[var(--content-muted)] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter dependencies…"
            className="bg-transparent text-xs text-[var(--content-primary)] placeholder:text-[var(--content-muted)] font-mono outline-none w-full"
          />
        </div>
      </div>

      {/* Dependencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredDeps.map((dep) => (
          <div
            key={dep.name}
            className="card p-4 hover:border-[var(--accent-primary)] transition-base group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="mono text-sm font-semibold text-[var(--content-primary)] group-hover:text-[var(--accent-primary)] transition-base truncate">
                {dep.name}
              </span>
              <a
                href={
                  summary.ecosystem === "npm"
                    ? `https://www.npmjs.com/package/${dep.name}`
                    : `https://crates.io/crates/${dep.name}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--content-muted)] hover:text-[var(--accent-primary)] transition-base"
              >
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <code className="text-xs text-[var(--content-muted)] font-mono bg-[var(--surface-elevated)] px-2 py-0.5 rounded">
                {dep.version}
              </code>
              <span
                className={`badge text-[10px] ${
                  dep.type === "direct" ? "badge-accent" : "text-[var(--content-muted)]"
                }`}
              >
                {dep.type === "direct" ? "Prod" : "Dev"}
              </span>
              {dep.category && (
                <span className="text-[10px] text-[var(--content-muted)] ml-auto font-mono truncate">
                  {dep.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs uppercase tracking-wider text-[var(--content-muted)] font-mono">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-[var(--content-primary)] mono mb-0.5">{value}</p>
      <p className="text-xs text-[var(--content-secondary)]">{sub}</p>
    </div>
  );
}
