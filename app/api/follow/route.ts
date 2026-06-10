import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followingId } = await req.json();
  if (followingId === user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: user.id, followingId } },
    update: {},
    create: { followerId: user.id, followingId },
  });

  return NextResponse.json({ following: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followingId } = await req.json();

  await prisma.follow.deleteMany({
    where: { followerId: user.id, followingId },
  });

  return NextResponse.json({ following: false });
}
