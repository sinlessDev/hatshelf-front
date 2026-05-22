"use client";

import { useState } from "react";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoView } from "./DemoView";
import { demos } from "./registry";

export function TryItButton({ demoId }: { demoId: string }) {
  const [open, setOpen] = useState(false);
  const meta = demos[demoId];
  if (!meta) return null;
  const { Component, title, subtitle } = meta;

  return (
    <>
      <Button
        variant="outline"
        size="xs"
        onClick={() => setOpen(true)}
        className="font-mono"
      >
        <PlayIcon data-icon="inline-start" />
        Try it
      </Button>
      {open ? (
        <DemoView title={title} subtitle={subtitle} onClose={() => setOpen(false)}>
          <Component />
        </DemoView>
      ) : null}
    </>
  );
}
