import { getByShareToken } from "@/services/decisions";
import DecisionResults from "@/components/decision/DecisionResults";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";

export default async function SharePage({ params }: { params: { token: string } }) {
  const decision = await getByShareToken(params.token);
  if (!decision) notFound();

  return (
    <div className="min-h-screen bg-void">
      <nav className="border-b border-[var(--border)] bg-void/80 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <Zap size={13} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-base text-[#f0f0f5]">
              Decide<span className="text-brand-soft">OS</span>
            </span>
          </Link>
          <Link href="/dashboard" className="btn-brand text-xs px-4 py-2">
            Try it yourself <ArrowRight size={12} />
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-5 py-16">
        <div className="card p-4 mb-6 animate-fade-up">
          <p className="section-label mb-1">Shared Decision</p>
          <p className="text-sm text-[#9494a8]">{decision.situation}</p>
        </div>

        <div className="animate-fade-up delay-1">
          <DecisionResults
            output={decision.output}
            shareToken={decision.share_token}
          />
        </div>

        <div className="mt-12 card p-8 text-center border-brand/15 animate-fade-up delay-2">
          <h3 className="font-display font-bold text-2xl text-[#f0f0f5] mb-2">
            Have your own tough decision?
          </h3>
          <p className="text-sm text-[#5a5a6e] mb-6">
            DecideOS gives you structured analysis, bias detection, and outcome tracking — free.
          </p>
          <Link href="/dashboard" className="btn-brand px-7 py-3">
            <Zap size={14} fill="white" /> Analyze Mine
          </Link>
        </div>
      </main>
    </div>
  );
}
