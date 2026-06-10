import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), "MMM d, yyyy");
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatGameDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), "MMMM d, yyyy");
}

export function formatSeason(season: string): string {
  return season; // "2023-24"
}

/** Convert 0.5–5.0 rating to display string */
export function formatRating(rating: number): string {
  return rating % 1 === 0 ? `${rating}.0` : `${rating}`;
}

/** Generate a CSS gradient from two hex colors (team colors) */
export function teamGradient(color1: string, color2: string): string {
  return `linear-gradient(135deg, ${color1}dd 0%, ${color1}88 40%, ${color2}88 60%, ${color2}dd 100%)`;
}

/** Darken a hex color for overlays */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural ?? singular + "s"}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
