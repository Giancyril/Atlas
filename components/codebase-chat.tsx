"use client";

import { useState, useRef, useEffect } from "react";
import { AnalysisData, ChatMessage, ChatResponse } from "@/types";
import { Send, Bot, User, Sparkles, Loader2, FileCode, ArrowRight } from "lucide-react";

interface Props {
  analysisData: AnalysisData;
  repoFullName: string;
  commitSha: string;
}

const STARTER_QUESTIONS = [
  "How is data routed & processed in this repo?",
  "Where are configuration settings & env vars defined?",
  "How do I add a new feature or endpoint?",
  "What design patterns does this codebase rely on?",
];

export default function CodebaseChat({ analysisData, repoFullName, commitSha }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `Hello! I'm your AI codebase assistant for **${repoFullName}**. Ask me any technical question about this codebase's architecture, patterns, or file structure!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend(questionText?: string) {
    const text = (questionText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setIsLoading(true);
    setSuggestedFollowups([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoFullName,
          commitSha,
          analysisData,
          messages: messages.map((m) => ({ sender: m.sender, text: m.text })),
          question: text,
        }),
      });

      const data: ChatResponse = await res.json();

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const assistantMsg: ChatMessage = {
        id: "assistant-" + Date.now(),
        sender: "assistant",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations: data.citations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (data.suggestedFollowups?.length) {
        setSuggestedFollowups(data.suggestedFollowups);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "error-" + Date.now(),
          sender: "assistant",
          text: "Sorry, I encountered an issue answering your question. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card flex flex-col h-[650px] overflow-hidden border-[var(--surface-border)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[var(--surface-border)] bg-[var(--surface-elevated)]">
        <div className="w-7 h-7 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-primary)] flex items-center justify-center text-[var(--accent-primary)]">
          <Bot size={16} />
        </div>
        <div>
          <h2 className="font-semibold text-sm text-[var(--content-primary)] flex items-center gap-1.5">
            Codebase Assistant
            <span className="badge badge-accent text-[10px]">Gemini 1.5</span>
          </h2>
          <p className="text-xs text-[var(--content-muted)] font-mono">
            Contextual Q&amp;A for {repoFullName}
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-auto p-6 space-y-4 bg-[var(--surface-base)]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                m.sender === "user"
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-[var(--accent-primary)]"
              }`}
            >
              {m.sender === "user" ? <User size={14} /> : <Sparkles size={14} />}
            </div>

            <div
              className={`max-w-[80%] rounded-[var(--radius-md)] p-4 text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-[var(--accent-primary)] text-white"
                  : "card-elevated text-[var(--content-primary)]"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* File Citations */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--surface-border)]">
                  <p className="text-[11px] font-mono text-[var(--content-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <FileCode size={11} />
                    Cited Files:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {m.citations.map((c) => (
                      <a
                        key={c}
                        href={`https://github.com/${repoFullName}/blob/${commitSha}/${c}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-xs px-2 py-0.5 rounded bg-[var(--surface-base)] border border-[var(--surface-border)] text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                      >
                        {c}
                        <ArrowRight size={9} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <span className="block text-[10px] text-[var(--content-muted)] mt-1 text-right font-mono">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--accent-primary)]">
              <Loader2 size={14} className="animate-spin" />
            </div>
            <div className="card-elevated px-4 py-2 text-xs text-[var(--content-secondary)] animate-pulse-slow">
              Thinking about your question…
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Followups */}
      {suggestedFollowups.length > 0 && (
        <div className="px-6 py-2 border-t border-[var(--surface-border)] bg-[var(--surface-elevated)] flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--content-muted)] font-mono">Suggested:</span>
          {suggestedFollowups.map((f) => (
            <button
              key={f}
              onClick={() => handleSend(f)}
              className="badge hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-base cursor-pointer text-xs"
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Starter Questions (if only welcome message) */}
      {messages.length === 1 && (
        <div className="px-6 py-3 border-t border-[var(--surface-border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--content-muted)] mb-2 font-mono">Suggested questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="badge hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-base cursor-pointer text-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-[var(--surface-border)] bg-[var(--surface-card)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this repository…"
            className="flex-1 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--content-primary)] placeholder:text-[var(--content-muted)] outline-none min-w-0"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white rounded-[var(--radius-md)] transition-base disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
