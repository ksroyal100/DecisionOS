import { NextRequest, NextResponse } from "next/server";
import { getDecisionsByUser } from "@/services/decisions";
import { getSupabaseServerClient } from "@/lib/supabase";

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
  const decisions = await getDecisionsByUser(user.id, 200);
  return NextResponse.json({ decisions });
}
