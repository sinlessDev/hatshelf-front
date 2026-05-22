import type {
  Block,
  CodeBlock,
  LocBlock,
  LocCodeBlock,
  LocSlide,
  LocSlideNote,
  Slide,
  SlideNote,
} from "./types";

/**
 * Minimal subset of the next-intl translator we need. We accept it as a
 * parameter so this module stays usable from both server and client (the
 * caller provides whichever `t` they have).
 */
export type Translator = {
  (key: string): string;
  raw: (key: string) => unknown;
};

function tArray(t: Translator, key: string): string[] {
  const value = t.raw(key);
  if (!Array.isArray(value)) {
    throw new Error(
      `Expected message "${key}" to be a string array, got ${typeof value}`,
    );
  }
  return value.map(String);
}

function resolveCodeBlock(b: LocCodeBlock, t: Translator): CodeBlock {
  return {
    label: t(b.labelKey),
    tone: b.tone,
    lang: b.lang,
    code: b.code,
    ...(b.captionKey ? { caption: t(b.captionKey) } : {}),
  };
}

function resolveBlock(b: LocBlock, t: Translator): Block {
  switch (b.kind) {
    case "code-compare":
      return {
        kind: "code-compare",
        bad: resolveCodeBlock(b.bad, t),
        good: resolveCodeBlock(b.good, t),
        demoId: b.demoId,
      };
    case "code":
      return {
        kind: "code",
        block: resolveCodeBlock(b.block, t),
        demoId: b.demoId,
      };
    case "card":
      return {
        kind: "card",
        accent: b.accent,
        title: t(b.titleKey),
        ...(b.bodyKey ? { body: t(b.bodyKey) } : {}),
        ...(b.bulletsKey ? { bullets: tArray(t, b.bulletsKey) } : {}),
      };
    case "cards":
      return {
        kind: "cards",
        columns: b.columns,
        items: b.items.map((it) => ({
          title: t(it.titleKey),
          accent: it.accent,
          ...(it.bodyKey ? { body: t(it.bodyKey) } : {}),
          ...(it.bulletsKey ? { bullets: tArray(t, it.bulletsKey) } : {}),
        })),
      };
    case "warning":
      return {
        kind: "warning",
        title: t(b.titleKey),
        body: t(b.bodyKey),
      };
    case "tip":
      return {
        kind: "tip",
        title: t(b.titleKey),
        ...(b.bodyKey ? { body: t(b.bodyKey) } : {}),
        ...(b.links
          ? {
              links: b.links.map((l) => ({
                label: t(l.labelKey),
                url: l.url,
              })),
            }
          : {}),
      };
    case "bullets":
      return { kind: "bullets", items: tArray(t, b.itemsKey) };
    case "lead":
      return { kind: "lead", text: t(b.textKey) };
  }
}

export function resolveSlide(s: LocSlide, t: Translator): Slide {
  switch (s.kind) {
    case "title":
      return {
        kind: "title",
        title: t(s.titleKey),
        ...(s.subtitleKey ? { subtitle: t(s.subtitleKey) } : {}),
        tags: s.tags,
        ...(s.footerKey ? { footer: t(s.footerKey) } : {}),
      };
    case "divider":
      return {
        kind: "divider",
        number: s.number,
        name: t(s.nameKey),
        ...(s.descriptionKey ? { description: t(s.descriptionKey) } : {}),
        accent: s.accent,
      };
    case "content":
      return {
        kind: "content",
        accent: s.accent,
        icon: s.icon,
        title: t(s.titleKey),
        blocks: s.blocks.map((b) => resolveBlock(b, t)),
      };
  }
}

export function resolveSlides(slides: LocSlide[], t: Translator): Slide[] {
  return slides.map((s) => resolveSlide(s, t));
}

export function resolveNote(n: LocSlideNote, t: Translator): SlideNote {
  return {
    summary: t(n.summaryKey),
    talkingPoints: tArray(t, n.talkingPointsKey),
    ...(n.detailsKey ? { details: t(n.detailsKey) } : {}),
    ...(n.watchForKey ? { watchFor: tArray(t, n.watchForKey) } : {}),
    ...(n.transitionKey ? { transition: t(n.transitionKey) } : {}),
  };
}

export function resolveNotes(
  notes: LocSlideNote[],
  t: Translator,
): SlideNote[] {
  return notes.map((n) => resolveNote(n, t));
}
