"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/shared/star-rating";
import { useUser } from "@/hooks/use-user";

interface ReviewFormProps {
  matchId: string;
  existingReview?: { id: string; content: string; rating: number; spoiler: boolean };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ matchId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useUser();
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [content, setContent] = useState(existingReview?.content ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Sign in to write a review"); return; }
    if (rating === 0) { toast.error("Please add a star rating"); return; }
    if (content.trim().length < 10) { toast.error("Review must be at least 10 characters"); return; }

    setSubmitting(true);
    try {
      const url = existingReview ? `/api/reviews/${existingReview.id}` : "/api/reviews";
      const method = existingReview ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, rating, content: content.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to submit");
      }
      toast.success(existingReview ? "Review updated!" : "Review published!");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Your Rating</Label>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size="lg" showLabel />
          {rating === 0 && <span className="text-sm text-muted-foreground">Click to rate</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Review</Label>
        <Textarea
          id="content"
          placeholder="What made this match memorable? Who was the standout player?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground text-right">{content.length}/2000</p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={submitting} className="bg-[#E8C93A] text-black hover:bg-[#E8C93A]/90">
          {submitting ? "Publishing..." : existingReview ? "Update Review" : "Publish Review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
