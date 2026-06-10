import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      _count: { select: { reviews: true, followers: true } },
    },
    take: 10,
  });

  // Check which ones the current user already follows
  const following = await prisma.follow.findMany({
    where: { followerId: user.id, followingId: { in: users.map(u => u.id) } },
    select: { followingId: true },
  });
  const followingIds = new Set(following.map(f => f.followingId));

  return NextResponse.json(users.map(u => ({ ...u, isFollowing: followingIds.has(u.id) })));
}
