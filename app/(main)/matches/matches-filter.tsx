"use client";

import { useState, useMemo } from "react";
import { MatchCard } from "@/components/matches/match-card";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  date: Date;
  stage: string;
  group: string | null;
  matchday: number | null;
  city: string | null;
  homeScore: number | null;
  awayScore: number | null;
  avgRating: number | null;
  reviewCount: number;
  homeCountry: { name: string; code: string; flag: string };
  awayCountry: { name: string; code: string; flag: string };
}

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const STAGES = ["Group Stage", "Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Third Place", "Final"];

export function MatchesFilter({ matches }: { matches: Match[] }) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  // All unique dates across all matches
  const allDates = useMemo(() => {
    const seen = new Set<string>();
    return matches
      .map(m => new Date(m.date).toISOString().slice(0, 10))
      .filter(d => { if (seen.has(d)) return false; seen.add(d); return true; });
  }, [matches]);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (activeStage && m.stage !== activeStage) return false;
      if (activeGroup && m.group !== activeGroup) return false;
      if (activeDate && new Date(m.date).toISOString().slice(0, 10) !== activeDate) return false;
      return true;
    });
  }, [matches, activeGroup, activeStage, activeDate]);

  // Group by date
  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const key = new Date(m.date).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [filtered]);

  function clearFilters() {
    setActiveGroup(null);
    setActiveStage(null);
    setActiveDate(null);
  }

  const isFiltered = activeGroup || activeStage || activeDate;

  return (
    <>
      {/* Filter bar — constrained to 2-card width using same grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="col-span-2 space-y-3 bg-white/60 rounded-xl p-4 border border-[#E0E0E0]">
        {/* Stage filters */}
        <div className="flex flex-wrap gap-2">
          {STAGES.map((stage) => {
            const hasMatches = matches.some(m => m.stage === stage);
            if (!hasMatches) return null;
            return (
              <button
                key={stage}
                onClick={() => setActiveStage(activeStage === stage ? null : stage)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-colors border",
                  activeStage === stage
                    ? "bg-foreground text-white border-foreground"
                    : "bg-white text-muted-foreground border-[#E0E0E0] hover:border-foreground hover:text-foreground"
                )}
              >
                {stage}
              </button>
            );
          })}
        </div>

        {/* Date dropdown */}
        <div>
          <select
            value={activeDate ?? ""}
            onChange={e => setActiveDate(e.target.value || null)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#E0E0E0] bg-white text-foreground cursor-pointer focus:outline-none focus:border-[#E8C93A]"
          >
            <option value="">All dates</option>
            {allDates.map((date) => {
              const today = new Date().toISOString().slice(0, 10);
              const d = new Date(date);
              const label = date === today ? "Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
              return <option key={date} value={date}>{label}</option>;
            })}
          </select>
        </div>

        {/* Group filters */}
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((group) => {
            const hasMatches = matches.some(m => m.group === group);
            if (!hasMatches) return null;
            return (
              <button
                key={group}
                onClick={() => setActiveGroup(activeGroup === group ? null : group)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-bold transition-colors border",
                  activeGroup === group
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-muted-foreground border-[#E0E0E0] hover:border-green-600 hover:text-green-600"
                )}
              >
                {group}
              </button>
            );
          })}
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="px-3 h-8 rounded-full text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No matches found.</p>
      ) : (
        [...byDate.entries()].map(([dateKey, dayMatches]) => (
          <section key={dateKey}>
            <h2 className="text-xl font-black text-foreground tracking-tight mb-4">
              <span className="border-b-2 border-black/30 pb-1">
                {new Date(dateKey).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })}
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {dayMatches.map((m) => (
                <MatchCard key={m.id} id={m.id} homeCountry={m.homeCountry} awayCountry={m.awayCountry}
                  homeScore={m.homeScore} awayScore={m.awayScore} date={m.date} city={m.city}
                  stage={m.stage} group={m.group} matchday={m.matchday}
                  avgRating={m.avgRating} reviewCount={m.reviewCount} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
