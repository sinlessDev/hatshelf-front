import { SlideFrame } from "../SlideFrame";
import type { TitleSlide as TitleSlideType } from "@/lib/slides/types";

export function TitleSlide({ slide }: { slide: TitleSlideType }) {
  return (
    <SlideFrame accent="neutral">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="max-w-5xl text-balance text-6xl font-bold leading-[1.05] tracking-tight text-[--color-deck-text]">
          {slide.title}
        </h1>
        {slide.subtitle ? (
          <p className="mt-6 max-w-3xl text-balance text-xl text-[--color-deck-text-muted]">
            {slide.subtitle}
          </p>
        ) : null}
        {slide.tags && slide.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {slide.tags.map((t, i) => (
              <span
                key={i}
                className="rounded-full border border-[--color-deck-border] bg-[--color-deck-card] px-3 py-1 font-mono text-xs text-[--color-deck-text-muted]"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
        {slide.footer ? (
          <p className="mt-12 font-mono text-sm text-[--color-deck-text-dim]">
            {slide.footer}
          </p>
        ) : null}
      </div>
    </SlideFrame>
  );
}
