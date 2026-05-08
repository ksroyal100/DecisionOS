"use client";

import { useState, useEffect } from "react";
import { DecisionOutput, SavedDecision } from "@/types";
import DecisionForm from "@/components/decision/DecisionForm";
import DecisionResults from "@/components/decision/DecisionResults";
import Nav from "@/components/layout/Nav";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Zap, Clock, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    output: DecisionOutput; decisionId?: string | null; shareToken?: string | null;
  } | null>(null);
  const [dueFollowups, setDueFollowups] = useState<SavedDecision[]>([]);
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
  const sb = getSupabaseBrowserClient();

  const init = async () => {
    const { data: { session } } = await sb.auth.getSession();

    if (session?.user) {
      setUser(session.user);
      fetchFollowups(session.user);
    }
  };

  init();

  const { data: { subscription } } =
    sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchFollowups(session.user);
    });

  return () => subscription.unsubscribe();
}, []);


  const fetchFollowups = async (u: any) => {
    const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
    if (!session) return;
    try {
      const res = await fetch("/api/outcome?type=followups", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setDueFollowups(d.decisions ?? []);
      }
    } catch {}
  };

  const handleResult = (data: any) => {
    setResult(data);
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  return (
    <div className="min-h-screen bg-void">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 pt-24 pb-20">
        {/* Follow-up nudge */}
        {dueFollowups.length > 0 && (
          <Link
            href="/history"
            className="flex items-center gap-3 card p-3.5 mb-6 border-amber-400/20 bg-amber-400/05 hover:bg-amber-400/08 transition-colors animate-fade-up"
          >
            <Bell size={14} className="text-amber-400 flex-shrink-0 animate-pulse-dot" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#f0f0f5]">
                {dueFollowups.length} decision{dueFollowups.length > 1 ? "s" : ""} awaiting your feedback
              </p>
              <p className="text-[11px] text-[#5a5a6e] truncate">
                "{dueFollowups[0]?.situation?.slice(0, 60)}…"
              </p>
            </div>
            <span className="text-[11px] text-amber-400 font-semibold flex-shrink-0">Review →</span>
          </Link>
        )}

        {/* Header */}
        {!result && (
          <div className="mb-8 animate-fade-up">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={13} className="text-brand-soft" />
              <span className="section-label text-brand-soft">Decision Engine</span>
            </div>
            <h1 className="font-display font-black text-4xl text-[#f0f0f5] leading-[1.1] mb-2">
              What are you
              <br />
              <span className="text-gradient">deciding today?</span>
            </h1>
            <p className="text-sm text-[#5a5a6e]">
              Describe your situation. Get a structured breakdown in seconds.
            </p>
          </div>
        )}

        {/* Form */}
        {!result && (
          <div className="animate-fade-up delay-1">
            <DecisionForm onResult={handleResult} onLoading={setLoading} />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full spin" />
              <p className="text-sm text-[#5a5a6e]">Analyzing your situation…</p>
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 h-20 shimmer" />
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div id="results">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-[#f0f0f5]">Analysis</h2>
              <button
                onClick={() => setResult(null)}
                className="btn-ghost text-xs"
              >
                ← New
              </button>
            </div>
            <DecisionResults
              output={result.output}
              shareToken={result.shareToken}
              decisionId={result.decisionId}
            />
          </div>
        )}

        {/* Quick nav */}
        {!result && !loading && (
          <div className="mt-10 grid grid-cols-2 gap-3 animate-fade-up delay-2">
            <Link href="/history" className="card card-hover p-4 flex items-center gap-3">
              <Clock size={16} className="text-brand-soft" />
              <div>
                <p className="text-xs font-bold text-[#f0f0f5]">History</p>
                <p className="text-[11px] text-[#5a5a6e]">Past decisions</p>
              </div>
            </Link>
            <Link href="/insights" className="card card-hover p-4 flex items-center gap-3">
              <Zap size={16} className="text-amber-400" />
              <div>
                <p className="text-xs font-bold text-[#f0f0f5]">Insights</p>
                <p className="text-[11px] text-[#5a5a6e]">Your patterns</p>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
