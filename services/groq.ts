import Groq from "groq-sdk";
import {
  DecisionOutput,
  AnalysisTone,
  DecisionMode,
  SavedDecision,
} from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TONE: Record<AnalysisTone, string> = {
  logical: "Be analytical, data-driven, objective. No emotional bias.",
  aggressive:
    "Be bold and action-oriented. Favor high-reward options. Challenge hesitation.",
  safe: "Prioritize risk mitigation and stability. Emphasize worst-case protection.",
};

const MODE_GUIDANCE: Record<DecisionMode, string> = {
  micro:
    "This is a MICRO decision. Be ultra-concise. 2 options max. Single-sentence pros/cons. Quick answer.",
  standard:
    "This is a STANDARD decision. 3 options. Balanced depth. 2-3 pros/cons each.",
  deep: "This is a DEEP LIFE decision (career/relationships/finance). Be thorough. Full simulation. Strong regret analysis.",
  simulate:
    "This is a SIMULATION. Focus heavily on simulation outcomes, probabilities, and what-if scenarios. Vivid best/worst/likely cases.",
};

export async function analyzeDecision(
  situation: string,
  tone: AnalysisTone = "logical",
  mode: DecisionMode = "standard",
  pastDecisions?: Partial<SavedDecision>[]
): Promise<DecisionOutput> {
  const pastContext =
    pastDecisions && pastDecisions.length > 0
      ? `\n\nUSER DECISION HISTORY (use to personalize):\n${pastDecisions
          .slice(0, 5)
          .map(
            (d) =>
              `- "${d.situation?.slice(0, 80)}" → followed: ${d.follow_status ?? "unknown"}, outcome: ${d.outcome_rating ?? "unknown"}`
          )
          .join("\n")}`
      : "";

  const systemPrompt = `You are DecideOS — a precision life decision engine. You are NOT a chatbot. You output structured JSON analysis only.

Tone: ${TONE[tone]}
Mode: ${MODE_GUIDANCE[mode]}
${pastContext}

Respond with ONLY valid JSON. No markdown, no preamble, no explanation outside the JSON.

Required JSON structure:
{
  "summary": "1-2 sentence objective situation summary",
  "mode": "${mode}",
  "options": ["Option A", "Option B", "Option C"],
  "analysis": [
    {
      "option": "Option A",
      "pros": ["specific pro"],
      "cons": ["specific con"],
      "short_term_impact": "What happens in 1-3 months",
      "long_term_impact": "What happens in 1-3 years",
      "risk_pct": 35,
      "effort_level": "Medium",
      "emotional_impact": "Mixed"
    }
  ],
  "risk": "Low|Medium|High|Critical",
  "recommendation": "Direct, decisive 2-sentence recommendation",
  "confidence_score": 78,
  "action_plan": ["Specific step 1", "step 2", "step 3"],
  "emotional_context": "Detected mood or emotional state in the query, or null",
  "bias_warnings": [
    { "type": "fear|overconfidence|peer_pressure|status_quo|sunk_cost", "description": "Specific bias detected" }
  ],
  "regret_score": {
    "one_year": 65,
    "five_year": 80,
    "framing": "Will you regret NOT doing this in 5 years? Here's why..."
  },
  "simulation": {
    "best_case": "Vivid best outcome description",
    "worst_case": "Vivid worst outcome description",
    "most_likely": "Most probable outcome",
    "probability_success": 62,
    "timeline_months": 6
  },
  "thinking_style_hint": "overthinker|impulsive|risk-averse|logical|balanced|null"
}

Rules:
- bias_warnings: only include if genuinely detected. Empty array if none.
- emotional_context: detect stress/confusion/excitement in their words
- simulation: always include for deep/simulate mode; for micro mode can be null
- thinking_style_hint: infer from how they wrote the situation
- risk_pct: 0-100 per option. Different from overall risk level.
- effort_level: Low/Medium/High
- emotional_impact: Positive/Neutral/Negative/Mixed`;

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this situation:\n\n${situation}` },
    ],
    temperature: tone === "aggressive" ? 0.8 : tone === "safe" ? 0.3 : 0.55,
    max_tokens: 2200,
    response_format: { type: "json_object" },
  });

  const raw = resp.choices[0]?.message?.content;
  if (!raw) throw new Error("No AI response");

  const parsed = JSON.parse(raw) as DecisionOutput;
  parsed.confidence_score = Math.min(100, Math.max(0, parsed.confidence_score ?? 70));
  parsed.bias_warnings = parsed.bias_warnings ?? [];
  parsed.simulation = parsed.simulation ?? null;
  return parsed;
}

// Generate weekly life insights from decision history
export async function generateLifeInsights(
  decisions: Partial<SavedDecision>[]
): Promise<{ insights: string[]; thinking_style: string; score_change: string }> {
  if (decisions.length < 2) {
    return {
      insights: ["Make a few more decisions to unlock personalized insights."],
      thinking_style: "balanced",
      score_change: "neutral",
    };
  }

  const summary = decisions
    .slice(0, 20)
    .map(
      (d) =>
        `Situation: "${d.situation?.slice(0, 60)}" | Followed: ${d.follow_status} | Outcome: ${d.outcome_rating}`
    )
    .join("\n");

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You analyze someone's decision-making patterns and generate honest life insights. Output only JSON: { "insights": ["string (max 4)"], "thinking_style": "overthinker|impulsive|risk-averse|logical|balanced", "score_change": "improving|declining|stable" }`,
      },
      {
        role: "user",
        content: `Analyze these decisions and generate insights:\n${summary}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  return JSON.parse(resp.choices[0]?.message?.content ?? "{}");
}
