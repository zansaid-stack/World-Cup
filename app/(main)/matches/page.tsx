import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { MatchesFilter } from "./matches-filter";

async function getAllMatches() {
  const matches = await prisma.match.findMany({
    include: {
      homeCountry: true,
      awayCountry: true,
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { date: "asc" },
  });

  return matches.map((m) => ({
    ...m,
    avgRating: m.reviews.length > 0 ? m.reviews.reduce((s, r) => s + r.rating, 0) / m.reviews.length : null,
    reviewCount: m._count.reviews,
  }));
}

export default async function MatchesPage() {
  const matches = await getAllMatches();

  return (
    <div className="min-h-screen relative">
      {/* Trophy background */}
      <div className="fixed right-0 top-16 h-screen w-[420px] pointer-events-none select-none z-0 flex items-center justify-end pr-20 opacity-80">
        <Image src="/trophy-transparent.png" alt="" width={320} height={480} className="object-contain" unoptimized />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10 space-y-8">
        <MatchesFilter matches={matches} />
      </div>
    </div>
  );
}
