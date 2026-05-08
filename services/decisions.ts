import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  SavedDecision,
  DecisionOutput,
  AnalysisTone,
  DecisionMode,
  FollowStatus,
  OutcomeRating,
  UserProfile,
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import { addDays } from "date-fns";

// ─── Save new decision ───────────────────────────────────────────────
export async function saveDecision(
  userId: string,
  situation: string,
  output: DecisionOutput,
  tone: AnalysisTone,
  mode: DecisionMode
): Promise<SavedDecision> {
  const sb = await getSupabaseServerClient();
  const now = new Date();

  const { data, error } = await sb
    .from("decisions")
    .insert({
      user_id: userId,
      situation,
      output,
      tone,
      mode,
      share_token: uuidv4(),
      follow_status: null,
      outcome_rating: null,
      outcome_notes: null,
      followup_7d_due: addDays(now, 7).toISOString(),
      followup_30d_due: addDays(now, 30).toISOString(),
      followup_90d_due: addDays(now, 90).toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update user profile stats
  await incrementUserStats(userId);

  return data as SavedDecision;
}

// ─── Get user decisions ──────────────────────────────────────────────
export async function getDecisionsByUser(
  userId: string,
  limit = 50
): Promise<SavedDecision[]> {
  const sb = await getSupabaseServerClient();
  const { data, error } = await sb
    .from("decisions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as SavedDecision[];
}

// ─── Get decisions due for follow-up ────────────────────────────────
export async function getDueFollowups(userId: string): Promise<SavedDecision[]> {
  const sb = await getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("decisions")
    .select("*")
    .eq("user_id", userId)
    .is("outcome_rating", null)
    .or(`followup_7d_due.lte.${now},followup_30d_due.lte.${now},followup_90d_due.lte.${now}`)
    .order("created_at", { ascending: false })
    .limit(5);
  return (data ?? []) as SavedDecision[];
}

// ─── Mark follow status ──────────────────────────────────────────────
export async function setFollowStatus(
  id: string,
  userId: string,
  status: FollowStatus
): Promise<void> {
  const sb = await getSupabaseServerClient();
  await sb
    .from("decisions")
    .update({ follow_status: status, follow_status_set_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
}

// ─── Record outcome ──────────────────────────────────────────────────
export async function setOutcome(
  id: string,
  userId: string,
  rating: OutcomeRating,
  notes: string
): Promise<void> {
  const sb = await getSupabaseServerClient();
  await sb
    .from("decisions")
    .update({ outcome_rating: rating, outcome_notes: notes, outcome_set_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  // Update score
  const pts = { great: 50, good: 30, neutral: 10, bad: -10, terrible: -20 }[rating] ?? 0;
  await updateDecisionScore(userId, pts, rating === "great" || rating === "good");
}

// ─── Share token lookup ──────────────────────────────────────────────
export async function getByShareToken(token: string): Promise<SavedDecision | null> {
  const sb = await getSupabaseServerClient();
  const { data } = await sb.from("decisions").select("*").eq("share_token", token).single();
  return data as SavedDecision | null;
}

// ─── Delete ──────────────────────────────────────────────────────────
export async function deleteDecision(id: string, userId: string): Promise<void> {
  const sb = await getSupabaseServerClient();
  await sb.from("decisions").delete().eq("id", id).eq("user_id", userId);
}

// ─── User Profile ────────────────────────────────────────────────────
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const sb = await getSupabaseServerClient();
  const { data } = await sb.from("user_profiles").select("*").eq("user_id", userId).single();
  return data as UserProfile | null;
}

export async function upsertUserProfile(userId: string): Promise<UserProfile> {
  const sb = await getSupabaseServerClient();
  const { data, error } = await sb
    .from("user_profiles")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as UserProfile;
}

async function incrementUserStats(userId: string) {
  const sb = await getSupabaseServerClient();
  const profile = await getUserProfile(userId);
  if (!profile) {
    await sb.from("user_profiles").insert({ user_id: userId, total_decisions: 1, decision_score: 10 });
  } else {
    await sb
      .from("user_profiles")
      .update({
        total_decisions: (profile.total_decisions ?? 0) + 1,
        decision_score: (profile.decision_score ?? 0) + 10,
        streak_days: (profile.streak_days ?? 0) + 1,
      })
      .eq("user_id", userId);
  }
}

async function updateDecisionScore(userId: string, pts: number, isGood: boolean) {
  const sb = await getSupabaseServerClient();
  const profile = await getUserProfile(userId);
  if (!profile) return;
  await sb
    .from("user_profiles")
    .update({
      decision_score: Math.max(0, (profile.decision_score ?? 0) + pts),
      good_decisions: (profile.good_decisions ?? 0) + (isGood ? 1 : 0),
    })
    .eq("user_id", userId);
}

// ─── Global anonymous insights ───────────────────────────────────────
export async function getGlobalInsights(situation_hash: string) {
  // In production: aggregate anonymized decision outcomes
  // For now return mock data structure
  return { pct_chose_recommended: 68, pct_good_outcome: 74, sample_size: 1240 };
}
