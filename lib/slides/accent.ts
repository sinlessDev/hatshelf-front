import type { Accent } from "./types";

export const accentVar: Record<Accent, string> = {
  blue: "var(--color-accent-blue)",
  red: "var(--color-accent-red)",
  green: "var(--color-accent-green)",
  purple: "var(--color-accent-purple)",
  amber: "var(--color-accent-amber)",
  neutral: "var(--color-deck-text-muted)",
};

export const accentSoftVar: Record<Accent, string> = {
  blue: "var(--color-accent-blue-soft)",
  red: "var(--color-accent-red-soft)",
  green: "var(--color-accent-green-soft)",
  purple: "var(--color-accent-purple-soft)",
  amber: "var(--color-accent-amber-soft)",
  neutral: "rgba(139, 148, 158, 0.10)",
};

export function accentStyle(a: Accent) {
  return {
    color: accentVar[a],
    backgroundColor: accentSoftVar[a],
    borderColor: accentVar[a],
  } as const;
}
