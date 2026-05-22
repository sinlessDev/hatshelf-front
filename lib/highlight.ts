import "server-only";
import { createHighlighter, type Highlighter } from "shiki";
import type { Lang } from "./slides/types";

const LANGS: Lang[] = [
  "ts",
  "js",
  "tsx",
  "python",
  "sql",
  "bash",
  "nginx",
  "yaml",
  "json",
  "http",
];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark-default"],
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang: Lang): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang,
    theme: "github-dark-default",
  });
}
