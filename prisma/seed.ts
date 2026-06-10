import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Official FIFA World Cup 2026 - 48 qualified teams in correct groups (A-L)
// Source: FIFA official draw (December 2025), verified against fifa.com, ESPN, Sky Sports
const COUNTRIES = [
  // Group A
  { code: "MEX", name: "Mexico",       flag: "🇲🇽", group: "A", confederation: "CONCACAF" },
  { code: "RSA", name: "South Africa", flag: "🇿🇦", group: "A", confederation: "CAF"      },
  { code: "KOR", name: "South Korea",  flag: "🇰🇷", group: "A", confederation: "AFC"      },
  { code: "CZE", name: "Czechia",      flag: "🇨🇿", group: "A", confederation: "UEFA"     },

  // Group B
  { code: "CAN", name: "Canada",                flag: "🇨🇦", group: "B", confederation: "CONCACAF" },
  { code: "BIH", name: "Bosnia and Herzegovina", flag: "🇧🇦", group: "B", confederation: "UEFA"     },
  { code: "QAT", name: "Qatar",                 flag: "🇶🇦", group: "B", confederation: "AFC"      },
  { code: "SUI", name: "Switzerland",           flag: "🇨🇭", group: "B", confederation: "UEFA"     },

  // Group C
  { code: "BRA", name: "Brazil",   flag: "🇧🇷", group: "C", confederation: "CONMEBOL" },
  { code: "MAR", name: "Morocco",  flag: "🇲🇦", group: "C", confederation: "CAF"      },
  { code: "HAI", name: "Haiti",    flag: "🇭🇹", group: "C", confederation: "CONCACAF" },
  { code: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", confederation: "UEFA"     },

  // Group D
  { code: "USA", name: "United States", flag: "🇺🇸", group: "D", confederation: "CONCACAF" },
  { code: "PRY", name: "Paraguay",      flag: "🇵🇾", group: "D", confederation: "CONMEBOL" },
  { code: "TUR", name: "Türkiye",       flag: "🇹🇷", group: "D", confederation: "UEFA"     },
  { code: "AUS", name: "Australia",     flag: "🇦🇺", group: "D", confederation: "AFC"      },

  // Group E
  { code: "GER", name: "Germany",      flag: "🇩🇪", group: "E", confederation: "UEFA"     },
  { code: "CUW", name: "Curaçao",      flag: "🇨🇼", group: "E", confederation: "CONCACAF" },
  { code: "CIV", name: "Ivory Coast",  flag: "🇨🇮", group: "E", confederation: "CAF"      },
  { code: "ECU", name: "Ecuador",      flag: "🇪🇨", group: "E", confederation: "CONMEBOL" },

  // Group F
  { code: "NED", name: "Netherlands", flag: "🇳🇱", group: "F", confederation: "UEFA"     },
  { code: "JPN", name: "Japan",        flag: "🇯🇵", group: "F", confederation: "AFC"      },
  { code: "SWE", name: "Sweden",       flag: "🇸🇪", group: "F", confederation: "UEFA"     },
  { code: "TUN", name: "Tunisia",      flag: "🇹🇳", group: "F", confederation: "CAF"      },

  // Group G
  { code: "BEL", name: "Belgium",     flag: "🇧🇪", group: "G", confederation: "UEFA" },
  { code: "EGY", name: "Egypt",        flag: "🇪🇬", group: "G", confederation: "CAF"  },
  { code: "IRN", name: "Iran",         flag: "🇮🇷", group: "G", confederation: "AFC"  },
  { code: "NZL", name: "New Zealand",  flag: "🇳🇿", group: "G", confederation: "OFC"  },

  // Group H
  { code: "ESP", name: "Spain",        flag: "🇪🇸", group: "H", confederation: "UEFA"     },
  { code: "CPV", name: "Cape Verde",   flag: "🇨🇻", group: "H", confederation: "CAF"      },
  { code: "KSA", name: "Saudi Arabia", flag: "🇸🇦", group: "H", confederation: "AFC"      },
  { code: "URU", name: "Uruguay",      flag: "🇺🇾", group: "H", confederation: "CONMEBOL" },

  // Group I
  { code: "FRA", name: "France",   flag: "🇫🇷", group: "I", confederation: "UEFA" },
  { code: "SEN", name: "Senegal",  flag: "🇸🇳", group: "I", confederation: "CAF"  },
  { code: "IRQ", name: "Iraq",     flag: "🇮🇶", group: "I", confederation: "AFC"  },
  { code: "NOR", name: "Norway",   flag: "🇳🇴", group: "I", confederation: "UEFA" },

  // Group J
  { code: "ARG", name: "Argentina", flag: "🇦🇷", group: "J", confederation: "CONMEBOL" },
  { code: "ALG", name: "Algeria",   flag: "🇩🇿", group: "J", confederation: "CAF"      },
  { code: "AUT", name: "Austria",   flag: "🇦🇹", group: "J", confederation: "UEFA"     },
  { code: "JOR", name: "Jordan",    flag: "🇯🇴", group: "J", confederation: "AFC"      },

  // Group K
  { code: "POR", name: "Portugal",  flag: "🇵🇹", group: "K", confederation: "UEFA"     },
  { code: "COD", name: "DR Congo",  flag: "🇨🇩", group: "K", confederation: "CAF"      },
  { code: "UZB", name: "Uzbekistan",flag: "🇺🇿", group: "K", confederation: "AFC"      },
  { code: "COL", name: "Colombia",  flag: "🇨🇴", group: "K", confederation: "CONMEBOL" },

  // Group L
  { code: "ENG", name: "England",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", confederation: "UEFA"     },
  { code: "CRO", name: "Croatia",  flag: "🇭🇷", group: "L", confederation: "UEFA"     },
  { code: "GHA", name: "Ghana",    flag: "🇬🇭", group: "L", confederation: "CAF"      },
  { code: "PAN", name: "Panama",   flag: "🇵🇦", group: "L", confederation: "CONCACAF" },
];

type MatchSeed = {
  homeCode: string;
  awayCode: string;
  date: string;
  venue?: string;
  city?: string;
  stage: string;
  group?: string;
  matchday?: number;
  homeScore?: number;
  awayScore?: number;
};

// All 72 official group stage fixtures — FIFA World Cup 2026
// Sources: fifa.com, ESPN, Sky Sports, NBC Sports, Yahoo Sports
const MATCHES: MatchSeed[] = [
  // ── GROUP A ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "MEX", awayCode: "RSA", date: "2026-06-11", venue: "Estadio Azteca",          city: "Mexico City",     stage: "Group Stage", group: "A", matchday: 1 },
  { homeCode: "KOR", awayCode: "CZE", date: "2026-06-11", venue: "Estadio Akron",           city: "Zapopan",         stage: "Group Stage", group: "A", matchday: 1 },
  // Matchday 2
  { homeCode: "CZE", awayCode: "RSA", date: "2026-06-18", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         stage: "Group Stage", group: "A", matchday: 2 },
  { homeCode: "MEX", awayCode: "KOR", date: "2026-06-18", venue: "Estadio Akron",           city: "Zapopan",         stage: "Group Stage", group: "A", matchday: 2 },
  // Matchday 3
  { homeCode: "CZE", awayCode: "MEX", date: "2026-06-24", venue: "Estadio Azteca",          city: "Mexico City",     stage: "Group Stage", group: "A", matchday: 3 },
  { homeCode: "RSA", awayCode: "KOR", date: "2026-06-24", venue: "Estadio BBVA",            city: "Monterrey",       stage: "Group Stage", group: "A", matchday: 3 },

  // ── GROUP B ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "CAN", awayCode: "BIH", date: "2026-06-12", venue: "BMO Field",               city: "Toronto",         stage: "Group Stage", group: "B", matchday: 1 },
  { homeCode: "QAT", awayCode: "SUI", date: "2026-06-13", venue: "Levi's Stadium",          city: "Santa Clara",     stage: "Group Stage", group: "B", matchday: 1 },
  // Matchday 2
  { homeCode: "SUI", awayCode: "BIH", date: "2026-06-18", venue: "SoFi Stadium",            city: "Inglewood",       stage: "Group Stage", group: "B", matchday: 2 },
  { homeCode: "CAN", awayCode: "QAT", date: "2026-06-18", venue: "BC Place",                city: "Vancouver",       stage: "Group Stage", group: "B", matchday: 2 },
  // Matchday 3
  { homeCode: "SUI", awayCode: "CAN", date: "2026-06-24", venue: "BC Place",                city: "Vancouver",       stage: "Group Stage", group: "B", matchday: 3 },
  { homeCode: "BIH", awayCode: "QAT", date: "2026-06-24", venue: "Lumen Field",             city: "Seattle",         stage: "Group Stage", group: "B", matchday: 3 },

  // ── GROUP C ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "BRA", awayCode: "MAR", date: "2026-06-13", venue: "MetLife Stadium",         city: "East Rutherford", stage: "Group Stage", group: "C", matchday: 1 },
  { homeCode: "HAI", awayCode: "SCO", date: "2026-06-13", venue: "Gillette Stadium",        city: "Foxborough",      stage: "Group Stage", group: "C", matchday: 1 },
  // Matchday 2
  { homeCode: "SCO", awayCode: "MAR", date: "2026-06-19", venue: "Gillette Stadium",        city: "Foxborough",      stage: "Group Stage", group: "C", matchday: 2 },
  { homeCode: "BRA", awayCode: "HAI", date: "2026-06-19", venue: "Lincoln Financial Field", city: "Philadelphia",    stage: "Group Stage", group: "C", matchday: 2 },
  // Matchday 3
  { homeCode: "SCO", awayCode: "BRA", date: "2026-06-24", venue: "Hard Rock Stadium",       city: "Miami Gardens",   stage: "Group Stage", group: "C", matchday: 3 },
  { homeCode: "MAR", awayCode: "HAI", date: "2026-06-24", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         stage: "Group Stage", group: "C", matchday: 3 },

  // ── GROUP D ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "USA", awayCode: "PRY", date: "2026-06-12", venue: "SoFi Stadium",            city: "Inglewood",       stage: "Group Stage", group: "D", matchday: 1 },
  { homeCode: "AUS", awayCode: "TUR", date: "2026-06-13", venue: "BC Place",                city: "Vancouver",       stage: "Group Stage", group: "D", matchday: 1 },
  // Matchday 2
  { homeCode: "USA", awayCode: "AUS", date: "2026-06-19", venue: "Lumen Field",             city: "Seattle",         stage: "Group Stage", group: "D", matchday: 2 },
  { homeCode: "TUR", awayCode: "PRY", date: "2026-06-19", venue: "Levi's Stadium",          city: "Santa Clara",     stage: "Group Stage", group: "D", matchday: 2 },
  // Matchday 3
  { homeCode: "TUR", awayCode: "USA", date: "2026-06-25", venue: "SoFi Stadium",            city: "Inglewood",       stage: "Group Stage", group: "D", matchday: 3 },
  { homeCode: "PRY", awayCode: "AUS", date: "2026-06-25", venue: "Levi's Stadium",          city: "Santa Clara",     stage: "Group Stage", group: "D", matchday: 3 },

  // ── GROUP E ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "GER", awayCode: "CUW", date: "2026-06-14", venue: "NRG Stadium",             city: "Houston",         stage: "Group Stage", group: "E", matchday: 1 },
  { homeCode: "CIV", awayCode: "ECU", date: "2026-06-14", venue: "Lincoln Financial Field", city: "Philadelphia",    stage: "Group Stage", group: "E", matchday: 1 },
  // Matchday 2
  { homeCode: "GER", awayCode: "CIV", date: "2026-06-20", venue: "BMO Field",               city: "Toronto",         stage: "Group Stage", group: "E", matchday: 2 },
  { homeCode: "ECU", awayCode: "CUW", date: "2026-06-20", venue: "Arrowhead Stadium",       city: "Kansas City",     stage: "Group Stage", group: "E", matchday: 2 },
  // Matchday 3
  { homeCode: "ECU", awayCode: "GER", date: "2026-06-25", venue: "MetLife Stadium",         city: "East Rutherford", stage: "Group Stage", group: "E", matchday: 3 },
  { homeCode: "CUW", awayCode: "CIV", date: "2026-06-25", venue: "Lincoln Financial Field", city: "Philadelphia",    stage: "Group Stage", group: "E", matchday: 3 },

  // ── GROUP F ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "NED", awayCode: "JPN", date: "2026-06-14", venue: "AT&T Stadium",            city: "Arlington",       stage: "Group Stage", group: "F", matchday: 1 },
  { homeCode: "SWE", awayCode: "TUN", date: "2026-06-14", venue: "Estadio Akron",           city: "Zapopan",         stage: "Group Stage", group: "F", matchday: 1 },
  // Matchday 2
  { homeCode: "NED", awayCode: "SWE", date: "2026-06-20", venue: "NRG Stadium",             city: "Houston",         stage: "Group Stage", group: "F", matchday: 2 },
  { homeCode: "TUN", awayCode: "JPN", date: "2026-06-20", venue: "Estadio Akron",           city: "Zapopan",         stage: "Group Stage", group: "F", matchday: 2 },
  // Matchday 3
  { homeCode: "JPN", awayCode: "SWE", date: "2026-06-25", venue: "AT&T Stadium",            city: "Arlington",       stage: "Group Stage", group: "F", matchday: 3 },
  { homeCode: "TUN", awayCode: "NED", date: "2026-06-25", venue: "Arrowhead Stadium",       city: "Kansas City",     stage: "Group Stage", group: "F", matchday: 3 },

  // ── GROUP G ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "BEL", awayCode: "EGY", date: "2026-06-15", venue: "Lumen Field",             city: "Seattle",         stage: "Group Stage", group: "G", matchday: 1 },
  { homeCode: "IRN", awayCode: "NZL", date: "2026-06-15", venue: "SoFi Stadium",            city: "Inglewood",       stage: "Group Stage", group: "G", matchday: 1 },
  // Matchday 2
  { homeCode: "BEL", awayCode: "IRN", date: "2026-06-21", venue: "SoFi Stadium",            city: "Inglewood",       stage: "Group Stage", group: "G", matchday: 2 },
  { homeCode: "NZL", awayCode: "EGY", date: "2026-06-21", venue: "BC Place",                city: "Vancouver",       stage: "Group Stage", group: "G", matchday: 2 },
  // Matchday 3
  { homeCode: "EGY", awayCode: "IRN", date: "2026-06-26", venue: "Lumen Field",             city: "Seattle",         stage: "Group Stage", group: "G", matchday: 3 },
  { homeCode: "NZL", awayCode: "BEL", date: "2026-06-26", venue: "BC Place",                city: "Vancouver",       stage: "Group Stage", group: "G", matchday: 3 },

  // ── GROUP H ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "ESP", awayCode: "CPV", date: "2026-06-15", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         stage: "Group Stage", group: "H", matchday: 1 },
  { homeCode: "KSA", awayCode: "URU", date: "2026-06-15", venue: "Hard Rock Stadium",       city: "Miami Gardens",   stage: "Group Stage", group: "H", matchday: 1 },
  // Matchday 2
  { homeCode: "ESP", awayCode: "KSA", date: "2026-06-21", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         stage: "Group Stage", group: "H", matchday: 2 },
  { homeCode: "URU", awayCode: "CPV", date: "2026-06-21", venue: "Hard Rock Stadium",       city: "Miami Gardens",   stage: "Group Stage", group: "H", matchday: 2 },
  // Matchday 3
  { homeCode: "CPV", awayCode: "KSA", date: "2026-06-26", venue: "NRG Stadium",             city: "Houston",         stage: "Group Stage", group: "H", matchday: 3 },
  { homeCode: "URU", awayCode: "ESP", date: "2026-06-26", venue: "Estadio Akron",           city: "Zapopan",         stage: "Group Stage", group: "H", matchday: 3 },

  // ── GROUP I ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "FRA", awayCode: "SEN", date: "2026-06-16", venue: "MetLife Stadium",         city: "East Rutherford", stage: "Group Stage", group: "I", matchday: 1 },
  { homeCode: "IRQ", awayCode: "NOR", date: "2026-06-16", venue: "Gillette Stadium",        city: "Foxborough",      stage: "Group Stage", group: "I", matchday: 1 },
  // Matchday 2
  { homeCode: "FRA", awayCode: "IRQ", date: "2026-06-22", venue: "Lincoln Financial Field", city: "Philadelphia",    stage: "Group Stage", group: "I", matchday: 2 },
  { homeCode: "NOR", awayCode: "SEN", date: "2026-06-22", venue: "MetLife Stadium",         city: "East Rutherford", stage: "Group Stage", group: "I", matchday: 2 },
  // Matchday 3
  { homeCode: "NOR", awayCode: "FRA", date: "2026-06-26", venue: "Gillette Stadium",        city: "Foxborough",      stage: "Group Stage", group: "I", matchday: 3 },
  { homeCode: "SEN", awayCode: "IRQ", date: "2026-06-26", venue: "BMO Field",               city: "Toronto",         stage: "Group Stage", group: "I", matchday: 3 },

  // ── GROUP J ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "ARG", awayCode: "ALG", date: "2026-06-16", venue: "Arrowhead Stadium",       city: "Kansas City",     stage: "Group Stage", group: "J", matchday: 1 },
  { homeCode: "AUT", awayCode: "JOR", date: "2026-06-16", venue: "Levi's Stadium",          city: "Santa Clara",     stage: "Group Stage", group: "J", matchday: 1 },
  // Matchday 2
  { homeCode: "ARG", awayCode: "AUT", date: "2026-06-22", venue: "AT&T Stadium",            city: "Arlington",       stage: "Group Stage", group: "J", matchday: 2 },
  { homeCode: "JOR", awayCode: "ALG", date: "2026-06-22", venue: "Levi's Stadium",          city: "Santa Clara",     stage: "Group Stage", group: "J", matchday: 2 },
  // Matchday 3
  { homeCode: "ALG", awayCode: "AUT", date: "2026-06-27", venue: "Arrowhead Stadium",       city: "Kansas City",     stage: "Group Stage", group: "J", matchday: 3 },
  { homeCode: "JOR", awayCode: "ARG", date: "2026-06-27", venue: "AT&T Stadium",            city: "Arlington",       stage: "Group Stage", group: "J", matchday: 3 },

  // ── GROUP K ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "POR", awayCode: "COD", date: "2026-06-17", venue: "NRG Stadium",             city: "Houston",         stage: "Group Stage", group: "K", matchday: 1 },
  { homeCode: "UZB", awayCode: "COL", date: "2026-06-17", venue: "Estadio Azteca",          city: "Mexico City",     stage: "Group Stage", group: "K", matchday: 1 },
  // Matchday 2
  { homeCode: "POR", awayCode: "UZB", date: "2026-06-23", venue: "NRG Stadium",             city: "Houston",         stage: "Group Stage", group: "K", matchday: 2 },
  { homeCode: "COL", awayCode: "COD", date: "2026-06-23", venue: "Estadio Akron",           city: "Zapopan",         stage: "Group Stage", group: "K", matchday: 2 },
  // Matchday 3
  { homeCode: "COL", awayCode: "POR", date: "2026-06-27", venue: "Hard Rock Stadium",       city: "Miami Gardens",   stage: "Group Stage", group: "K", matchday: 3 },
  { homeCode: "COD", awayCode: "UZB", date: "2026-06-27", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         stage: "Group Stage", group: "K", matchday: 3 },

  // ── GROUP L ──────────────────────────────────────────────────────────────────
  // Matchday 1
  { homeCode: "ENG", awayCode: "CRO", date: "2026-06-17", venue: "AT&T Stadium",            city: "Arlington",       stage: "Group Stage", group: "L", matchday: 1 },
  { homeCode: "GHA", awayCode: "PAN", date: "2026-06-17", venue: "BMO Field",               city: "Toronto",         stage: "Group Stage", group: "L", matchday: 1 },
  // Matchday 2
  { homeCode: "ENG", awayCode: "GHA", date: "2026-06-23", venue: "Gillette Stadium",        city: "Foxborough",      stage: "Group Stage", group: "L", matchday: 2 },
  { homeCode: "PAN", awayCode: "CRO", date: "2026-06-23", venue: "BMO Field",               city: "Toronto",         stage: "Group Stage", group: "L", matchday: 2 },
  // Matchday 3
  { homeCode: "PAN", awayCode: "ENG", date: "2026-06-27", venue: "MetLife Stadium",         city: "East Rutherford", stage: "Group Stage", group: "L", matchday: 3 },
  { homeCode: "CRO", awayCode: "GHA", date: "2026-06-27", venue: "Lincoln Financial Field", city: "Philadelphia",    stage: "Group Stage", group: "L", matchday: 3 },
];

async function main() {
  console.log("🌍 Seeding World Cup 2026 database...");

  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: country,
      create: country,
    });
  }
  console.log(`✅ ${COUNTRIES.length} countries seeded`);

  const allCountries = await prisma.country.findMany();
  const countryMap = new Map(allCountries.map((c) => [c.code, c.id]));

  for (const match of MATCHES) {
    const homeCountryId = countryMap.get(match.homeCode);
    const awayCountryId = countryMap.get(match.awayCode);
    if (!homeCountryId || !awayCountryId) {
      console.warn(`Skipping match: unknown country ${match.homeCode} or ${match.awayCode}`);
      continue;
    }
    await prisma.match.create({
      data: {
        homeCountryId,
        awayCountryId,
        date: new Date(match.date),
        venue: match.venue ?? null,
        city: match.city ?? null,
        stage: match.stage,
        group: match.group ?? null,
        matchday: match.matchday ?? null,
        homeScore: match.homeScore ?? null,
        awayScore: match.awayScore ?? null,
      },
    });
  }
  console.log(`✅ ${MATCHES.length} matches seeded`);
  console.log("🏆 World Cup 2026 seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
