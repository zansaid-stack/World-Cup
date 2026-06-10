"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  0.5: "Unwatchable",
  1: "Bad",
  1.5: "Below Average",
  2: "Average",
  2.5: "Decent",
  3: "Good",
  3.5: "Really Good",
  4: "Great",
  4.5: "Incredible",
  5: "All-Time Classic",
};

export function StarRating({ value, onChange, readonly = false, size = "md", showLabel = false }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const starSizes = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const gapSizes = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  };

  const displayed = hovered ?? value;

  function handleMouseMove(starIndex: number, e: React.MouseEvent<SVGSVGElement>) {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x < rect.width / 2;
    setHovered(half ? starIndex - 0.5 : starIndex);
  }

  function handleClick(starIndex: number, e: React.MouseEvent<SVGSVGElement>) {
    if (readonly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x < rect.width / 2;
    const newVal = half ? starIndex - 0.5 : starIndex;
    onChange(newVal);
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn("flex items-center", gapSizes[size])}
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = displayed >= star;
          const halfFilled = !filled && displayed >= star - 0.5;

          return (
            <svg
              key={star}
              className={cn(
                starSizes[size],
                "transition-transform",
                !readonly && "cursor-pointer hover:scale-110"
              )}
              viewBox="0 0 24 24"
              onMouseMove={(e) => handleMouseMove(star, e)}
              onClick={(e) => handleClick(star, e)}
            >
              <defs>
                <linearGradient id={`half-${star}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#C4BDB0" />
                </linearGradient>
              </defs>
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={filled ? "#f97316" : halfFilled ? `url(#half-${star})` : "#C4BDB0"}
                stroke={filled || halfFilled ? "#f97316" : "#ADA69A"}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          );
        })}
      </div>
      {showLabel && displayed > 0 && (
        <span className="text-xs text-orange-400 font-medium">
          {RATING_LABELS[displayed] ?? ""}
        </span>
      )}
    </div>
  );
}
