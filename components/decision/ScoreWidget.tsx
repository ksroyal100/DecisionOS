"use client";

import { UserProfile } from "@/types";
import { scoreLevel, styleLabel } from "@/lib/utils";
import { Flame, Zap, Trophy } from "lucide-react";

interface Props { profile: UserProfile | null; }

export default function ScoreWidget({ profile }: Props) {
  if (!profile) return null;
  const score = profile.decision_score ?? 0;
  const { label, color } = scoreLevel(score);
  const accuracy = profile.total_decisions > 0
    ? Math.round((profile.good_decisions / profile.total_decisions) * 100)
    : 0;

  return (
    <div className="card p-4 flex items-center gap-4">
      {/* Score ring */}
      <div className="relative flex-shrink-0">
        <svg width={56} height={56} className="-rotate-90">
          <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
          <circle
            cx={28} cy={28} r={22} fill="none"
            stroke={color} strokeWidth={4} strokeLinecap="round"
            strokeDasharray={138.2}
            strokeDashoffset={138.2 - (Math.min(score, 1000) / 1000) * 138.2}
            style={{ filter: `drop-shadow(0 0 4px ${color}80)`, transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Trophy size={14} style={{ color }} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display font-bold text-xl" style={{ color }}>{score}</span>
          <span className="text-xs font-semibold" style={{ color }}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-[#5a5a6e]">
            <Flame size={11} className="text-amber-400" />
            <span>{profile.streak_days}d streak</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#5a5a6e]">
            <Zap size={11} className="text-brand-soft" />
            <span>{accuracy}% accuracy</span>
          </div>
        </div>
      </div>

      {profile.thinking_style && (
        <div className="text-xs text-[#5a5a6e] text-right flex-shrink-0">
          {styleLabel(profile.thinking_style)}
        </div>
      )}
    </div>
  );
}
