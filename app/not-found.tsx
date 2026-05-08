import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6 text-center">
      <div className="animate-fade-up">
        <p className="font-display font-black text-8xl text-white/04 mb-4 select-none">404</p>
        <h1 className="font-display font-bold text-3xl text-[#f0f0f5] mb-2">Page not found</h1>
        <p className="text-[#5a5a6e] text-sm mb-8">This page doesn't exist — but your next decision does.</p>
        <Link href="/" className="btn-brand px-6 py-3">
          <Zap size={14} fill="white" /> Back to DecideOS
        </Link>
      </div>
    </div>
  );
}
