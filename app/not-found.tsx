import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-md flex-col items-start gap-4">
        <span className="font-mono text-xs tracking-widest text-(--color-deck-text-dim) uppercase">
          404
        </span>
        <h1 className="font-mono text-3xl text-(--color-deck-text)">
          Slide not found
        </h1>
        <p className="text-sm text-(--color-deck-text-muted)">
          The page you&apos;re looking for doesn&apos;t exist. It may have been
          moved, or the link is stale.
        </p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/" />}
        >
          ← Back to deck
        </Button>
      </div>
    </main>
  );
}
