"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircleIcon, SendIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

type Status = "idle" | "submitting" | "sent" | "error";

export function AskButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(reset, 200);
      return () => clearTimeout(t);
    }
  }, [open, reset]);

  // Stop deck arrow-key navigation while dialog is open
  useEffect(() => {
    if (!open) return;
    const stop = (e: KeyboardEvent) => {
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "PageUp", "PageDown"].includes(
          e.key,
        )
      ) {
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", stop, true);
    return () => window.removeEventListener("keydown", stop, true);
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || status === "sent") return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Submit failed.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setText("");
      setTimeout(() => setOpen(false), 1200);
    } catch {
      setError("Network error.");
      setStatus("error");
    }
  };

  const submitting = status === "submitting";
  const sent = status === "sent";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 right-4 z-30 rounded-full shadow-lg"
            aria-label="Ask a question"
          />
        }
      >
        <MessageCircleIcon data-icon="inline-start" />
        Ask a question
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Ask a question</DialogTitle>
            <DialogDescription>
              Your question goes to the lecturer in real time. Name is optional.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4 mb-4">
            <Field>
              <FieldLabel htmlFor="ask-name">
                Name <span className="text-muted-foreground font-normal">(optional)</span>
              </FieldLabel>
              <Input
                id="ask-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Anonymous"
                disabled={submitting || sent}
              />
            </Field>

            <Field data-invalid={status === "error" ? true : undefined}>
              <FieldLabel htmlFor="ask-text">Question</FieldLabel>
              <Textarea
                id="ask-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={1000}
                required
                placeholder="What would you like to ask?"
                disabled={submitting || sent}
                autoFocus
                aria-invalid={status === "error" || undefined}
                className="min-h-32 resize-none overflow-hidden"
              />
              <FieldDescription className="flex justify-between">
                <span>Be specific — short questions get faster answers.</span>
                <span className="tabular-nums">{text.length} / 1000</span>
              </FieldDescription>
              {error ? <FieldError>{error}</FieldError> : null}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || sent || !text.trim()}
            >
              {submitting ? (
                <Spinner data-icon="inline-start" />
              ) : sent ? (
                <CheckIcon data-icon="inline-start" />
              ) : (
                <SendIcon data-icon="inline-start" />
              )}
              {submitting ? "Sending" : sent ? "Sent" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
