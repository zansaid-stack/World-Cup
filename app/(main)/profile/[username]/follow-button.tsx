"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FollowButton({ userId, isFollowing: initial }: { userId: string; isFollowing: boolean }) {
  const [isFollowing, setIsFollowing] = useState(initial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/follow", {
      method: isFollowing ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: userId }),
    });
    if (res.ok) {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed" : "Following!");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={isFollowing ? "bg-[#E0E0E0] text-foreground hover:bg-red-100 hover:text-red-600" : "bg-green-600 text-white hover:bg-green-700"}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
