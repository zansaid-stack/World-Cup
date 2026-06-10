import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { StarRating } from "@/components/shared/star-rating";

interface MatchCardProps {
  id: string;
  homeCountry: { name: string; code: string; flag: string };
  awayCountry: { name: string; code: string; flag: string };
  homeScore?: number | null;
  awayScore?: number | null;
  date: Date | string;
  venue?: string | null;
  city?: string | null;
  stage: string;
  group?: string | null;
  matchday?: number | null;
  avgRating?: number | null;
  reviewCount?: number;
  className?: string;
}

export function MatchCard({
  id, homeCountry, awayCountry, homeScore, awayScore,
  date, city, stage, group, matchday,
  avgRating, reviewCount = 0, className,
}: MatchCardProps) {
  const hasResult = homeScore != null && awayScore != null;
  const homeWon = hasResult && homeScore > awayScore;
  const awayWon = hasResult && awayScore > homeScore;
  const stageLabel = group ? `Group ${group}${matchday ? ` · MD${matchday}` : ""}` : stage;

  return (
    <Link href={`/matches/${id}`} className={cn("block group", className)}>
      <div className="overflow-hidden border border-[#E0E0E0] bg-white hover:border-[#BBBBBB] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
        {/* Color bar by stage */}
        <div className={cn("h-1", stage === "Final" ? "bg-yellow-400" : stage === "Semifinal" ? "bg-orange-400" : stage === "Quarterfinal" ? "bg-blue-400" : stage === "Round of 16" ? "bg-purple-400" : stage === "Round of 32" ? "bg-pink-400" : "bg-green-600")} />

        {/* Match area */}
        <div className="p-4">
          {/* Stage label */}
          <div className="text-xs text-muted-foreground font-medium mb-3">{stageLabel}</div>

          {/* Teams */}
          <div className="flex items-center justify-between gap-2">
            {/* Away */}
            <div className={cn("flex flex-col items-center gap-1 flex-1", hasResult && homeWon && "opacity-40")}>
              <span className="text-4xl">{awayCountry.flag}</span>
              <span className="text-sm font-bold text-foreground tracking-wide">{awayCountry.code}</span>
              {hasResult && (
                <span className={cn("text-2xl font-black tabular-nums", awayWon ? "text-foreground" : "text-muted-foreground")}>
                  {awayScore}
                </span>
              )}
            </div>

            {/* Center */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-muted-foreground text-xs">vs</span>
            </div>

            {/* Home */}
            <div className={cn("flex flex-col items-center gap-1 flex-1", hasResult && awayWon && "opacity-40")}>
              <span className="text-4xl">{homeCountry.flag}</span>
              <span className="text-sm font-bold text-foreground tracking-wide">{homeCountry.code}</span>
              {hasResult && (
                <span className={cn("text-2xl font-black tabular-nums", homeWon ? "text-foreground" : "text-muted-foreground")}>
                  {homeScore}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
            <div className="text-xs text-muted-foreground">{formatDate(date)}{city ? ` · ${city}` : ""}</div>
            {(avgRating != null || reviewCount > 0) && (
              <div className="flex items-center gap-2 mt-1">
                {avgRating != null && <StarRating value={avgRating} readonly size="sm" />}
                {reviewCount > 0 && <span className="text-xs text-muted-foreground">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
