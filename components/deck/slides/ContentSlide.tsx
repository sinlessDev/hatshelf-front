import { SlideFrame } from "../SlideFrame";
import { CodeBlock } from "../blocks/CodeBlock";
import { CodeCompare } from "../blocks/CodeCompare";
import { InfoCard, Cards } from "../blocks/InfoCard";
import { Warning, Tip, Bullets, Lead } from "../blocks/Callouts";
import { TryItButton } from "../demos/TryItButton";
import { accentVar } from "@/lib/slides/accent";
import type { PreparedContentSlide, PreparedBlock } from "@/lib/slides/types";

function renderBlock(block: PreparedBlock, i: number) {
  switch (block.kind) {
    case "code-compare":
      return <CodeCompare key={i} bad={block.bad} good={block.good} />;
    case "code":
      return <CodeBlock key={i} block={block.block} />;
    case "card":
      return <InfoCard key={i} {...block} />;
    case "cards":
      return <Cards key={i} items={block.items} columns={block.columns} />;
    case "warning":
      return <Warning key={i} title={block.title} body={block.body} />;
    case "tip":
      return <Tip key={i} title={block.title} body={block.body} />;
    case "bullets":
      return <Bullets key={i} items={block.items} />;
    case "lead":
      return <Lead key={i} text={block.text} />;
  }
}

function hasCodeBlock(blocks: PreparedBlock[]) {
  return blocks.some((b) => b.kind === "code-compare" || b.kind === "code");
}

function findDemoId(blocks: PreparedBlock[]): string | undefined {
  for (const b of blocks) {
    if ((b.kind === "code-compare" || b.kind === "code") && b.demoId) {
      return b.demoId;
    }
  }
  return undefined;
}

export function ContentSlide({ slide }: { slide: PreparedContentSlide }) {
  const codeHeavy = hasCodeBlock(slide.blocks);
  const demoId = findDemoId(slide.blocks);
  return (
    <SlideFrame accent={slide.accent}>
      <header className="mb-6 flex items-center gap-4">
        {slide.icon ? (
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border font-mono text-base"
            style={{
              color: accentVar[slide.accent],
              borderColor: accentVar[slide.accent],
              backgroundColor: `color-mix(in srgb, ${accentVar[slide.accent]} 10%, transparent)`,
            }}
          >
            {slide.icon}
          </span>
        ) : null}
        <h2 className="flex-1 text-3xl font-semibold tracking-tight text-[--color-deck-text]">
          {slide.title}
        </h2>
        {demoId ? <TryItButton demoId={demoId} /> : null}
      </header>
      <div
        className={`flex min-h-0 flex-1 flex-col gap-4 ${codeHeavy ? "" : "justify-start"}`}
      >
        {slide.blocks.map((b, i) => renderBlock(b, i))}
      </div>
    </SlideFrame>
  );
}
