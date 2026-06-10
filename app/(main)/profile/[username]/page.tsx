import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/shared/star-rating";
import { MatchCard } from "@/components/matches/match-card";
import { FollowButton } from "./follow-button";
import Link from "next/link";

interface Props { params: Promise<{ username: string }> }

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const profile = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { reviews: true, followers: true, following: true } },
    },
  });

  if (!profile) notFound();

  // All reviews with match data, sorted by rating desc
  const reviews = await prisma.review.findMany({
    where: { userId: profile.id },
    include: {
      match: {
        include: {
          homeCountry: true,
          awayCountry: true,
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { rating: "desc" },
  });

  const isOwn = currentUser?.id === profile.id;

  // Check if current user follows this profile
  const isFollowing = currentUser && !isOwn
    ? !!(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUser.id, followingId: profile.id } },
      }))
    : false;

  const topRated = reviews.slice(0, 5).map(r => ({
    ...r.match,
    avgRating: r.match.reviews.length > 0 ? r.match.reviews.reduce((s, rev) => s + rev.rating, 0) / r.match.reviews.length : null,
    reviewCount: r.match._count.reviews,
    userRating: r.rating,
  }));

  const recentReviews = [...reviews].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-2xl space-y-10">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-foreground">{profile.displayName ?? profile.username}</h1>
              <div className="text-sm text-muted-foreground mt-0.5">@{profile.username}</div>
              {profile.bio && <p className="text-sm text-foreground mt-2">{profile.bio}</p>}
            </div>
            {!isOwn && currentUser && (
              <FollowButton userId={profile.id} isFollowing={!!isFollowing} />
            )}
          </div>

          <div className="flex gap-6 mt-5 pt-5 border-t border-[#F0F0F0]">
            <div className="text-center">
              <div className="text-xl font-black text-foreground">{profile._count.reviews}</div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-foreground">{profile._count.followers}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-foreground">{profile._count.following}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        </div>

        {/* Highest rated matches */}
        {topRated.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">
              {isOwn ? "My Highest Rated Matches" : `${profile.displayName ?? profile.username}'s Top Matches`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topRated.map((match) => (
                <div key={match.id} className="relative">
                  <MatchCard
                    id={match.id}
                    homeCountry={match.homeCountry}
                    awayCountry={match.awayCountry}
                    homeScore={match.homeScore}
                    awayScore={match.awayScore}
                    date={match.date}
                    city={match.city}
                    stage={match.stage}
                    group={match.group}
                    matchday={match.matchday}
                    avgRating={match.avgRating}
                    reviewCount={match.reviewCount}
                  />
                  {/* User's personal rating badge */}
                  <div className="absolute top-2 right-2 bg-[#E8C93A] text-black text-xs font-black px-2 py-0.5 rounded-full">
                    ★ {match.userRating}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent reviews */}
        {recentReviews.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">Recent Reviews</h2>
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <Link key={review.id} href={`/matches/${review.match.id}`}>
                  <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 hover:border-[#BBBBBB] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-foreground">
                        {review.match.awayCountry.flag} {review.match.awayCountry.code} vs {review.match.homeCountry.flag} {review.match.homeCountry.code}
                      </div>
                      <StarRating value={review.rating} readonly size="sm" />
                    </div>
                    {review.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}

