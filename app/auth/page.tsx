"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Zap, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) { setErrMsg(error.message); setStatus("error"); }
    else setStatus("sent");
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand/06 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative animate-fade-up">
        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl text-[#f0f0f5]">
            Decide<span className="text-brand-soft">OS</span>
          </span>
        </Link>

        <div className="card p-7">
          {status === "sent" ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto">
                <span className="text-emerald-400 text-xl">✓</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-[#f0f0f5]">Check your email</h2>
              <p className="text-sm text-[#5a5a6e]">
                Magic link sent to <strong className="text-[#9494a8]">{email}</strong>
              </p>
              <button onClick={() => setStatus("idle")} className="btn-ghost text-xs w-full justify-center">
                <ArrowLeft size={12} /> Use different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl text-[#f0f0f5] mb-1">Welcome back</h2>
              <p className="text-sm text-[#5a5a6e] mb-6">Sign in to track your decisions and grow over time.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input"
                />
                {errMsg && <p className="text-rose-400 text-xs">{errMsg}</p>}
                <button type="submit" disabled={status === "loading"} className="btn-brand w-full justify-center py-3">
                  {status === "loading" ? "Sending…" : "Send Magic Link"}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-[var(--border)] text-center">
                <Link href="/dashboard" className="text-xs text-[#5a5a6e] hover:text-[#9494a8] transition-colors">
                  Continue without account →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
