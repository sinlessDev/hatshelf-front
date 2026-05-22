export type Accent = "blue" | "red" | "green" | "purple" | "amber" | "neutral";

export type Lang =
  | "ts"
  | "js"
  | "tsx"
  | "python"
  | "sql"
  | "bash"
  | "nginx"
  | "yaml"
  | "json"
  | "http";

// ─────────────────────────────────────────────────────────────────────
// Resolved (rendered) shapes — locale-free, single language strings.
// All renderer components consume these.
// ─────────────────────────────────────────────────────────────────────

export type CodeBlock = {
  label: string;
  tone: "bad" | "good" | "neutral";
  lang: Lang;
  code: string;
  caption?: string;
};

export type Block =
  | { kind: "code-compare"; bad: CodeBlock; good: CodeBlock; demoId?: string }
  | { kind: "code"; block: CodeBlock; demoId?: string }
  | { kind: "card"; accent?: Accent; title: string; body?: string; bullets?: string[] }
  | {
      kind: "cards";
      columns?: 2 | 3 | 4;
      items: { title: string; accent?: Accent; body?: string; bullets?: string[] }[];
    }
  | { kind: "warning"; title: string; body: string }
  | {
      kind: "tip";
      title: string;
      body?: string;
      links?: { label: string; url: string }[];
    }
  | { kind: "bullets"; items: string[] }
  | { kind: "lead"; text: string };

export type TitleSlide = {
  kind: "title";
  title: string;
  subtitle?: string;
  tags?: string[];
  footer?: string;
};

export type DividerSlide = {
  kind: "divider";
  number: string;
  name: string;
  description?: string;
  accent: Accent;
};

export type ContentSlide = {
  kind: "content";
  accent: Accent;
  icon?: string;
  title: string;
  blocks: Block[];
};

export type Slide = TitleSlide | DividerSlide | ContentSlide;

export type HighlightedCode = { html: string };

export type PreparedBlock =
  | {
      kind: "code-compare";
      bad: CodeBlock & HighlightedCode;
      good: CodeBlock & HighlightedCode;
      demoId?: string;
    }
  | { kind: "code"; block: CodeBlock & HighlightedCode; demoId?: string }
  | Extract<
      Block,
      | { kind: "card" }
      | { kind: "cards" }
      | { kind: "warning" }
      | { kind: "tip" }
      | { kind: "bullets" }
      | { kind: "lead" }
    >;

export type PreparedContentSlide = Omit<ContentSlide, "blocks"> & {
  blocks: PreparedBlock[];
};

export type PreparedSlide = TitleSlide | DividerSlide | PreparedContentSlide;

// ─────────────────────────────────────────────────────────────────────
// Authored (source) shapes — every translatable string is a key into
// the next-intl message catalog (e.g., "slide.passwords.title").
// `data.ts` / `notes.ts` use these; `resolve.ts` folds them into the
// resolved shapes above using the locale-bound `t` function.
// ─────────────────────────────────────────────────────────────────────

/** A dotted key path into messages/{locale}.json. */
export type MsgKey = string;

export type LocCodeBlock = {
  labelKey: MsgKey;
  tone: "bad" | "good" | "neutral";
  lang: Lang;
  code: string;
  captionKey?: MsgKey;
};

export type LocBlock =
  | { kind: "code-compare"; bad: LocCodeBlock; good: LocCodeBlock; demoId?: string }
  | { kind: "code"; block: LocCodeBlock; demoId?: string }
  | {
      kind: "card";
      accent?: Accent;
      titleKey: MsgKey;
      bodyKey?: MsgKey;
      bulletsKey?: MsgKey;
    }
  | {
      kind: "cards";
      columns?: 2 | 3 | 4;
      items: {
        titleKey: MsgKey;
        accent?: Accent;
        bodyKey?: MsgKey;
        bulletsKey?: MsgKey;
      }[];
    }
  | { kind: "warning"; titleKey: MsgKey; bodyKey: MsgKey }
  | {
      kind: "tip";
      titleKey: MsgKey;
      bodyKey?: MsgKey;
      links?: { labelKey: MsgKey; url: string }[];
    }
  | { kind: "bullets"; itemsKey: MsgKey }
  | { kind: "lead"; textKey: MsgKey };

export type LocTitleSlide = {
  kind: "title";
  titleKey: MsgKey;
  subtitleKey?: MsgKey;
  tags?: string[];
  footerKey?: MsgKey;
};

export type LocDividerSlide = {
  kind: "divider";
  number: string;
  nameKey: MsgKey;
  descriptionKey?: MsgKey;
  accent: Accent;
};

export type LocContentSlide = {
  kind: "content";
  accent: Accent;
  icon?: string;
  titleKey: MsgKey;
  blocks: LocBlock[];
};

export type LocSlide = LocTitleSlide | LocDividerSlide | LocContentSlide;

export type LocSlideNote = {
  summaryKey: MsgKey;
  talkingPointsKey: MsgKey;
  detailsKey?: MsgKey;
  watchForKey?: MsgKey;
  transitionKey?: MsgKey;
};

export type SlideNote = {
  summary: string;
  talkingPoints: string[];
  details?: string;
  watchFor?: string[];
  transition?: string;
};
