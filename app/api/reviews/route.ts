import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId, rating, content, spoiler } = await req.json();
  if (!matchId || !rating || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.review.findUnique({ where: { userId_matchId: { userId: user.id, matchId } } });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const review = await prisma.review.create({
    data: { userId: user.id, matchId, rating, content, spoiler: spoiler ?? false },
  });

  return NextResponse.json(review, { status: 201 });
}
