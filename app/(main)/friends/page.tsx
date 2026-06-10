import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FriendsClient } from "./friends-client";

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [following, feed] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true, username: true, displayName: true, avatarUrl: true,
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.review.findMany({
      where: { user: { followers: { some: { followerId: user.id } } } },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        match: {
          include: { homeCountry: true, awayCountry: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <FriendsClient
      currentUserId={user.id}
      following={following.map(f => f.following)}
      feed={feed}
    />
  );
}
