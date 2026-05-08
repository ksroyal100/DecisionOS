"use client";

import { useState } from "react";
import { SavedDecision, FollowStatus, OutcomeRating } from "@/types";
import { cn, outcomeColor, outcomeEmoji } from "@/lib/utils";
import { CheckCircle2, XCircle, Minus, Star } from "lucide-react";

interface Props {
  decision: SavedDecision;
  onUpdate: () => void;
}

const FOLLOW_OPTIONS: { value: FollowStatus; label: string; icon: any; color: string }[] = [
  { value: "followed", label: "I followed it", icon: CheckCircle2, color: "text-emerald-400" },
  { value: "partial", label: "Partially", icon: Minus, color: "text-amber-400" },
  { value: "ignored", label: "I ignored it", icon: XCircle, color: "text-rose-400" },
];

const OUTCOME_OPTIONS: { value: OutcomeRating; emoji: string; label: string }[] = [
  { value: "great", emoji: "🌟", label: "Great" },
  { value: "good", emoji: "✅", label: "Good" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "bad", emoji: "⚠️", label: "Bad" },
  { value: "terrible", emoji: "❌", label: "Terrible" },
];

export default function OutcomeTracker({ decision, onUpdate }: Props) {
  const [followStatus, setFollowStatus] = useState<FollowStatus>(decision.follow_status);
  const [outcomeRating, setOutcomeRating] = useState<OutcomeRating | null>(decision.outcome_rating);
  const [notes, setNotes] = useState(decision.outcome_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState<"follow" | "outcome" | "done">(
    decision.outcome_rating ? "done" : decision.follow_status ? "outcome" : "follow"
  );

  const saveFollow = async (status: FollowStatus) => {
    setFollowStatus(status);
    setSaving(true);
    await fetch(`/api/outcome?action=follow`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: decision.id, status }),
    });
    setSaving(false);
    setStep("outcome");
  };

  const saveOutcome = async () => {
    if (!outcomeRating) return;
    setSaving(true);
    await fetch(`/api/outcome?action=outcome`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: decision.id, rating: outcomeRating, notes }),
    });
    setSaving(false);
    setSaved(true);
    setStep("done");
    onUpdate();
  };

  if (step === "done") {
    return (
      <div className="card-2 p-4 flex items-center gap-3">
        <span className="text-xl">{outcomeEmoji(outcomeRating)}</span>
        <div>
          <p className={cn("text-sm font-semibold", outcomeColor(outcomeRating))}>
            Outcome: {outcomeRating}
          </p>
          {notes && <p className="text-xs text-[#5a5a6e] mt-0.5">{notes}</p>}
        </div>
        <button
          onClick={() => setStep("follow")}
          className="ml-auto text-[10px] text-[#5a5a6e] hover:text-[#9494a8] transition-colors"
        >
          Edit
        </button>
      </div>
    );
  }

  if (step === "follow") {
    return (
      <div className="card-2 p-4 space-y-3">
        <p className="text-xs font-bold text-[#f0f0f5]">Did you follow this decision?</p>
        <div className="flex gap-2">
          {FOLLOW_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => saveFollow(opt.value)}
                disabled={saving}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all",
                  followStatus === opt.value
                    ? "border-brand/40 bg-brand/10 text-[#f0f0f5]"
                    : "border-[var(--border)] text-[#5a5a6e] hover:border-[var(--border-strong)]"
                )}
              >
                <Icon size={12} className={opt.color} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // outcome step
  return (
    <div className="card-2 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Star size={13} className="text-amber-400" />
        <p className="text-xs font-bold text-[#f0f0f5]">What was the outcome?</p>
      </div>
      <div className="flex gap-2">
        {OUTCOME_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setOutcomeRating(o.value)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-semibold transition-all",
              outcomeRating === o.value
                ? "border-brand/40 bg-brand/10 text-[#f0f0f5]"
                : "border-[var(--border)] text-[#5a5a6e] hover:border-[var(--border-strong)]"
            )}
          >
            <span className="text-base">{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What changed? (optional)"
        className="input text-xs py-2"
      />
      <button
        onClick={saveOutcome}
        disabled={!outcomeRating || saving}
        className="w-full btn-brand py-2 text-xs"
      >
        {saving ? "Saving…" : "Save Outcome"}
      </button>
    </div>
  );
}
