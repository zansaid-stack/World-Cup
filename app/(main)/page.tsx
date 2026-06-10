import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/matches/match-card";
import { createClient } from "@/lib/supabase/server";

async function getHomeData(userId?: string) {
  const now = new Date();

  const [upcomingMatches, recentMatches, topRatedRaw, userReviewedMatches] = await Promise.all([
    prisma.match.findMany({
      where: { date: { gte: now }, homeScore: null },
      include: {
        homeCountry: true,
        awayCountry: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { date: "asc" },
      take: 5,
    }),

    prisma.match.findMany({
      where: { date: { lt: now }, homeScore: { not: null } },
      include: {
        homeCountry: true,
        awayCountry: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),

    prisma.match.findMany({
      where: { reviews: { some: {} } },
      include: {
        homeCountry: true,
        awayCountry: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),

    userId ? prisma.match.findMany({
      where: { reviews: { some: { userId } } },
      include: {
        homeCountry: true,
        awayCountry: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }) : Promise.resolve([]),
  ]);

  const withStats = (matches: typeof upcomingMatches) =>
    matches.map((m) => ({
      ...m,
      avgRating: m.reviews.length > 0 ? m.reviews.reduce((s, r) => s + r.rating, 0) / m.reviews.length : null,
      reviewCount: m._count.reviews,
    }));

  const communityTopRated = topRatedRaw
    .map((m) => ({ ...m, avgRating: m.reviews.reduce((s, r) => s + r.rating, 0) / m.reviews.length, reviewCount: m._count.reviews }))
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, 5);

  const communityIds = new Set(communityTopRated.map((m) => m.id));
  const userTopRated = userReviewedMatches
    .filter((m) => !communityIds.has(m.id))
    .map((m) => ({ ...m, avgRating: m.reviews.length > 0 ? m.reviews.reduce((s, r) => s + r.rating, 0) / m.reviews.length : null, reviewCount: m._count.reviews }));

  return {
    upcoming: withStats(upcomingMatches),
    recent: withStats(recentMatches),
    topRated: [...communityTopRated, ...userTopRated],
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { upcoming, recent, topRated } = await getHomeData(user?.id);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 space-y-16">

        {/* Tagline */}
        <div className="text-center space-y-6 pt-6">
          <p className="text-4xl sm:text-5xl text-foreground font-black leading-tight">
            Log every World Cup match.<br />Rank it, rate it, debate it.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button size="lg" asChild className="bg-[#F0D75A] text-black hover:bg-[#F0D75A]/90">
              <Link href="/matches">View All Matches <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>

        {/* Upcoming matches */}
        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Upcoming Matches</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/matches">See all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {upcoming.map((m) => (
                <MatchCard key={m.id} id={m.id} homeCountry={m.homeCountry} awayCountry={m.awayCountry}
                  homeScore={m.homeScore} awayScore={m.awayScore} date={m.date} city={m.city}
                  stage={m.stage} group={m.group} matchday={m.matchday}
                  avgRating={m.avgRating} reviewCount={m.reviewCount} />
              ))}
            </div>
          </section>
        )}

        {/* Recent results */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Recent Results</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/matches">See all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {recent.map((m) => (
                <MatchCard key={m.id} id={m.id} homeCountry={m.homeCountry} awayCountry={m.awayCountry}
                  homeScore={m.homeScore} awayScore={m.awayScore} date={m.date} city={m.city}
                  stage={m.stage} group={m.group} matchday={m.matchday}
                  avgRating={m.avgRating} reviewCount={m.reviewCount} />
              ))}
            </div>
          </section>
        )}

        {/* Highest rated */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Highest Rated</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/matches">See all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {topRated.map((m) => (
              <MatchCard key={m.id} id={m.id} homeCountry={m.homeCountry} awayCountry={m.awayCountry}
                homeScore={m.homeScore} awayScore={m.awayScore} date={m.date} city={m.city}
                stage={m.stage} group={m.group} matchday={m.matchday}
                avgRating={m.avgRating} reviewCount={m.reviewCount} />
            ))}
            {topRated.length === 0 && (
              <p className="col-span-5 text-sm text-muted-foreground py-4">No rated matches yet.</p>
            )}
          </div>
        </section>

        {!user && (
          <section className="rounded-xl border border-[#E0E0E0] bg-white p-10 text-center">
            <Image src="/trophy-transparent.png" alt="trophy" width={60} height={104} className="mx-auto mb-3" unoptimized />
            <h2 className="text-2xl font-bold text-foreground mb-2">Join FullTime</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Rate every match, write reviews, and track every game of the 2026 World Cup.
            </p>
            <Button size="lg" asChild className="bg-green-600 text-white hover:bg-green-700"><Link href="/signup">Create free account</Link></Button>
          </section>
        )}
      </div>
    </div>
  );
}
