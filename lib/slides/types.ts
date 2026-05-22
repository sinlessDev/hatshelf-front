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

export type CodeBlock = {
  label: string;
  tone: "bad" | "good" | "neutral";
  lang: Lang;
  code: string;
  caption?: string;
};

export type Block =
  | { kind: "code-compare"; bad: CodeBlock; good: CodeBlock }
  | { kind: "code"; block: CodeBlock }
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
  timeBadge?: string;
  blocks: Block[];
};

export type Slide = TitleSlide | DividerSlide | ContentSlide;

export type HighlightedCode = { html: string };

export type PreparedBlock =
  | { kind: "code-compare"; bad: CodeBlock & HighlightedCode; good: CodeBlock & HighlightedCode }
  | { kind: "code"; block: CodeBlock & HighlightedCode }
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
