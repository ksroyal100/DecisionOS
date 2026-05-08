import { NextRequest, NextResponse } from "next/server";
import { getDecisionsByUser } from "@/services/decisions";
import { getSupabaseServerClient } from "@/lib/supabase/supabase";
import { startOfWeek, isAfter, subWeeks } from "date-fns";

async function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const sb = getSupabaseServerClient();
  const { data } = await sb.auth.getUser(token);
  return data.user ?? null;
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decisions = await getDecisionsByUser(user.id, 100);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const lastWeek = subWeeks(weekStart, 1);

  const thisWeek = decisions.filter((d) => isAfter(new Date(d.created_at), weekStart));
  const lastWeekDecisions = decisions.filter(
    (d) => isAfter(new Date(d.created_at), lastWeek) && !isAfter(new Date(d.created_at), weekStart)
  );

  const followed = thisWeek.filter((d) => d.follow_status === "followed").length;
  const withOutcome = decisions.filter((d) => d.outcome_rating);
  const goodOutcomes = withOutcome.filter(
    (d) => d.outcome_rating === "great" || d.outcome_rating === "good"
  ).length;

  return NextResponse.json({
    this_week: {
      total: thisWeek.length,
      followed,
      risk_breakdown: {
        low: thisWeek.filter((d) => d.output.risk === "Low").length,
        medium: thisWeek.filter((d) => d.output.risk === "Medium").length,
        high: thisWeek.filter((d) => d.output.risk === "High").length,
      },
    },
    last_week: { total: lastWeekDecisions.length },
    all_time: {
      total: decisions.length,
      good_outcomes: goodOutcomes,
      accuracy: withOutcome.length > 0 ? Math.round((goodOutcomes / withOutcome.length) * 100) : 0,
    },
  });
}
