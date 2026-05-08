"use client";

import { useState } from "react";
import { AnalysisTone, DecisionMode, DecisionOutput } from "@/types";
import { cn } from "@/lib/utils";
import { Zap, Gauge, Brain, GitBranch, ChevronDown } from "lucide-react";

const MODES: { value: DecisionMode; label: string; desc: string; icon: any; color: string }[] = [
  { value: "micro", label: "Quick", desc: "< 30 sec", icon: Gauge, color: "text-emerald-400" },
  { value: "standard", label: "Standard", desc: "Balanced", icon: Zap, color: "text-brand-soft" },
  { value: "deep", label: "Deep", desc: "Life decisions", icon: Brain, color: "text-amber-400" },
  { value: "simulate", label: "Simulate", desc: "What-if", icon: GitBranch, color: "text-sky-400" },
];

const TONES: { value: AnalysisTone; label: string }[] = [
  { value: "logical", label: "🧠 Logical" },
  { value: "aggressive", label: "⚡ Bold" },
  { value: "safe", label: "🛡 Safe" },
];

const EXAMPLES = [
  "Should I quit my job to start a company? I have $40k saved and a family to support.",
  "Should I move to a new city for a higher-paying job, leaving friends and family behind?",
  "Should I go to the gym today even though I'm tired and have a lot of work?",
  "Should I invest $10k in index funds now or wait for the market to dip?",
];

interface Props {
  onResult: (data: { output: DecisionOutput; decisionId?: string | null; shareToken?: string | null }) => void;
  onLoading: (v: boolean) => void;
}

export default function DecisionForm({ onResult, onLoading }: Props) {
  const [situation, setSituation] = useState("");
  const [mode, setMode] = useState<DecisionMode>("standard");
  const [tone, setTone] = useState<AnalysisTone>("logical");
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const valid = situation.trim().length >= 10;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    onLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, tone, mode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Analysis failed"); return; }
      onResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Mode selector */}
      <div className="grid grid-cols-4 gap-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 rounded-xl border transition-all duration-150 text-center",
                active
                  ? "border-brand/40 bg-brand/10"
                  : "border-[var(--border)] bg-surface-2 hover:border-[var(--border-strong)]"
              )}
            >
              <Icon size={14} className={active ? m.color : "text-[#5a5a6e]"} />
              <span className={cn("text-[11px] font-bold", active ? "text-[#f0f0f5]" : "text-[#5a5a6e]")}>
                {m.label}
              </span>
              <span className="text-[9px] text-[#5a5a6e]">{m.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder={
            mode === "micro"
              ? "Quick decision? Describe it in a sentence..."
              : mode === "simulate"
              ? "What situation do you want to simulate? e.g. \"What if I switch careers?\""
              : "Describe your situation. Include context, constraints, what matters to you..."
          }
          rows={mode === "micro" ? 3 : mode === "deep" ? 8 : 5}
          maxLength={3000}
          className="input resize-none leading-relaxed"
        />
        <span className="absolute bottom-3 right-3 text-[10px] text-[#5a5a6e] font-mono">
          {situation.length}/3000
        </span>
      </div>

      {error && <p className="text-rose-400 text-sm">{error}</p>}

      {/* Examples */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.slice(0, mode === "micro" ? 2 : 3).map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSituation(ex)}
            className="text-[11px] text-[#5a5a6e] hover:text-[#9494a8] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-lg px-3 py-1.5 transition-all"
          >
            {ex.slice(0, 45)}…
          </button>
        ))}
      </div>

      {/* Advanced toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-1.5 text-xs text-[#5a5a6e] hover:text-[#9494a8] transition-colors"
        >
          <ChevronDown size={12} className={cn("transition-transform", showOptions && "rotate-180")} />
          Analysis tone
        </button>
        {showOptions && (
          <div className="mt-3 flex gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                  tone === t.value
                    ? "border-brand/40 bg-brand/10 text-[#f0f0f5]"
                    : "border-[var(--border)] text-[#5a5a6e] hover:border-[var(--border-strong)]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!valid || loading}
        className={cn(
          "w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200",
          valid && !loading
            ? "bg-brand hover:bg-brand-soft text-white shadow-lg shadow-brand/20"
            : "bg-surface-3 text-[#5a5a6e] cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Zap size={14} fill="white" />
            {mode === "micro" ? "Quick Decide" : mode === "simulate" ? "Run Simulation" : "Analyze Decision"}
          </>
        )}
      </button>
    </form>
  );
}
