"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const R = 130;
const C = 2 * Math.PI * R;

interface Props {
  count: number;
  total: number;
  badges: number[];
}

export function TrophyMeter({ count, total, badges }: Props) {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedCount(count), 100);
    return () => clearTimeout(timer);
  }, [count]);

  const progress = Math.min(animatedCount / total, 1);
  const dashoffset = C * (1 - progress);

  return (
    <div className="relative w-[300px] h-[300px]">
      {/* Arc meter */}
      <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full">
        {/* Background track */}
        <circle
          cx="150" cy="150" r={R}
          fill="none"
          stroke="#E8E8E8"
          strokeWidth="14"
        />

        {/* Progress arc — starts from top via rotate(-90) */}
        <circle
          cx="150" cy="150" r={R}
          fill="none"
          stroke="#E8C93A"
          strokeWidth="14"
          strokeDasharray={C}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform="rotate(-90, 150, 150)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />

        {/* Badge milestone dots */}
        {badges.map((threshold) => {
          const angle = (threshold / total) * 2 * Math.PI - Math.PI / 2;
          const x = 150 + R * Math.cos(angle);
          const y = 150 + R * Math.sin(angle);
          const earned = count >= threshold;
          return (
            <circle
              key={threshold}
              cx={x} cy={y} r={5}
              fill={earned ? "#16a34a" : "#CCCCCC"}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* Trophy image centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/trophy-transparent.png"
          alt="World Cup Trophy"
          width={110}
          height={190}
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}
