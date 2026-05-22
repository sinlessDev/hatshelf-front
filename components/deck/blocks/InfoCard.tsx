import { accentVar, accentSoftVar } from "@/lib/slides/accent";
import type { Accent } from "@/lib/slides/types";

type Props = {
  accent?: Accent;
  title: string;
  body?: string;
  bullets?: string[];
};

export function InfoCard({ accent = "neutral", title, body, bullets }: Props) {
  return (
    <div
      className="rounded-lg border border-[--color-deck-border] bg-[--color-deck-card] p-5"
      style={{
        borderLeftColor: accentVar[accent],
        borderLeftWidth: 3,
      }}
    >
      <div
        className="mb-2 text-xs font-semibold uppercase tracking-wider"
        style={{ color: accentVar[accent] }}
      >
        {title}
      </div>
      {body ? (
        <p className="text-sm leading-relaxed text-[--color-deck-text]">{body}</p>
      ) : null}
      {bullets && bullets.length > 0 ? (
        <ul className="space-y-1.5 text-sm text-[--color-deck-text]">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span
                className="mt-[2px] shrink-0 font-mono text-xs"
                style={{ color: accentVar[accent] }}
              >
                →
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Cards({
  items,
  columns = 3,
}: {
  items: Props[];
  columns?: 2 | 3 | 4;
}) {
  const cols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  }[columns];
  // Suppress unused
  void accentSoftVar;
  return (
    <div className={`grid gap-4 ${cols}`}>
      {items.map((it, i) => (
        <InfoCard key={i} {...it} />
      ))}
    </div>
  );
}
