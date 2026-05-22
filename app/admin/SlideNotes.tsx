"use client";

import { useEffect, useState } from "react";
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
import type { Slide } from "@/lib/slides/types";

function slideHeading(slide: Slide): { title: string; kind: string } {
  if (slide.kind === "title") return { title: slide.title, kind: "TITLE" };
  if (slide.kind === "divider")
    return { title: `${slide.number} · ${slide.name}`, kind: "DIVIDER" };
  return { title: slide.title, kind: "CONTENT" };
}

function clamp(n: number, max: number) {
  return Math.max(0, Math.min(n, max));
}

export function SlideNotes() {
  const max = slides.length - 1;
  const [deckIndex, setDeckIndex] = useState<number | null>(null);
  const [viewIndex, setViewIndex] = useState(0);
  const [following, setFollowing] = useState(true);

  // Restore last-known deck slide on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hatshelf:slide");
      if (raw !== null) {
        const n = clamp(parseInt(raw, 10) || 0, max);
        setDeckIndex(n);
        setViewIndex(n);
      }
    } catch {
      /* ignore */
    }
  }, [max]);

  // Subscribe to deck broadcasts
  useEffect(() => {
    const ch = new BroadcastChannel("hatshelf-deck");
    ch.onmessage = (e) => {
      if (e.data?.type === "slide" && typeof e.data.index === "number") {
        const n = clamp(e.data.index, max);
        setDeckIndex(n);
        setFollowing((f) => {
          if (f) setViewIndex(n);
          return f;
        });
      }
    };
    return () => ch.close();
  }, [max]);

  const goTo = (next: number) => {
    setViewIndex(clamp(next, max));
    setFollowing(false);
  };

  const resync = () => {
    if (deckIndex === null) return;
    setViewIndex(deckIndex);
    setFollowing(true);
  };

  const slide = slides[viewIndex];
  const { title, kind } = slideHeading(slide);
  const note = slideNotes[viewIndex];
  const isAhead = deckIndex !== null && viewIndex !== deckIndex;

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {String(viewIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {kind}
              </Badge>
              {deckIndex === null ? (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Deck offline
                </Badge>
              ) : isAhead ? (
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] text-amber-500"
                >
                  Browsing
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] text-green-500"
                >
                  Following deck
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
              aria-label="Previous slide"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => goTo(viewIndex + 1)}
              disabled={viewIndex === max}
              aria-label="Next slide"
            >
              <ChevronRightIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={resync}
              disabled={!isAhead || deckIndex === null}
              aria-label="Jump back to deck"
              title="Jump back to deck"
            >
              <LocateFixedIcon />
            </Button>
          </div>
        </div>

        <Separator />

        {note ? (
          <div className="flex flex-col gap-4 text-sm leading-relaxed">
            <p className="text-foreground">{note.summary}</p>

            <NotesSection title="Talking points">
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
                {note.talkingPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </NotesSection>

            {note.details ? (
              <NotesSection title="Details">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {note.details}
                </p>
              </NotesSection>
            ) : null}

            {note.watchFor && note.watchFor.length > 0 ? (
              <NotesSection title="Watch for">
                <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
                  {note.watchFor.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </NotesSection>
            ) : null}

            {note.transition ? (
              <NotesSection title="Transition">
                <p className="text-muted-foreground italic">
                  → {note.transition}
                </p>
              </NotesSection>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No notes for this slide.
          </p>
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
