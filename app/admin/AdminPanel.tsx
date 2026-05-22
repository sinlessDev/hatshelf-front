"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  InboxIcon,
  PauseIcon,
  PlayIcon,
  RefreshCwIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Question } from "@/lib/questions";
import { SlideNotes } from "./SlideNotes";
import { LocaleSwitch } from "@/components/deck/LocaleSwitch";

const POLL_MS = 3000;

const noopSubscribe = () => () => {};

type TFunction = ReturnType<typeof useTranslations<"ui.ago">>;

function timeAgo(t: TFunction, ts: number, locale: string): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return t("justNow");
  if (s < 60) return t("seconds", { n: s });
  const m = Math.floor(s / 60);
  if (m < 60) return t("minutes", { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t("hours", { n: h });
  return new Intl.DateTimeFormat(locale).format(ts);
}

export function AdminPanel({ initial }: { initial: Question[] }) {
  const tAdmin = useTranslations("ui.admin");
  const tAgo = useTranslations("ui.ago");
  const locale = useLocale();

  const [questions, setQuestions] = useState<Question[]>(initial);
  const [paused, setPaused] = useState(false);
  const [, setTick] = useState(0);
  const [lastFetch, setLastFetch] = useState(() => Date.now());
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const fetchOnce = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/questions", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { questions: Question[] };
      setQuestions(data.questions);
      setLastFetch(Date.now());
    } catch {
      /* network blip — keep polling */
    }
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(fetchOnce, POLL_MS);
    return () => clearInterval(id);
  }, [paused, fetchOnce]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const remove = async (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    await fetch(`/api/admin/questions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    fetchOnce();
  };

  const clearAll = async () => {
    const prompt = tAdmin("confirmClear", { count: questions.length });
    if (!confirm(prompt)) return;
    setQuestions([]);
    await fetch("/api/admin/questions?id=all", { method: "DELETE" });
    fetchOnce();
  };

  const state = !mounted
    ? tAdmin("stateLoading")
    : paused
      ? tAdmin("statePaused")
      : tAdmin("stateUpdated", { ago: timeAgo(tAgo, lastFetch, locale) });

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-end justify-between border-b pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {tAdmin("title")}
            </h1>
            <p
              className="font-mono text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {tAdmin("statusLine", {
                count: questions.length,
                seconds: POLL_MS / 1000,
                state,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitch />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? (
                <PlayIcon data-icon="inline-start" />
              ) : (
                <PauseIcon data-icon="inline-start" />
              )}
              {paused ? tAdmin("resume") : tAdmin("pause")}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchOnce}>
              <RefreshCwIcon data-icon="inline-start" />
              {tAdmin("refresh")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAll}
              disabled={questions.length === 0}
            >
              <Trash2Icon data-icon="inline-start" />
              {tAdmin("clearAll")}
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-3">
            <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {tAdmin("speakerNotes")}
            </h2>
            <SlideNotes />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {tAdmin("questions")}
            </h2>
            {questions.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon />
                  </EmptyMedia>
                  <EmptyTitle>{tAdmin("noQuestions")}</EmptyTitle>
                  <EmptyDescription>
                    {tAdmin("noQuestionsDesc")}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="flex flex-col gap-3">
                {questions.map((q) => (
                  <li key={q.id}>
                    <Card className="group transition hover:bg-accent/30">
                      <CardContent className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{q.name}</span>
                            <span
                              className="font-mono text-xs text-muted-foreground"
                              suppressHydrationWarning
                            >
                              · {mounted ? timeAgo(tAgo, q.ts, locale) : ""}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => remove(q.id)}
                            aria-label={tAdmin("deleteQuestion")}
                            className="opacity-0 transition group-hover:opacity-100"
                          >
                            <XIcon />
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {q.text}
                        </p>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
