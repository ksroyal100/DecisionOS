import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel, OutcomeRating, ThinkingStyle } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function riskColor(r: RiskLevel) {
  return { Low: "#34d399", Medium: "#fbbf24", High: "#fb7185", Critical: "#f43f5e" }[r] ?? "#9494a8";
}

export function riskBg(r: RiskLevel) {
  return {
    Low: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
    Medium: "bg-amber-400/10 border-amber-400/20 text-amber-400",
    High: "bg-rose-400/10 border-rose-400/20 text-rose-400",
    Critical: "bg-red-500/10 border-red-500/20 text-red-400",
  }[r] ?? "";
}

export function outcomeEmoji(r: OutcomeRating | null) {
  return { great: "🌟", good: "✅", neutral: "😐", bad: "⚠️", terrible: "❌" }[r ?? "neutral"];
}

export function outcomeColor(r: OutcomeRating | null) {
  return {
    great: "text-emerald-400", good: "text-emerald-400",
    neutral: "text-text-secondary", bad: "text-amber-400", terrible: "text-rose-400",
  }[r ?? "neutral"] ?? "text-text-secondary";
}

export function styleLabel(s: ThinkingStyle) {
  return {
    overthinker: "🌀 Overthinker",
    impulsive: "⚡ Impulsive",
    "risk-averse": "🛡 Risk-Averse",
    logical: "🧠 Logical",
    balanced: "⚖️ Balanced",
  }[s] ?? s;
}

export function scoreLevel(score: number) {
  if (score >= 800) return { label: "Expert", color: "#7c6dfa" };
  if (score >= 600) return { label: "Advanced", color: "#34d399" };
  if (score >= 400) return { label: "Growing", color: "#fbbf24" };
  if (score >= 200) return { label: "Learning", color: "#fb7185" };
  return { label: "Beginner", color: "#9494a8" };
}

export function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}
