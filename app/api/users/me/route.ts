import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let profile = await prisma.user.findUnique({ where: { id: user.id } });

  // Auto-create profile on first login using Supabase metadata
  if (!profile) {
    const meta = user.user_metadata ?? {};
    const username = meta.username ?? user.email?.split("@")[0] ?? user.id.slice(0, 8);
    profile = await prisma.user.create({
      data: {
        id: user.id,
        username,
        displayName: meta.display_name ?? meta.displayName ?? null,
        avatarUrl: meta.avatar_url ?? null,
      },
    });
  }

  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, displayName } = await req.json();

  const profile = await prisma.user.upsert({
    where: { id: user.id },
    update: { displayName: displayName ?? null },
    create: { id: user.id, username, displayName: displayName ?? null },
  });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName, bio } = await req.json();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
    },
  });

  return NextResponse.json(updated);
}
