"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PreparedSlide } from "@/lib/slides/types";
import { accentVar } from "@/lib/slides/accent";
import { TitleSlide } from "./slides/TitleSlide";
import { DividerSlide } from "./slides/DividerSlide";
import { ContentSlide } from "./slides/ContentSlide";

function parseHash(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.location.hash.replace("#", "");
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, max: number) {
  return Math.max(0, Math.min(n, max));
}

function getAccent(slide: PreparedSlide) {
  if (slide.kind === "title") return "neutral" as const;
  if (slide.kind === "divider") return slide.accent;
  return slide.accent;
}

export function Deck({ slides }: { slides: PreparedSlide[] }) {
  const max = slides.length - 1;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (next: number) => {
      const target = clamp(next, max);
      setDirection(target > index ? 1 : -1);
      setIndex(target);
    },
    [index, max],
  );

  // Init from hash + listen
  useEffect(() => {
    const initial = clamp(parseHash() - 1, max);
    if (initial > 0) setIndex(initial);
    const onHash = () => {
      const n = clamp(parseHash() - 1, max);
      setIndex((curr) => {
        if (n === curr) return curr;
        setDirection(n > curr ? 1 : -1);
        return n;
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [max]);

  // Sync hash
  useEffect(() => {
    const next = `#${index + 1}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [index]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(index + 1);
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(max);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, max]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) go(index + 1);
      else go(index - 1);
    }
    touchStart.current = null;
  };

  const slide = slides[index];
  const accent = getAccent(slide);
  const progress = ((index + 1) / slides.length) * 100;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[--color-deck-bg]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          {slide.kind === "title" ? (
            <TitleSlide slide={slide} />
          ) : slide.kind === "divider" ? (
            <DividerSlide slide={slide} />
          ) : (
            <ContentSlide slide={slide} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="h-[2px] w-full bg-[--color-deck-border-soft]">
          <motion.div
            className="h-full"
            style={{ backgroundColor: accentVar[accent] }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>
        <div className="pointer-events-auto flex items-center justify-between px-6 py-3">
          <div className="font-mono text-xs text-[--color-deck-text-dim]">
            Backend Security · Astana IT University
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tabular-nums text-[--color-deck-text-muted]">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <NavButton
                disabled={index === 0}
                onClick={() => go(index - 1)}
                label="Previous slide"
              >
                ←
              </NavButton>
              <NavButton
                disabled={index === max}
                onClick={() => go(index + 1)}
                label="Next slide"
              >
                →
              </NavButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-md border border-[--color-deck-border] bg-[--color-deck-card] font-mono text-sm text-[--color-deck-text] transition hover:bg-[--color-deck-card-hover] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[--color-deck-card]"
    >
      {children}
    </button>
  );
}
