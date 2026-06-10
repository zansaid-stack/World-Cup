import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { rating, content } = await req.json();

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.review.update({ where: { id }, data: { rating, content } });
  return NextResponse.json(updated);
}
