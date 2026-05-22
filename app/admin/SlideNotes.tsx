"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LocateFixedIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { slides } from "@/lib/slides/data";
import { slideNotes } from "@/lib/slides/notes";
import { resolveNotes, resolveSlides } from "@/lib/slides/resolve";
import type { Slide } from "@/lib/slides/types";

function slideHeading(
  slide: Slide,
  t: ReturnType<typeof useTranslations<"ui.notes">>,
): { title: string; kind: string } {
  if (slide.kind === "title") return { title: slide.title, kind: t("titleKind") };
  if (slide.kind === "divider")
    return { title: `${slide.number} · ${slide.name}`, kind: t("dividerKind") };
  return { title: slide.title, kind: t("contentKind") };
}

function clamp(n: number, max: number) {
  return Math.max(0, Math.min(n, max));
}

function subscribeDeck(cb: () => void) {
  const ch = new BroadcastChannel("hatshelf-deck");
  ch.onmessage = (e) => {
    if (e.data?.type === "slide" && typeof e.data.index === "number") {
      try {
        localStorage.setItem("hatshelf:slide", String(e.data.index));
      } catch {
        /* ignore */
      }
      cb();
    }
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === "hatshelf:slide") cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    ch.close();
    window.removeEventListener("storage", onStorage);
  };
}

function readDeckIndex(): number | null {
  try {
    const raw = localStorage.getItem("hatshelf:slide");
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function SlideNotes() {
  const t = useTranslations("ui.notes");
  const tRoot = useTranslations();

  const resolvedSlides = useMemo(() => resolveSlides(slides, tRoot), [tRoot]);
  const resolvedNotes = useMemo(() => resolveNotes(slideNotes, tRoot), [tRoot]);

  const max = resolvedSlides.length - 1;
  const rawDeckIndex = useSyncExternalStore(
    subscribeDeck,
    readDeckIndex,
    () => null,
  );
  const deckIndex = rawDeckIndex === null ? null : clamp(rawDeckIndex, max);
  // `browsed` decouples viewIndex when the user navigates manually. While
  // null, the panel follows the deck (viewIndex === deckIndex).
  const [browsed, setBrowsed] = useState<number | null>(null);
  const viewIndex = browsed ?? deckIndex ?? 0;

  const goTo = (next: number) => setBrowsed(clamp(next, max));
  const resync = () => setBrowsed(null);

  const slide = resolvedSlides[viewIndex];
  const { title, kind } = slideHeading(slide, t);
  const note = resolvedNotes[viewIndex];
  const isAhead = deckIndex !== null && viewIndex !== deckIndex;

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {String(viewIndex + 1).padStart(2, "0")} /{" "}
                {String(resolvedSlides.length).padStart(2, "0")}
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {kind}
              </Badge>
              {deckIndex === null ? (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {t("deckOffline")}
                </Badge>
              ) : isAhead ? (
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] text-amber-500"
                >
                  {t("browsing")}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] text-green-500"
                >
                  {t("following")}
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => goTo(viewIndex - 1)}
              disabled={viewIndex === 0}
              aria-label={t("jumpBack")}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => goTo(viewIndex + 1)}
              disabled={viewIndex === max}
              aria-label={t("jumpBack")}
            >
              <ChevronRightIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={resync}
              disabled={!isAhead || deckIndex === null}
              aria-label={t("jumpBack")}
              title={t("jumpBack")}
            >
              <LocateFixedIcon />
            </Button>
          </div>
        </div>

        <Separator />

        {note ? (
          <div className="flex flex-col gap-4 text-sm leading-relaxed">
            <p className="text-foreground">{note.summary}</p>

            <NotesSection title={t("talkingPoints")}>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
                {note.talkingPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </NotesSection>

            {note.details ? (
              <NotesSection title={t("details")}>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {note.details}
                </p>
              </NotesSection>
            ) : null}

            {note.watchFor && note.watchFor.length > 0 ? (
              <NotesSection title={t("watchFor")}>
                <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
                  {note.watchFor.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </NotesSection>
            ) : null}

            {note.transition ? (
              <NotesSection title={t("transition")}>
                <p className="text-muted-foreground italic">
                  → {note.transition}
                </p>
              </NotesSection>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">{t("none")}</p>
        )}
      </CardContent>
    </Card>
  );
}

function NotesSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}
