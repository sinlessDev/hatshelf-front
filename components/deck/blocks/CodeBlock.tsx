import type { CodeBlock as CodeBlockType, HighlightedCode } from "@/lib/slides/types";

type Props = {
  block: CodeBlockType & HighlightedCode;
};

const toneStyle = {
  bad: {
    label: "text-[--color-accent-red] bg-[--color-accent-red-soft]",
    border: "border-l-[--color-accent-red]",
  },
  good: {
    label: "text-[--color-accent-green] bg-[--color-accent-green-soft]",
    border: "border-l-[--color-accent-green]",
  },
  neutral: {
    label: "text-[--color-deck-text-muted] bg-white/5",
    border: "border-l-[--color-deck-border]",
  },
} as const;

export function CodeBlock({ block }: Props) {
  const tone = toneStyle[block.tone];
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[--color-deck-border] bg-[--color-deck-card] border-l-2 ${tone.border}`}
    >
      <div className="flex items-center justify-between border-b border-[--color-deck-border-soft] px-3 py-1.5">
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider ${tone.label}`}
        >
          {block.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[--color-deck-text-dim]">
          {block.lang}
        </span>
      </div>
      <div
        className="flex-1 overflow-auto px-4 py-3"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
      {block.caption ? (
        <div className="border-t border-[--color-deck-border-soft] px-4 py-2 text-xs text-[--color-deck-text-muted]">
          {block.caption}
        </div>
      ) : null}
    </div>
  );
}
