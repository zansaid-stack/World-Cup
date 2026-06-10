"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/shared/star-rating";
import { toast } from "sonner";

interface FeedReview {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  match: {
    id: string;
    homeCountry: { name: string; flag: string; code: string };
    awayCountry: { name: string; flag: string; code: string };
    stage: string;
    group: string | null;
  };
}

interface FollowedUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  _count: { reviews: number };
}

interface SearchResult extends FollowedUser {
  isFollowing: boolean;
}

interface Props {
  currentUserId?: string; // reserved for future use
  following: FollowedUser[];
  feed: FeedReview[];
}

export function FriendsClient({ currentUserId, following, feed }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [, startTransition] = useTransition();

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
    } finally {
      setSearching(false);
    }
  }

  async function toggleFollow(userId: string, isFollowing: boolean) {
    const method = isFollowing ? "DELETE" : "POST";
    const res = await fetch("/api/follow", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: userId }),
    });
    if (!res.ok) { toast.error("Something went wrong"); return; }
    toast.success(isFollowing ? "Unfollowed" : "Following!");
    setResults(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: !isFollowing } : u));
    startTransition(() => router.refresh());
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 space-y-10 max-w-2xl">

        {/* Search */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Find Friends</h2>
          <Input
            placeholder="Search by username..."
            value={query}
            onChange={e => search(e.target.value)}
            className="bg-white"
          />
          {searching && <p className="text-sm text-muted-foreground">Searching...</p>}
          {!searching && results.length > 0 && (
            <div className="space-y-2">
              {results.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-white rounded-xl border border-[#E0E0E0] px-4 py-3">
                  <div>
                    <div className="font-semibold text-foreground text-sm">{u.displayName ?? u.username}</div>
                    <div className="text-xs text-muted-foreground">@{u.username} · {u._count.reviews} reviews</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => toggleFollow(u.id, u.isFollowing)}
                    className={u.isFollowing ? "bg-[#E0E0E0] text-foreground hover:bg-red-100 hover:text-red-600" : "bg-green-600 text-white hover:bg-green-700"}
                  >
                    {u.isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="text-sm text-muted-foreground">No users found.</p>
          )}
        </div>

        {/* Following list */}
        {following.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Following ({following.length})</h2>
            <div className="grid grid-cols-2 gap-2">
              {following.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-white rounded-xl border border-[#E0E0E0] px-3 py-2">
                  <div>
                    <div className="font-semibold text-sm text-foreground">{u.displayName ?? u.username}</div>
                    <div className="text-xs text-muted-foreground">@{u.username}</div>
                  </div>
                  <button
                    onClick={() => toggleFollow(u.id, true)}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors ml-2"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity feed */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            {feed.length > 0 ? "Friends&apos; Activity" : "No activity yet"}
          </h2>
          {feed.length === 0 && following.length === 0 && (
            <p className="text-sm text-muted-foreground">Follow some friends to see their match ratings here.</p>
          )}
          {feed.length === 0 && following.length > 0 && (
            <p className="text-sm text-muted-foreground">Your friends haven&apos;t rated any matches yet.</p>
          )}
          <div className="space-y-3">
            {feed.map(review => (
              <Link key={review.id} href={`/matches/${review.match.id}`}>
                <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 hover:border-[#BBBBBB] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm text-foreground">{review.user.displayName ?? review.user.username}</div>
                    <StarRating value={review.rating} readonly size="sm" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {review.match.awayCountry.flag} {review.match.awayCountry.code} vs {review.match.homeCountry.flag} {review.match.homeCountry.code}
                    <span className="ml-2 text-xs">· {review.match.group ? `Group ${review.match.group}` : review.match.stage}</span>
                  </div>
                  {review.content && (
                    <p className="text-sm text-foreground line-clamp-2">{review.content}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
