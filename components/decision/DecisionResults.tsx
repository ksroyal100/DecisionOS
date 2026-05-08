"use client";

import { useState } from "react";
import { DecisionOutput, RiskLevel } from "@/types";
import { cn, riskBg, riskColor } from "@/lib/utils";
import {
  CheckCircle2, XCircle, AlertTriangle, Lightbulb,
  ListChecks, TrendingUp, TrendingDown, Clock, Zap,
  GitBranch, Shield, Eye, Copy, Check, Share2,
} from "lucide-react";

interface Props {
  output: DecisionOutput;
  shareToken?: string | null;
  decisionId?: string | null;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={cn("flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md border transition-all",
        copied ? "border-emerald-400/30 text-emerald-400 bg-emerald-400/10" : "border-[var(--border)] text-[#5a5a6e] hover:text-[#9494a8]"
      )}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ShareBtn({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/share/${token}` : "";
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); }}
      className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
        copied ? "border-emerald-400/30 text-emerald-400 bg-emerald-400/10" : "border-[var(--border)] text-[#9494a8] hover:border-[var(--border-strong)]"
      )}
    >
      <Share2 size={12} />
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 75 ? "#34d399" : score >= 50 ? "#7c6dfa" : score >= 30 ? "#fbbf24" : "#fb7185";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/06 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
      <span className="font-mono text-xs font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

function RiskBar({ pct, label }: { pct: number; label: string }) {
  const color = pct < 30 ? "#34d399" : pct < 60 ? "#fbbf24" : "#fb7185";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1 bg-white/06 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{pct}%</span>
      <span className="text-[10px] text-[#5a5a6e] flex-1">{label}</span>
    </div>
  );
}

const effortColors: Record<string, string> = {
  Low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  High: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const emotionColors: Record<string, string> = {
  Positive: "text-emerald-400",
  Neutral: "text-[#9494a8]",
  Negative: "text-rose-400",
  Mixed: "text-amber-400",
};

const biasIcons: Record<string, string> = {
  fear: "😰", overconfidence: "🫣", peer_pressure: "👥",
  status_quo: "🔒", sunk_cost: "💸",
};

export default function DecisionResults({ output, shareToken, decisionId }: Props) {
  const [activeOption, setActiveOption] = useState(0);

  const fullText = `DECIDEOS ANALYSIS\n\nSUMMARY\n${output.summary}\n\nRECOMMENDATION\n${output.recommendation}\n\nACTION PLAN\n${output.action_plan.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("pill border", riskBg(output.risk))}>
            <AlertTriangle size={9} /> {output.risk} Risk
          </span>
          {output.mode === "deep" && (
            <span className="pill border border-amber-400/20 text-amber-400 bg-amber-400/10">
              <Brain size={9} /> Deep Analysis
            </span>
          )}
          {output.mode === "simulate" && (
            <span className="pill border border-sky-400/20 text-sky-400 bg-sky-400/10">
              <GitBranch size={9} /> Simulation
            </span>
          )}
          {output.emotional_context && (
            <span className="pill border border-white/10 text-[#9494a8] bg-white/04">
              💭 {output.emotional_context}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CopyBtn text={fullText} />
          {shareToken && <ShareBtn token={shareToken} />}
        </div>
      </div>

      {/* ── Bias warnings ── */}
      {output.bias_warnings?.length > 0 && (
        <div className="card p-4 border-amber-400/20 bg-amber-400/05">
          <p className="section-label mb-2">⚠ Bias Detected</p>
          <div className="space-y-1.5">
            {output.bias_warnings.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span>{biasIcons[b.type] ?? "⚡"}</span>
                <div>
                  <span className="text-amber-400 font-semibold capitalize">{b.type.replace("_", " ")}: </span>
                  <span className="text-[#9494a8]">{b.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Summary ── */}
      <div className="card p-5">
        <p className="section-label mb-2">Situation Summary</p>
        <p className="text-[#9494a8] text-sm leading-relaxed">{output.summary}</p>
      </div>

      {/* ── Option tabs ── */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-[var(--border)]">
          {output.analysis.map((a, i) => (
            <button
              key={i}
              onClick={() => setActiveOption(i)}
              className={cn(
                "flex-1 py-3 text-xs font-bold transition-all",
                activeOption === i
                  ? "bg-brand/10 text-brand-soft border-b-2 border-brand"
                  : "text-[#5a5a6e] hover:text-[#9494a8]"
              )}
            >
              Option {String.fromCharCode(65 + i)}
            </button>
          ))}
        </div>

        {output.analysis[activeOption] && (() => {
          const opt = output.analysis[activeOption];
          return (
            <div className="p-5 space-y-4 animate-fade-in">
              <h3 className="text-[#f0f0f5] font-bold text-sm">{opt.option}</h3>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <RiskBar pct={opt.risk_pct} label="risk" />
                <span className={cn("pill border text-[10px]", effortColors[opt.effort_level] ?? "")}>
                  {opt.effort_level} effort
                </span>
                <span className={cn("text-[11px] font-semibold", emotionColors[opt.emotional_impact])}>
                  {opt.emotional_impact} impact
                </span>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span className="section-label text-emerald-400">Pros</span>
                  </div>
                  <ul className="space-y-1.5">
                    {opt.pros.map((p, i) => (
                      <li key={i} className="text-xs text-[#9494a8] flex gap-2">
                        <span className="text-emerald-400/50 flex-shrink-0">›</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <XCircle size={11} className="text-rose-400" />
                    <span className="section-label text-rose-400">Cons</span>
                  </div>
                  <ul className="space-y-1.5">
                    {opt.cons.map((c, i) => (
                      <li key={i} className="text-xs text-[#9494a8] flex gap-2">
                        <span className="text-rose-400/50 flex-shrink-0">›</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Timeline */}
              <div className="divider" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={11} className="text-sky-400" />
                    <span className="section-label text-sky-400">Short-term</span>
                  </div>
                  <p className="text-xs text-[#9494a8]">{opt.short_term_impact}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp size={11} className="text-brand-soft" />
                    <span className="section-label text-brand-soft">Long-term</span>
                  </div>
                  <p className="text-xs text-[#9494a8]">{opt.long_term_impact}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── Recommendation ── */}
      <div className="card p-5 border-brand/20 bg-brand/05">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-brand-soft flex-shrink-0" />
            <span className="section-label text-brand-soft">AI Recommendation</span>
          </div>
        </div>
        <p className="text-[#f0f0f5] text-sm font-semibold leading-relaxed mb-3">{output.recommendation}</p>
        <div>
          <p className="section-label mb-1.5">Confidence</p>
          <ConfidenceBar score={output.confidence_score} />
        </div>
      </div>

      {/* ── Regret Minimization ── */}
      <div className="card p-5 border-rose-400/15">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={14} className="text-rose-400" />
          <span className="section-label text-rose-400">Regret Minimization</span>
        </div>
        <p className="text-[#9494a8] text-xs mb-3 italic">"{output.regret_score?.framing}"</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-[#5a5a6e] mb-1.5">Regret in 1 year if NOT done</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/06 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-rose-400" style={{ width: `${output.regret_score?.one_year}%` }} />
              </div>
              <span className="text-xs font-mono text-rose-400">{output.regret_score?.one_year}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[#5a5a6e] mb-1.5">Regret in 5 years if NOT done</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/06 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-rose-400" style={{ width: `${output.regret_score?.five_year}%` }} />
              </div>
              <span className="text-xs font-mono text-rose-400">{output.regret_score?.five_year}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Simulation (if present) ── */}
      {output.simulation && (
        <div className="card p-5 border-sky-400/15">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={14} className="text-sky-400" />
            <span className="section-label text-sky-400">Future Simulation</span>
            <span className="pill border border-sky-400/20 text-sky-400 bg-sky-400/10 ml-auto">
              {output.simulation.probability_success}% success
            </span>
          </div>
          <div className="space-y-3">
            <div className="card-2 p-3">
              <p className="text-[10px] font-bold text-emerald-400 mb-1">🌟 Best Case</p>
              <p className="text-xs text-[#9494a8]">{output.simulation.best_case}</p>
            </div>
            <div className="card-2 p-3">
              <p className="text-[10px] font-bold text-[#9494a8] mb-1">📊 Most Likely</p>
              <p className="text-xs text-[#9494a8]">{output.simulation.most_likely}</p>
            </div>
            <div className="card-2 p-3">
              <p className="text-[10px] font-bold text-rose-400 mb-1">⚠ Worst Case</p>
              <p className="text-xs text-[#9494a8]">{output.simulation.worst_case}</p>
            </div>
          </div>
          <p className="text-[10px] text-[#5a5a6e] mt-3">
            Expected timeline: ~{output.simulation.timeline_months} months
          </p>
        </div>
      )}

      {/* ── Action Plan ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListChecks size={14} className="text-brand-soft" />
            <span className="section-label">Action Plan</span>
          </div>
          <CopyBtn text={output.action_plan.map((s, i) => `${i + 1}. ${s}`).join("\n")} />
        </div>
        <ol className="space-y-2.5">
          {output.action_plan.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center text-[10px] font-bold text-brand-soft">
                {i + 1}
              </span>
              <p className="text-sm text-[#9494a8] pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Thinking style hint ── */}
      {output.thinking_style_hint && (
        <div className="card p-4 flex items-center gap-3">
          <Shield size={14} className="text-brand-soft flex-shrink-0" />
          <div>
            <p className="section-label mb-0.5">Thinking Pattern Detected</p>
            <p className="text-xs text-[#9494a8]">
              This decision shows signs of a{" "}
              <span className="text-brand-soft font-semibold capitalize">
                {output.thinking_style_hint}
              </span>{" "}
              thinking style. DecideOS adapts future analyses to match.
            </p>
          </div>
        </div>
      )}

      {/* ── Follow-up prompt (if saved) ── */}
      {decisionId && (
        <div className="card p-4 border-brand/15 bg-brand/05 text-center">
          <p className="text-xs text-[#9494a8] mb-1">
            We'll check in with you in 7 days.
          </p>
          <p className="text-[11px] text-[#5a5a6e]">
            Did you follow this decision? Track it in{" "}
            <a href="/history" className="text-brand-soft hover:underline">History</a>.
          </p>
        </div>
      )}
    </div>
  );
}

// Need to import Brain locally
function Brain({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.6A3 3 0 0 1 6 10a2.5 2.5 0 0 1 3.5-2.46z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.6A3 3 0 0 0 18 10a2.5 2.5 0 0 0-3.5-2.46z"/>
    </svg>
  );
}
