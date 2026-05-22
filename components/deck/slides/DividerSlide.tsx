import { SlideFrame } from "../SlideFrame";
import { accentVar } from "@/lib/slides/accent";
import type { DividerSlide as DividerSlideType } from "@/lib/slides/types";

export function DividerSlide({ slide }: { slide: DividerSlideType }) {
  return (
    <SlideFrame accent={slide.accent}>
      <div className="flex flex-1 flex-col justify-center">
        <div
          className="font-mono text-[10rem] font-bold leading-none tracking-tighter"
          style={{ color: accentVar[slide.accent], opacity: 0.9 }}
        >
          {slide.number}
        </div>
        <div className="mt-4 max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-[--color-deck-text]">
          {slide.name}
        </div>
        {slide.description ? (
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-[--color-deck-text-muted]">
            {slide.description}
          </p>
        ) : null}
      </div>
    </SlideFrame>
  );
}
