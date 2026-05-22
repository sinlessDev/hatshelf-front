type Props = { title: string; body: string };

export function Warning({ title, body }: Props) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: "var(--color-accent-red-soft)",
        borderColor: "var(--color-accent-red)",
      }}
    >
      <div
        className="mb-1 flex items-center gap-2 text-sm font-semibold"
        style={{ color: "var(--color-accent-red)" }}
      >
        <span className="font-mono">!</span>
        {title}
      </div>
      <p className="text-sm leading-relaxed text-[--color-deck-text]">{body}</p>
    </div>
  );
}

export function Tip({
  title,
  body,
  links,
}: {
  title: string;
  body?: string;
  links?: { label: string; url: string }[];
}) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: "var(--color-accent-blue-soft)",
        borderColor: "var(--color-accent-blue)",
      }}
    >
      <div
        className="mb-1 flex items-center gap-2 text-sm font-semibold"
        style={{ color: "var(--color-accent-blue)" }}
      >
        <span className="font-mono">i</span>
        {title}
      </div>
      {body ? (
        <p className="text-sm leading-relaxed text-[--color-deck-text]">{body}</p>
      ) : null}
      {links && links.length > 0 ? (
        <ul className={`flex flex-wrap gap-x-4 gap-y-1.5 ${body ? "mt-2" : ""}`}>
          {links.map((l, i) => (
            <li key={i}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-medium text-[--color-accent-blue] underline decoration-[--color-accent-blue]/30 underline-offset-4 transition hover:decoration-[--color-accent-blue]"
              >
                {l.label}
                <span className="ml-0.5 font-mono text-xs opacity-60">↗</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-base text-[--color-deck-text]">
      {items.map((b, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-1 shrink-0 font-mono text-sm text-[--color-deck-text-muted]">
            →
          </span>
          <span className="leading-relaxed">{b}</span>
        </li>
      ))}
    </ul>
  );
}

export function Lead({ text }: { text: string }) {
  return (
    <p className="text-lg leading-relaxed text-[--color-deck-text-muted]">{text}</p>
  );
}
