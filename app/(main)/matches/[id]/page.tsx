import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { StarRating } from "@/components/shared/star-rating";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";
import { ReviewFormWrapper } from "./review-form-wrapper";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id }, include: { homeCountry: true, awayCountry: true } });
  if (!match) return { title: "Match Not Found" };
  return { title: `${match.awayCountry.flag} ${match.awayCountry.code} vs ${match.homeCountry.flag} ${match.homeCountry.code}` };
}

export default async function MatchPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeCountry: true,
      awayCountry: true,
      reviews: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
      },
    },
  });

  if (!match) notFound();

  const avgRating = match.reviews.length > 0
    ? match.reviews.reduce((s, r) => s + r.rating, 0) / match.reviews.length : null;
  const hasResult = match.homeScore != null && match.awayScore != null;
  const homeWon = hasResult && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const stageLabel = match.group ? `Group ${match.group}${match.matchday ? ` · Matchday ${match.matchday}` : ""}` : match.stage;
  const winnerColor = homeWon ? "#16a34a" : "#15803d";

  const userReview = user ? match.reviews.find((r) => r.user.id === user.id) : null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: winnerColor }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-white/60 text-sm font-medium mb-4">{stageLabel} · {match.venue ?? match.city}</div>
          <div className="flex items-center gap-8 mb-4">
            <div className={`flex flex-col items-center ${hasResult && homeWon ? "opacity-50" : ""}`}>
              <span className="text-6xl mb-2">{match.awayCountry.flag}</span>
              <div className="text-2xl font-black text-white">{match.awayCountry.code}</div>
              <div className="text-sm text-white/60">{match.awayCountry.name}</div>
              {hasResult && <div className={`text-5xl font-black tabular-nums mt-2 ${!homeWon ? "text-white" : "text-white/50"}`}>{match.awayScore}</div>}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white/30 text-3xl font-light">vs</span>
              {hasResult && <span className="text-white/40 text-sm mt-1">FINAL</span>}
            </div>
            <div className={`flex flex-col items-center ${hasResult && !homeWon ? "opacity-50" : ""}`}>
              <span className="text-6xl mb-2">{match.homeCountry.flag}</span>
              <div className="text-2xl font-black text-white">{match.homeCountry.code}</div>
              <div className="text-sm text-white/60">{match.homeCountry.name}</div>
              {hasResult && <div className={`text-5xl font-black tabular-nums mt-2 ${homeWon ? "text-white" : "text-white/50"}`}>{match.homeScore}</div>}
            </div>
          </div>
          <p className="text-white/50 text-sm">{formatDate(match.date)}</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-[#E0E0E0] bg-[#F0F0EE]">
        <div className="container mx-auto px-4 py-4 flex items-center gap-8">
          {avgRating != null && (
            <div className="flex items-center gap-3">
              <div>
                <div className="text-2xl font-black text-foreground">{avgRating.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">avg rating</div>
              </div>
              <StarRating value={avgRating} readonly size="sm" />
            </div>
          )}
          <div>
            <div className="text-2xl font-black text-foreground">{match.reviews.length}</div>
            <div className="text-xs text-muted-foreground">{match.reviews.length === 1 ? "review" : "reviews"}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Form + reviews side by side */}
        <div className="grid lg:grid-cols-[1fr,380px] gap-10 items-start">
          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">
              {match.reviews.length > 0 ? "Reviews" : "Be the first to review"}
            </h2>
            {match.reviews.length > 0 ? (
              <div className="space-y-4">
                {match.reviews.map((review) => (
                  <div key={review.id} className="border border-[#E0E0E0] bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-foreground">@{review.user.username}</span>
                      <StarRating value={review.rating} readonly size="sm" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="No reviews yet" description="Be the first to share your take on this match." />
            )}
          </div>

          {/* Log form */}
          <ReviewFormWrapper
            matchId={match.id}
            user={user}
            existingReview={userReview ? { id: userReview.id, content: userReview.content, rating: userReview.rating, spoiler: userReview.spoiler } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
