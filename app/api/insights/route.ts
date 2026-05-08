import { NextRequest, NextResponse } from "next/server";
import { getDecisionsByUser } from "@/services/decisions";
import { generateLifeInsights } from "@/services/groq";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  const decisions = await getDecisionsByUser(user.id, 20);
  const insights = await generateLifeInsights(decisions);
  return NextResponse.json({ insights, total: decisions.length });
}
