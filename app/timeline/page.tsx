"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/layout/Nav";
import { SavedDecision } from "@/types";
import {
  cn,
  riskColor,
  riskBg,
  formatDate,
  truncate,
  outcomeEmoji,
  outcomeColor,
} from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { GitBranch, Clock, CheckCircle2, XCircle, Minus } from "lucide-react";

export default function TimelinePage() {
  const [decisions, setDecisions] = useState<SavedDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SavedDecision | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowserClient();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { setError("Sign in to view your timeline"); setLoading(false); return; }
      try {
        const res = await fetch("/api/outcome", {
          headers: { authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) { const d = await res.json(); setDecisions(d.decisions ?? []); }
        else setError("Failed to load");
      } catch { setError("Network error"); }
      setLoading(false);
    })();
  }, []);

  // Group by month
  const grouped = decisions.reduce<Record<string, SavedDecision[]>>((acc, d) => {
    const key = new Date(d.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const followIcon = (status: SavedDecision["follow_status"]) => {
    if (status === "followed") return <CheckCircle2 size={11} className="text-emerald-400" />;
    if (status === "ignored") return <XCircle size={11} className="text-rose-400" />;
    if (status === "partial") return <Minus size={11} className="text-amber-400" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-void">
      <Nav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch size={13} className="text-brand-soft" />
            <span className="section-label text-brand-soft">Decision Timeline</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#f0f0f5]">
            Your Life in Decisions
          </h1>
          <p className="text-sm text-[#5a5a6e] mt-1">
            Every choice you've analyzed — and what happened.
          </p>
        </div>

        {loading && (
          <div className="space-y-8">
            {[...Array(3)].map((_, g) => (
              <div key={g}>
                <div className="h-4 w-24 shimmer rounded mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="card h-16 shimmer" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="card p-12 text-center">
            <p className="text-[#9494a8] mb-4">{error}</p>
            <a href="/auth" className="btn-brand">Sign In</a>
          </div>
        )}

        {!loading && !error && decisions.length === 0 && (
          <div className="card p-12 text-center">
            <Clock size={28} className="text-[#5a5a6e] mx-auto mb-3" />
            <p className="text-[#9494a8] text-sm mb-4">No decisions yet. Start building your timeline.</p>
            <a href="/dashboard" className="btn-brand">Analyze a Decision</a>
          </div>
        )}

        {/* Timeline */}
        {!loading && !error && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[var(--border)]" />

            <div className="space-y-10">
              {Object.entries(grouped).map(([month, group], gi) => (
                <div key={month} className="animate-fade-up" style={{ animationDelay: `${gi * 80}ms` }}>
                  {/* Month label */}
                  <div className="flex items-center gap-3 mb-4 pl-0">
                    <div className="w-6 h-6 rounded-full bg-surface-3 border border-[var(--border-strong)] flex items-center justify-center flex-shrink-0 z-10 relative">
                      <Clock size={10} className="text-[#5a5a6e]" />
                    </div>
                    <span className="text-xs font-bold text-[#5a5a6e] uppercase tracking-widest">{month}</span>
                    <span className="text-[11px] text-[#5a5a6e]">— {group.length} decision{group.length > 1 ? "s" : ""}</span>
                  </div>

                  {/* Decisions in this month */}
                  <div className="pl-10 space-y-2">
                    {group.map((dec) => (
                      <button
                        key={dec.id}
                        onClick={() => setSelected(selected?.id === dec.id ? null : dec)}
                        className={cn(
                          "w-full text-left card card-hover p-4 transition-all duration-150",
                          selected?.id === dec.id && "border-brand/30 bg-brand/05"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Risk dot */}
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: riskColor(dec.output.risk), boxShadow: `0 0 6px ${riskColor(dec.output.risk)}60` }}
                          />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#f0f0f5] font-medium leading-snug mb-1.5">
                              {truncate(dec.situation, 100)}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("pill border text-[9px]", riskBg(dec.output.risk))}>
                                {dec.output.risk} Risk
                              </span>
                              {dec.follow_status && (
                                <span className="flex items-center gap-1 text-[10px] text-[#5a5a6e]">
                                  {followIcon(dec.follow_status)}
                                  {dec.follow_status}
                                </span>
                              )}
                              {dec.outcome_rating && (
                                <span className={cn("text-[11px] font-semibold", outcomeColor(dec.outcome_rating))}>
                                  {outcomeEmoji(dec.outcome_rating)} {dec.outcome_rating}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[11px] text-[#5a5a6e] flex-shrink-0">{formatDate(dec.created_at)}</span>
                        </div>

                        {/* Expanded detail */}
                        {selected?.id === dec.id && (
                          <div className="mt-4 pt-4 border-t border-[var(--border)] animate-fade-in">
                            <p className="text-xs text-[#5a5a6e] mb-2">Recommendation:</p>
                            <p className="text-sm text-[#9494a8] leading-relaxed mb-3">
                              {dec.output.recommendation}
                            </p>
                            {dec.outcome_notes && (
                              <div className="card-2 p-3">
                                <p className="section-label mb-1">What happened</p>
                                <p className="text-xs text-[#9494a8]">{dec.outcome_notes}</p>
                              </div>
                            )}
                            {dec.output.action_plan?.length > 0 && (
                              <div className="mt-3">
                                <p className="section-label mb-2">Action Plan</p>
                                <ol className="space-y-1">
                                  {dec.output.action_plan.map((step, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-[#5a5a6e]">
                                      <span className="text-brand-soft flex-shrink-0">{i + 1}.</span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            <a
                              href="/history"
                              className="mt-3 inline-flex items-center gap-1 text-[11px] text-brand-soft hover:underline"
                            >
                              Full analysis + track outcome →
                            </a>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
