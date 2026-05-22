import type { Accent } from "@/lib/slides/types";
import { accentVar } from "@/lib/slides/accent";

type Props = {
  accent: Accent;
  children: React.ReactNode;
};

export function SlideFrame({ accent, children }: Props) {
  return (
    <div className="relative flex h-full w-full flex-col bg-[--color-deck-bg]">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: accentVar[accent] }}
      />
      <div className="flex min-h-0 flex-1 flex-col px-16 pt-16 pb-24">{children}</div>
    </div>
  );
}
