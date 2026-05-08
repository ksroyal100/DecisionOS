"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, LayoutDashboard, Clock, BarChart2, GitBranch } from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Decide" },
  { href: "/history", icon: Clock, label: "History" },
  { href: "/insights", icon: BarChart2, label: "Insights" },
  { href: "/simulate", icon: GitBranch, label: "Simulate" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-void/85 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center group-hover:bg-brand-soft transition-colors">
            <Zap size={13} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-base text-[#f0f0f5] tracking-tight">
            Decide<span className="text-brand-soft">OS</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
                  active
                    ? "bg-brand/15 text-brand-soft"
                    : "text-[#5a5a6e] hover:text-[#9494a8] hover:bg-white/04"
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </nav>

        <Link href="/dashboard" className="btn-brand text-xs px-4 py-2">
          + New Decision
        </Link>
      </div>
    </header>
  );
}
