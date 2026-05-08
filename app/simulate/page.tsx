"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import { DecisionOutput } from "@/types";
import DecisionResults from "@/components/decision/DecisionResults";
import { GitBranch, Lightbulb } from "lucide-react";

const TEMPLATES = [
  "What if I quit my job and started freelancing full-time?",
  "What if I moved to a new country for 1 year?",
  "What if I invested 50% of my savings in index funds right now?",
  "What if I went back to school for a Master's degree?",
  "What if I ended my current relationship?",
  "What if I launched my startup idea with $5,000?",
];

export default function SimulatePage() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ output: DecisionOutput; shareToken?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (situation.trim().length < 10 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, mode: "simulate", tone: "logical" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-void">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 pt-24 pb-20">
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch size={13} className="text-sky-400" />
            <span className="section-label text-sky-400">Future Simulation</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#f0f0f5] mb-2">
            What if you…
          </h1>
          <p className="text-sm text-[#5a5a6e]">
            Simulate any major life decision. See best case, worst case, and most likely outcome before you commit.
          </p>
        </div>

        {!result && (
          <div className="space-y-4 animate-fade-up delay-1">
            <div className="relative">
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder='e.g. "What if I quit my job and started a business with $20k savings?"'
                rows={5}
                className="input resize-none leading-relaxed"
              />
            </div>

            {error && <p className="text-rose-400 text-sm">{error}</p>}

            {/* Templates */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={12} className="text-[#5a5a6e]" />
                <span className="text-[11px] text-[#5a5a6e] font-semibold uppercase tracking-widest">Try a scenario</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSituation(t)}
                    className="text-left text-xs text-[#5a5a6e] hover:text-[#9494a8] card card-hover px-4 py-2.5 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={run}
              disabled={situation.trim().length < 10 || loading}
              className="w-full btn-brand py-3.5 text-sm justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spin" />
                  Running simulation…
                </>
              ) : (
                <>
                  <GitBranch size={14} />
                  Run Simulation
                </>
              )}
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-3 mt-6">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-20 shimmer" />)}
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-[#f0f0f5]">Simulation Results</h2>
              <button onClick={() => setResult(null)} className="btn-ghost text-xs">← New</button>
            </div>
            <DecisionResults output={result.output} shareToken={result.shareToken} />
          </div>
        )}
      </main>
    </div>
  );
}
