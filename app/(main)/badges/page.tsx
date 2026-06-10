import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrophyMeter } from "./trophy-meter";

// Balls assigned worst→best (BR ranking #14 to #1), thresholds spread across 104 total matches
const BADGES = [
  { threshold: 1,   name: "Jabulani",      year: 2010, image: "https://upload.wikimedia.org/wikipedia/commons/5/57/Adidas_Jabulani_Official_World_Cup_2010_%284158450149%29.jpg"    },
  { threshold: 8,   name: "Tango España",  year: 1982, image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/1982_TangoEspana.jpg"                                           },
  { threshold: 16,  name: "Tango Durlast", year: 1978, image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Adidas_Tango_Argentina_%28River_Plate%29_1978_cup_Official_ball.jpg" },
  { threshold: 26,  name: "Telstar 18",    year: 2018, image: "https://upload.wikimedia.org/wikipedia/commons/5/50/Adidas_Telstar_18_in_Russia_vs._Argentina.jpg"                   },
  { threshold: 40,  name: "Questra",       year: 1994, image: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Adidas_Questra_USA_1994_Official_ball.jpg"                        },
  { threshold: 52,  name: "Azteca",        year: 1986, image: "https://upload.wikimedia.org/wikipedia/commons/0/08/Adidas_Azteca_Mexico_1986_Official_ball.jpg"                      },
  { threshold: 64,  name: "Teamgeist",     year: 2006, image: "https://upload.wikimedia.org/wikipedia/commons/9/94/Teamgeist_Ball_World_Cup_2006.jpg"                                },
  { threshold: 72,  name: "Tricolore",     year: 1998, image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Pelota_adidas_tricolore_official.jpg"                            },
  { threshold: 80,  name: "Etrusco Unico", year: 1990, image: "https://upload.wikimedia.org/wikipedia/commons/0/08/Ballon_Adidas_Etrusco.jpg"                                      },
  { threshold: 96,  name: "Fevernova",     year: 2002, image: "https://upload.wikimedia.org/wikipedia/commons/b/be/Deutsches_Fu%C3%9Fballmuseum_2015_2-Fevernova.jpg"               },
  { threshold: 104, name: "Brazuca",       year: 2014, image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Deutsches_Fu%C3%9Fballmuseum_2015_3.jpg"                         },
];

export default async function BadgesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Image src="/trophy-transparent.png" alt="trophy" width={64} height={110} className="mx-auto" unoptimized />
          <h2 className="text-2xl font-black text-foreground">Sign in to earn badges</h2>
          <p className="text-muted-foreground">Rate matches to unlock rewards and track your progress.</p>
          <Button asChild className="bg-green-600 text-white hover:bg-green-700"><Link href="/login">Sign in</Link></Button>
        </div>
      </div>
    );
  }

  const reviewCount = await prisma.review.count({ where: { userId: user.id } });
  const earnedBadges = BADGES.filter((b) => b.threshold <= reviewCount);
  const latestBadge = earnedBadges[earnedBadges.length - 1];
  const nextBadge = BADGES.find((b) => b.threshold > reviewCount);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 space-y-10 max-w-2xl">

        {/* Trophy meter hero */}
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-8 flex flex-col items-center">
          <TrophyMeter count={reviewCount} total={104} badges={BADGES.map(b => b.threshold)} />

          <div className="mt-6 text-center">
            <div className="text-3xl font-black text-foreground">{reviewCount} / 104</div>
            <div className="text-sm text-muted-foreground mt-1">matches rated</div>

            {latestBadge && (
              <div className="inline-flex items-center gap-2 bg-[#E8C93A]/20 border border-[#E8C93A]/50 rounded-full px-4 py-1.5 text-sm font-semibold mt-3">
                {latestBadge.name}
              </div>
            )}

            {nextBadge && (
              <p className="text-xs text-muted-foreground mt-3">
                {nextBadge.threshold - reviewCount} more to unlock <strong>{nextBadge.name}</strong>
              </p>
            )}

            {reviewCount >= 104 && (
              <p className="text-sm font-semibold text-green-600 mt-3">🎉 You&apos;ve rated every match!</p>
            )}
          </div>
        </div>

        {/* Badge grid */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">All Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BADGES.map((badge) => {
              const earned = reviewCount >= badge.threshold;
              return (
                <div
                  key={badge.threshold}
                  className={`rounded-xl border p-4 text-center transition-all ${
                    earned ? "bg-white border-[#E8C93A]/50 shadow-sm" : "bg-white/40 border-[#E0E0E0] opacity-50"
                  }`}
                >
                  <div className={`relative w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden ${!earned ? "grayscale" : ""}`}>
                    <Image src={badge.image} alt={badge.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="font-bold text-sm text-foreground">{badge.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{badge.year}</div>
                  <div className={`text-xs font-semibold mt-1.5 ${earned ? "text-green-600" : "text-muted-foreground"}`}>
                    {earned ? "✓ Earned" : `${badge.threshold} ${badge.threshold === 1 ? "match" : "matches"}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center pb-4">
          <Button asChild className="bg-green-600 text-white hover:bg-green-700">
            <Link href="/matches">Rate more matches →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
