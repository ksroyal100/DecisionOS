import { NextRequest, NextResponse } from "next/server";
import { analyzeDecision } from "@/services/groq";
import { saveDecision } from "@/services/decisions";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  situation: z.string().min(10).max(3000).trim(),
  tone: z.enum(["logical", "aggressive", "safe"]).default("logical"),
});

async function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const sb = getSupabaseServerClient();
  const { data } = await sb.auth.getUser(token);
  return data.user ?? null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  const { allowed } = checkRateLimit(`sim-${ip}`);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { situation, tone } = parsed.data;
  const output = await analyzeDecision(situation, tone, "simulate");

  const user = await getUser(req);
  let shareToken = null;
  if (user) {
    try {
      const saved = await saveDecision(user.id, situation, output, tone, "simulate");
      shareToken = saved.share_token;
    } catch {}
  }

  return NextResponse.json({ output, shareToken });
}
