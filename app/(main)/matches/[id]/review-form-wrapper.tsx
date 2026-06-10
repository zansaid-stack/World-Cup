"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ReviewForm } from "@/components/reviews/review-form";
import { Button } from "@/components/ui/button";

interface Props {
  matchId: string;
  user: User | null;
  existingReview?: { id: string; content: string; rating: number; spoiler: boolean };
}

export function ReviewFormWrapper({ matchId, user, existingReview }: Props) {
  const router = useRouter();

  if (!user) {
    return (
      <div className="rounded-xl border border-[#E0E0E0] bg-white p-6 text-center h-full flex flex-col justify-center">
        <h3 className="font-semibold text-foreground mb-2">Log this match</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to rate this match and write a review.
        </p>
        <div className="flex flex-col items-center gap-2">
          <Button asChild className="bg-green-600 text-white hover:bg-green-700"><Link href="/login">Sign in</Link></Button>
          <Button asChild className="bg-[#E8C93A] text-black hover:bg-[#E8C93A]/90"><Link href="/signup">Create account</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
      <h3 className="font-semibold text-foreground mb-4">
        {existingReview ? "Edit Your Review" : "Log This Match"}
      </h3>
      <ReviewForm
        matchId={matchId}
        existingReview={existingReview}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
