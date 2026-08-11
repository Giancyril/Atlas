"use client";

import { useState } from "react";
import { GitBranch, Tag, ChevronDown, Check, Loader2 } from "lucide-react";

export interface BranchRef {
  name: string;
  type: "branch" | "tag";
  sha: string;
}

interface Props {
  refs: BranchRef[];
  selectedRef: string;
  onSelect: (ref: BranchRef) => void;
  loading?: boolean;
}

export default function BranchRefSelector({ refs, selectedRef, onSelect, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const branches = refs.filter((r) => r.type === "branch" && r.name.toLowerCase().includes(filter.toLowerCase()));
  const tags = refs.filter((r) => r.type === "tag" && r.name.toLowerCase().includes(filter.toLowerCase()));

  const current = refs.find((r) => r.name === selectedRef);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-[var(--radius-sm)] text-sm text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-base font-mono disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : current?.type === "tag" ? (
          <Tag size={13} />
        ) : (
          <GitBranch size={13} />
        )}
        <span className="max-w-[120px] truncate">{selectedRef || "Select ref…"}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 w-72 card border-[var(--surface-border)] shadow-xl overflow-hidden animate-slide-in">
          {/* Search filter */}
          <div className="p-2 border-b border-[var(--surface-border)]">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter branches and tags…"
              autoFocus
              className="w-full bg-[var(--surface-base)] px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono text-[var(--content-primary)] placeholder:text-[var(--content-muted)] outline-none border border-[var(--surface-border)]"
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {/* Branches */}
            {branches.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--content-muted)] bg-[var(--surface-elevated)]">
                  Branches ({branches.length})
                </div>
                {branches.map((ref) => (
                  <RefRow
                    key={ref.name}
                    refItem={ref}
                    isSelected={ref.name === selectedRef}
                    onClick={() => { onSelect(ref); setOpen(false); setFilter(""); }}
                  />
                ))}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--content-muted)] bg-[var(--surface-elevated)]">
                  Tags ({tags.length})
                </div>
                {tags.map((ref) => (
                  <RefRow
                    key={ref.name}
                    refItem={ref}
                    isSelected={ref.name === selectedRef}
                    onClick={() => { onSelect(ref); setOpen(false); setFilter(""); }}
                  />
                ))}
              </div>
            )}

            {branches.length === 0 && tags.length === 0 && (
              <p className="p-4 text-xs text-[var(--content-muted)] text-center font-mono">No refs match "{filter}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RefRow({ refItem, isSelected, onClick }: { refItem: BranchRef; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left transition-base hover:bg-[var(--surface-hover)] ${
        isSelected ? "text-[var(--accent-primary)]" : "text-[var(--content-secondary)]"
      }`}
    >
      {refItem.type === "tag" ? (
        <Tag size={12} className="text-[var(--status-warning)] shrink-0" />
      ) : (
        <GitBranch size={12} className="text-[var(--accent-primary)] shrink-0" />
      )}
      <span className="flex-1 truncate">{refItem.name}</span>
      <span className="text-[10px] text-[var(--content-muted)]">{refItem.sha.slice(0, 7)}</span>
      {isSelected && <Check size={12} className="text-[var(--accent-primary)] shrink-0" />}
    </button>
  );
}
