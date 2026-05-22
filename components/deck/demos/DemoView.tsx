"use client";

import { useEffect } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function DemoView({ title, subtitle, onClose, children }: Props) {
  // Esc to close + stop deck arrow-key nav while demo is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          " ",
          "PageUp",
          "PageDown",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-(--color-deck-bg)">
      <header className="flex shrink-0 items-center justify-between border-b border-(--color-deck-border-soft) px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
            Interactive demo
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-(--color-deck-text)">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-(--color-deck-text-muted)">{subtitle}</p>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={onClose} aria-label="Close demo">
          <XIcon data-icon="inline-start" />
          Close
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto px-6 py-6">{children}</div>
    </div>
  );
}
