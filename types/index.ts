// ─── Decision Engine ────────────────────────────────────────────────
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type DecisionMode = "micro" | "standard" | "deep" | "simulate";
export type AnalysisTone = "logical" | "aggressive" | "safe";
export type FollowStatus = "followed" | "ignored" | "partial" | null;
export type OutcomeRating = "great" | "good" | "neutral" | "bad" | "terrible";
export type ThinkingStyle = "overthinker" | "impulsive" | "risk-averse" | "logical" | "balanced";

export interface OptionAnalysis {
  option: string;
  pros: string[];
  cons: string[];
  short_term_impact: string;
  long_term_impact: string;
  risk_pct: number; // 0-100
  effort_level: "Low" | "Medium" | "High";
  emotional_impact: "Positive" | "Neutral" | "Negative" | "Mixed";
}

export interface BiasWarning {
  type: "fear" | "overconfidence" | "peer_pressure" | "status_quo" | "sunk_cost";
  description: string;
}

export interface RegretScore {
  one_year: number;   // 0-100 probability of regret
  five_year: number;
  framing: string;    // "Will you regret NOT doing this?"
}

export interface SimulationResult {
  best_case: string;
  worst_case: string;
  most_likely: string;
  probability_success: number; // 0-100
  timeline_months: number;
}

export interface DecisionOutput {
  summary: string;
  mode: DecisionMode;
  options: string[];
  analysis: OptionAnalysis[];
  risk: RiskLevel;
  recommendation: string;
  confidence_score: number;
  action_plan: string[];
  emotional_context: string | null;   // detected mood/emotion
  bias_warnings: BiasWarning[];
  regret_score: RegretScore;
  simulation: SimulationResult | null;
  thinking_style_hint: ThinkingStyle | null;
}

// ─── Saved Decision (DB) ────────────────────────────────────────────
export interface SavedDecision {
  id: string;
  user_id: string;
  situation: string;
  output: DecisionOutput;
  mode: DecisionMode;
  tone: AnalysisTone;
  share_token: string;
  created_at: string;
  // Follow-up tracking
  follow_status: FollowStatus;
  follow_status_set_at: string | null;
  // Outcome tracking
  outcome_rating: OutcomeRating | null;
  outcome_notes: string | null;
  outcome_set_at: string | null;
  // Scheduled follow-ups
  followup_7d_due: string | null;
  followup_30d_due: string | null;
  followup_90d_due: string | null;
}

// ─── User Profile ───────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  user_id: string;
  thinking_style: ThinkingStyle | null;
  decision_score: number;       // 0-1000 gamification
  streak_days: number;
  total_decisions: number;
  good_decisions: number;
  decisions_followed: number;
  created_at: string;
  updated_at: string;
}

// ─── Insights ───────────────────────────────────────────────────────
export interface WeeklyReport {
  week_start: string;
  decisions_made: number;
  followed_count: number;
  good_outcomes: number;
  score_change: number;
  top_insight: string;
  missed_opportunities: string[];
  strengths: string[];
  mistakes: string[];
}

export interface LifeInsight {
  category: string;
  insight: string;
  trend: "improving" | "declining" | "stable";
  evidence: string;
}

// ─── Global Insights ────────────────────────────────────────────────
export interface GlobalInsight {
  option_index: number;
  pct_chose: number;
  pct_good_outcome: number;
  sample_size: number;
}
