import { NextRequest, NextResponse } from "next/server";
import { setFollowStatus, setOutcome, getDecisionsByUser, getDueFollowups } from "@/services/decisions";
import { getSupabaseServerClient } from "@/lib/supabase";
import { z } from "zod";

async function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const sb = getSupabaseServerClient();
  const { data } = await sb.auth.getUser(token);
  return data.user ?? null;
}

const followSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["followed", "ignored", "partial"]),
});

const outcomeSchema = z.object({
  id: z.string().uuid(),
  rating: z.enum(["great", "good", "neutral", "bad", "terrible"]),
  notes: z.string().max(500).default(""),
});

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "followups") {
    const due = await getDueFollowups(user.id);
    return NextResponse.json({ decisions: due });
  }

  const decisions = await getDecisionsByUser(user.id);
  return NextResponse.json({ decisions });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "follow") {
    const p = followSchema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    await setFollowStatus(p.data.id, user.id, p.data.status);
    return NextResponse.json({ ok: true });
  }

  if (action === "outcome") {
    const p = outcomeSchema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    await setOutcome(p.data.id, user.id, p.data.rating, p.data.notes);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
