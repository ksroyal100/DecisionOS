"use client";

import { useState, useEffect, useCallback } from "react";
import { SavedDecision } from "@/types";
import { cn, riskBg, riskColor, formatRelative, truncate, outcomeEmoji, outcomeColor, daysUntil } from "@/lib/utils";
import Nav from "@/components/layout/Nav";
import DecisionResults from "@/components/decision/DecisionResults";
import OutcomeTracker from "@/components/decision/OutcomeTracker";
import { Clock, AlertTriangle, Filter, ChevronRight, Bell, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

type Filter = "all" | "pending_outcome" | "followed" | "ignored";

export default function HistoryPage() {
  const [decisions, setDecisions] = useState<SavedDecision[]>([]);
  const [selected, setSelected] = useState<SavedDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const { user, loading : authLoading } = useAuth();

  const load = useCallback(async () => {
  const sb = getSupabaseBrowserClient();

  setLoading(true);
  setError(null);

  // 🔥 STEP 1: ALWAYS wait for session properly
  const {
    data: { session },
  } = await sb.auth.getSession();

  // small safety retry (fixes refresh race condition)
  if (!session) {
    const {
      data: { session: retrySession },
    } = await sb.auth.getSession();

    if (!retrySession) {
      setError("Sign in to see your history");
      setLoading(false);
      return;
    }
  }

  const token = session?.access_token;

  try {
    const res = await fetch("/api/outcome", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      setError("Failed to load history");
      return;
    }

    const d = await res.json();
    setDecisions(d.decisions ?? []);
  } catch {
    setError("Network error");
  } finally {
    setLoading(false);
  }
}, []);

  // useEffect(() => { load(); }, [load]);
  useEffect(() => {
  if (user) load();
}, [user]);

  const filtered = decisions.filter((d) => {
    if (filter === "pending_outcome") return !d.outcome_rating;
    if (filter === "followed") return d.follow_status === "followed";
    if (filter === "ignored") return d.follow_status === "ignored";
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this decision?")) return;
    const sb = getSupabaseBrowserClient();
    const { data: { session } } = await sb.auth.getSession();
    await fetch(`/api/outcome?id=${id}`, { method: "DELETE", headers: { authorization: `Bearer ${session?.access_token ?? ""}` } });
    setDecisions((prev) => prev.filter((d) => d.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending_outcome", label: "Needs Feedback" },
    { value: "followed", label: "Followed" },
    { value: "ignored", label: "Ignored" },
  ];

  return (
    <div className="min-h-screen bg-void">
      <Nav />
      <main className="max-w-6xl mx-auto px-5 pt-24 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-black text-3xl text-[#f0f0f5]">Decision History</h1>
            <p className="text-sm text-[#5a5a6e] mt-1">{decisions.length} decisions made</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                filter === f.value
                  ? "border-brand/40 bg-brand/10 text-brand-soft"
                  : "border-[var(--border)] text-[#5a5a6e] hover:border-[var(--border-strong)]"
              )}
            >
              {f.label}
              {f.value === "pending_outcome" && decisions.filter((d) => !d.outcome_rating).length > 0 && (
                <span className="ml-1.5 bg-amber-400 text-void text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {decisions.filter((d) => !d.outcome_rating).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-20 shimmer" />
            ))}
          </div>
        )}

        {error && (
          <div className="card p-12 text-center">
            <p className="text-[#9494a8] mb-4">{error}</p>
            <a href="/auth" className="btn-brand">Sign In</a>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="card p-12 text-center">
            <Clock size={28} className="text-[#5a5a6e] mx-auto mb-3" />
            <p className="text-[#9494a8] text-sm">No decisions here yet.</p>
          </div>
        )}

        {!loading && !error && (
          <div className={cn("grid gap-5", selected ? "lg:grid-cols-[340px,1fr]" : "grid-cols-1")}>
            {/* List */}
            <div className="space-y-2">
              {filtered.map((dec) => {
                const due7 = daysUntil(dec.followup_7d_due);
                const isActive = selected?.id === dec.id;
                const needsFeedback = !dec.outcome_rating;
                return (
                  <button
                    key={dec.id}
                    onClick={() => setSelected(isActive ? null : dec)}
                    className={cn(
                      "w-full text-left card card-hover p-4 transition-all duration-150",
                      isActive && "border-brand/30 bg-brand/05"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#f0f0f5] font-medium leading-snug mb-2">
                          {truncate(dec.situation, 90)}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("pill border text-[9px]", riskBg(dec.output.risk))}>
                            {dec.output.risk}
                          </span>
                          {dec.follow_status && (
                            <span className={cn(
                              "pill border text-[9px]",
                              dec.follow_status === "followed"
                                ? "border-emerald-400/20 text-emerald-400 bg-emerald-400/10"
                                : dec.follow_status === "ignored"
                                ? "border-rose-400/20 text-rose-400 bg-rose-400/10"
                                : "border-amber-400/20 text-amber-400 bg-amber-400/10"
                            )}>
                              {dec.follow_status}
                            </span>
                          )}
                          {dec.outcome_rating && (
                            <span className={cn("text-[11px] font-semibold", outcomeColor(dec.outcome_rating))}>
                              {outcomeEmoji(dec.outcome_rating)} {dec.outcome_rating}
                            </span>
                          )}
                          {needsFeedback && dec.follow_status && (
                            <span className="text-[10px] text-amber-400 flex items-center gap-1">
                              <Bell size={9} className="animate-pulse-dot" /> needs outcome
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-[11px] text-[#5a5a6e]">{formatRelative(dec.created_at)}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(dec.id); }}
                            className="p-1 rounded hover:bg-rose-400/10 text-[#5a5a6e] hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                          <ChevronRight size={13} className={cn("text-[#5a5a6e] transition-transform", isActive && "rotate-90")} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detail */}
            {selected && (
              <div className="animate-fade-up space-y-4">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-[#5a5a6e] max-w-sm">{selected.situation}</p>
                  <button onClick={() => setSelected(null)} className="text-[#5a5a6e] hover:text-[#9494a8] text-xs">✕</button>
                </div>

                {/* Outcome tracker */}
                <OutcomeTracker decision={selected} onUpdate={load} />

                {/* Full results */}
                <DecisionResults output={selected.output} shareToken={selected.share_token} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
