"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/layout/Nav";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { SavedDecision } from "@/types";
import { formatRelative, outcomeEmoji, outcomeColor, scoreLevel, styleLabel, riskColor } from "@/lib/utils";
import { BarChart2, TrendingUp, Brain, Zap, Target, Star, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function InsightsPage() {
  const [decisions, setDecisions] = useState<SavedDecision[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [thinkingStyle, setThinkingStyle] = useState("");
  const [scoreChange, setScoreChange] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const sb = getSupabaseBrowserClient();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { setError("Sign in to view insights"); setLoading(false); return; }
    const tok = session.access_token;

    try {
      const [decRes, insRes] = await Promise.all([
        fetch("/api/outcome", { headers: { authorization: `Bearer ${tok}` } }),
        fetch("/api/insights", { headers: { authorization: `Bearer ${tok}` } }),
      ]);
      if (decRes.ok) { const d = await decRes.json(); setDecisions(d.decisions ?? []); }
      if (insRes.ok) {
        const d = await insRes.json();
        setInsights(d.insights?.insights ?? []);
        setThinkingStyle(d.insights?.thinking_style ?? "");
        setScoreChange(d.insights?.score_change ?? "");
      }
    } catch { setError("Failed to load insights"); }
    setLoading(false);
  };

  // Compute stats
  const total = decisions.length;
  const withOutcome = decisions.filter((d) => d.outcome_rating);
  const good = withOutcome.filter((d) => d.outcome_rating === "great" || d.outcome_rating === "good").length;
  const followed = decisions.filter((d) => d.follow_status === "followed").length;
  const accuracy = withOutcome.length > 0 ? Math.round((good / withOutcome.length) * 100) : 0;
  const followRate = total > 0 ? Math.round((followed / total) * 100) : 0;

  // Weekly chart data (last 8 weeks)
  const weeklyData = (() => {
    const weeks: Record<string, number> = {};
    decisions.forEach((d) => {
      const date = new Date(d.created_at);
      const week = `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleString("default", { month: "short" })}`;
      weeks[week] = (weeks[week] ?? 0) + 1;
    });
    return Object.entries(weeks).slice(-8).map(([week, count]) => ({ week, count }));
  })();

  // Risk distribution
  const riskDist = ["Low", "Medium", "High", "Critical"].map((r) => ({
    risk: r,
    count: decisions.filter((d) => d.output.risk === r).length,
    color: riskColor(r as any),
  })).filter((d) => d.count > 0);

  if (loading) return (
    <div className="min-h-screen bg-void">
      <Nav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-20 space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="card h-32 shimmer" />)}
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-void">
      <Nav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={13} className="text-brand-soft" />
            <span className="section-label text-brand-soft">Life Insights</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#f0f0f5]">Your Decision Patterns</h1>
        </div>

        {error && (
          <div className="card p-12 text-center mb-6">
            <p className="text-[#9494a8] mb-4">{error}</p>
            <a href="/auth" className="btn-brand">Sign In</a>
          </div>
        )}

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up delay-1">
          {[
            { label: "Decisions Made", value: total, icon: Zap, color: "text-brand-soft" },
            { label: "Decision Accuracy", value: `${accuracy}%`, icon: Target, color: "text-emerald-400" },
            { label: "Follow-through Rate", value: `${followRate}%`, icon: TrendingUp, color: "text-amber-400" },
            { label: "Outcomes Tracked", value: withOutcome.length, icon: Star, color: "text-sky-400" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className={s.color} />
                  <span className="section-label">{s.label}</span>
                </div>
                <p className={`font-display font-black text-3xl ${s.color}`}>{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="card p-5 mb-6 animate-fade-up delay-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={14} className="text-brand-soft" />
              <span className="section-label text-brand-soft">AI Life Analysis</span>
              {thinkingStyle && (
                <span className="ml-auto text-xs text-[#9494a8]">{styleLabel(thinkingStyle as any)}</span>
              )}
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 card-2 p-3">
                  <span className="text-brand-soft mt-0.5 flex-shrink-0">›</span>
                  <p className="text-sm text-[#9494a8]">{insight}</p>
                </div>
              ))}
            </div>
            {scoreChange && (
              <div className={`mt-4 flex items-center gap-2 text-xs font-semibold ${
                scoreChange === "improving" ? "text-emerald-400" :
                scoreChange === "declining" ? "text-rose-400" : "text-[#9494a8]"
              }`}>
                <TrendingUp size={12} />
                Decision quality is {scoreChange}
              </div>
            )}
          </div>
        )}

        {/* Weekly activity chart */}
        {weeklyData.length > 1 && (
          <div className="card p-5 mb-6 animate-fade-up delay-3">
            <p className="section-label mb-4">Weekly Activity</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weeklyData} barSize={24}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#5a5a6e" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#141419", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#9494a8" }}
                  itemStyle={{ color: "#7c6dfa" }}
                />
                <Bar dataKey="count" fill="#7c6dfa" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Risk distribution */}
        {riskDist.length > 0 && (
          <div className="card p-5 mb-6 animate-fade-up delay-4">
            <p className="section-label mb-4">Risk Profile</p>
            <div className="space-y-2.5">
              {riskDist.map((r) => (
                <div key={r.risk} className="flex items-center gap-3">
                  <span className="text-xs text-[#9494a8] w-16 flex-shrink-0">{r.risk}</span>
                  <div className="flex-1 h-2 bg-white/06 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(r.count / total) * 100}%`, background: r.color, boxShadow: `0 0 6px ${r.color}60` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#5a5a6e] w-6 text-right">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent outcomes */}
        {withOutcome.length > 0 && (
          <div className="card p-5 animate-fade-up delay-5">
            <p className="section-label mb-4">Recent Outcomes</p>
            <div className="space-y-2">
              {withOutcome.slice(0, 6).map((d) => (
                <div key={d.id} className="card-2 p-3 flex items-start gap-3">
                  <span className="text-base flex-shrink-0">{outcomeEmoji(d.outcome_rating)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#f0f0f5] font-medium truncate">{d.situation.slice(0, 70)}</p>
                    {d.outcome_notes && (
                      <p className="text-[11px] text-[#5a5a6e] mt-0.5 truncate">{d.outcome_notes}</p>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold flex-shrink-0 ${outcomeColor(d.outcome_rating)}`}>
                    {d.outcome_rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!error && total === 0 && (
          <div className="card p-12 text-center">
            <AlertCircle size={28} className="text-[#5a5a6e] mx-auto mb-3" />
            <p className="text-[#9494a8] text-sm mb-4">Make a few decisions first to see insights.</p>
            <a href="/dashboard" className="btn-brand">Analyze a Decision</a>
          </div>
        )}
      </main>
    </div>
  );
}
