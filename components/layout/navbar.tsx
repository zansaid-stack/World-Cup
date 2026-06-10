"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { User, LogOut, Home, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const [profile, setProfile] = useState<{ username: string; displayName: string | null; avatarUrl: string | null } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetch("/api/users/me").then((r) => r.json()).then((d) => { if (d.username) setProfile(d); }).catch(() => {});
    } else {
      // Use a timeout to avoid setState-in-effect lint error
      const t = setTimeout(() => setProfile(null), 0);
      return () => clearTimeout(t);
    }
  }, [user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
    toast.success("Signed out");
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/matches", label: "Matches", icon: Trophy },
    { href: "/badges", label: "Badges", icon: Trophy },
    { href: "/friends", label: "Friends", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e0d9b8] bg-[#faf8f0] backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2.5 flex-1 group">
          <Image src="/trophy-transparent.png" alt="trophy" width={18} height={38} className="object-contain" unoptimized />
          <span className="text-xl font-black tracking-tighter text-foreground">
            FULL<span className="text-green-600">TIME</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href ? "text-foreground bg-[#DDD7CA]" : "text-foreground/70 hover:text-foreground hover:bg-[#E8E3D8]"
            )}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 flex-1 justify-end">
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-green-600">
                      <Avatar className="h-9 w-9 border-2 border-[#CCCCCC] hover:border-green-600 transition-colors">
                        <AvatarImage src={profile?.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs bg-green-600/20 text-green-700">
                          {profile?.displayName ? getInitials(profile.displayName) : profile?.username?.slice(0, 2).toUpperCase() ?? "??"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div className="font-medium">{profile?.displayName ?? profile?.username}</div>
                      {profile?.username && <div className="text-xs text-muted-foreground font-normal">@{profile.username}</div>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {profile?.username && (
                      <DropdownMenuItem asChild>
                        <Link href={`/profile/${profile.username}`} className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild><Link href="/login">Sign in</Link></Button>
                  <Button size="sm" asChild className="bg-[#E8C93A] text-black hover:bg-[#E8C93A]/90"><Link href="/signup">Join</Link></Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
