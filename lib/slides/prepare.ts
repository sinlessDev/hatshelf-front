import { highlight } from "../highlight";
import type { Block, PreparedBlock, PreparedSlide, Slide } from "./types";

async function prepareBlock(b: Block): Promise<PreparedBlock> {
  if (b.kind === "code-compare") {
    const [badHtml, goodHtml] = await Promise.all([
      highlight(b.bad.code, b.bad.lang),
      highlight(b.good.code, b.good.lang),
    ]);
    return {
      kind: "code-compare",
      bad: { ...b.bad, html: badHtml },
      good: { ...b.good, html: goodHtml },
      demoId: b.demoId,
    };
  }
  if (b.kind === "code") {
    const html = await highlight(b.block.code, b.block.lang);
    return { kind: "code", block: { ...b.block, html }, demoId: b.demoId };
  }
  return b;
}

export async function prepareSlides(slides: Slide[]): Promise<PreparedSlide[]> {
  return Promise.all(
    slides.map(async (s) => {
      if (s.kind !== "content") return s;
      const blocks = await Promise.all(s.blocks.map(prepareBlock));
      return { ...s, blocks };
    }),
  );
}
