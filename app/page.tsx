"use client";
import Link from "next/link";
import { Zap, Brain, TrendingUp, GitBranch, Clock, BarChart2, Eye, Shield } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const FEATURES = [
  { icon: Brain, label: "Decision Memory", desc: "Every decision tracked. Follow up in 7, 30, 90 days.", color: "text-brand-soft" },
  { icon: TrendingUp, label: "Outcome Tracking", desc: "Log what actually happened. Build a feedback loop.", color: "text-emerald-400" },
  { icon: GitBranch, label: "Future Simulation", desc: "Run best/worst/likely scenarios before you commit.", color: "text-sky-400" },
  { icon: Eye, label: "Regret Minimization", desc: "See exactly how much you'll regret NOT acting.", color: "text-rose-400" },
  { icon: Shield, label: "Anti-Bias System", desc: "Detect fear, overconfidence, and peer pressure in your thinking.", color: "text-amber-400" },
  { icon: BarChart2, label: "Life Insights", desc: "See your patterns, strengths, and blind spots.", color: "text-brand-soft" },
];

export default function LandingPage() {

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const sb = getSupabaseBrowserClient();

    // initial session load
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // listen for login/logout changes
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
  const sb = getSupabaseBrowserClient();
  await sb.auth.signOut();
  setUser(null);
};

  return (
    <div className="min-h-screen bg-void overflow-x-hidden">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] bg-void/80 backdrop-blur-2xl fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <Zap size={13} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-base text-[#f0f0f5]">
              Decide<span className="text-brand-soft">OS</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
  {user ? (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
      <span className="text-lg text-[#ffffff] font-bold">
      {user.email?.charAt(0).toUpperCase()}
      </span>
      </div>

      <button
        onClick={handleSignOut}
        className="text-xs px-4 py-2 rounded-lg border border-[var(--border)] text-[#f0f0f5] hover:border-rose-400/40 hover:text-rose-400 transition-colors"
      >
        Sign out
      </button>
    </div>
  ) : (
    <>
      <Link
        href="/auth"
        className="text-sm text-[#5a5a6e] hover:text-[#9494a8]"
      >
        Sign in
      </Link>

      <Link href="/dashboard" className="btn-brand text-xs px-4 py-2">
        Try Free
      </Link>
    </>
  )}
</div>



          {/* <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="btn-brand text-xs px-4 py-2"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm text-[#5a5a6e] hover:text-[#9494a8] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-brand text-xs px-4 py-2"
                >
                  Try Free
                </Link>
              </>
            )}
          </div> */}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand/06 rounded-full blur-[120px]" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-brand/10 rounded-full blur-[60px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 card rounded-full border border-brand/20 mb-8 animate-fade-up">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-xs text-[#9494a8] font-semibold">AI-Powered Decision Engine</span>
          </div>

          <h1 className="font-display font-black text-6xl md:text-7xl text-[#f0f0f5] leading-[1.05] mb-5 animate-fade-up delay-1">
            Your AI
            <br />
            <span className="text-gradient">Thinking Partner.</span>
          </h1>

          <p className="text-lg text-[#5a5a6e] max-w-xl mx-auto mb-8 leading-relaxed animate-fade-up delay-2">
            DecideOS tracks every decision you make, learns from outcomes, detects your biases, and helps you become a better decision-maker over time.
          </p>

          <div className="flex items-center justify-center gap-3 animate-fade-up delay-3">
            <Link href="/dashboard" className="btn-brand px-7 py-3 text-sm">
              <Zap size={14} fill="white" />
              Start Deciding
            </Link>
            <Link href="/simulate" className="btn-ghost border border-[var(--border)] rounded-xl px-6 py-3 text-sm">
              <GitBranch size={14} />
              Try Simulation
            </Link>
          </div>
          {/* <p className="text-xs text-[#5a5a6e] mt-4 animate-fade-up delay-4">No signup needed to try</p> */}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[var(--border)] bg-surface py-6 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { val: "18", label: "Intelligence Features" },
            { val: "3x", label: "Better Outcomes on Average" },
            { val: "7d", label: "First Check-in Reminder" },
          ].map((s, i) => (
            <div key={i}>
              <p className="font-display font-black text-3xl text-brand-soft">{s.val}</p>
              <p className="text-xs text-[#5a5a6e] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-4xl text-[#f0f0f5] mb-3">
              Not just analysis. <span className="text-gradient">Growth.</span>
            </h2>
            <p className="text-[#5a5a6e] max-w-lg mx-auto">
              Most AI tools give you an answer once. DecideOS builds a complete picture of how you think and helps you improve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card card-hover p-5 transition-all duration-200">
                  <div className="w-8 h-8 rounded-xl bg-surface-3 flex items-center justify-center mb-3">
                    <Icon size={15} className={f.color} />
                  </div>
                  <h3 className="font-bold text-sm text-[#f0f0f5] mb-1">{f.label}</h3>
                  <p className="text-xs text-[#5a5a6e] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modes */}
      <section className="py-16 px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-black text-3xl text-[#f0f0f5] text-center mb-10">
            Every type of decision, handled.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { mode: "Quick", emoji: "⚡", desc: "Should I go out tonight?", color: "border-emerald-400/20 text-emerald-400" },
              { mode: "Standard", emoji: "🧠", desc: "Should I change jobs?", color: "border-brand/20 text-brand-soft" },
              { mode: "Deep", emoji: "🔬", desc: "Should I get married?", color: "border-amber-400/20 text-amber-400" },
              { mode: "Simulate", emoji: "🔮", desc: "What if I moved abroad?", color: "border-sky-400/20 text-sky-400" },
            ].map((m, i) => (
              <div key={i} className={`card p-4 border text-center ${m.color.split(" ")[0]} bg-opacity-5`}>
                <div className="text-2xl mb-2">{m.emoji}</div>
                <p className={`text-xs font-bold mb-1 ${m.color.split(" ")[1]}`}>{m.mode}</p>
                <p className="text-[11px] text-[#5a5a6e] italic">"{m.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent pointer-events-none" />
            <h2 className="font-display font-black text-4xl text-[#f0f0f5] mb-3 relative">
              Build the habit.
              <br />
              <span className="text-gradient">Improve your life.</span>
            </h2>
            <p className="text-[#5a5a6e] mb-8 relative">
              Users who track 10+ decisions report clearer thinking and more decisive action.
            </p>
            <Link href="/dashboard" className="btn-brand px-8 py-3.5 text-sm relative">
              <Zap size={14} fill="white" />
              Start for Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm font-display font-bold text-[#5a5a6e]">
            Decide<span className="text-brand-soft">OS</span>
          </span>
          <p className="text-xs text-[#5a5a6e]">Your AI thinking partner.</p>
        </div>
      </footer>
    </div>
  );
}
