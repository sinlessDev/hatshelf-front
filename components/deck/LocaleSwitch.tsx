"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";

export function LocaleSwitch({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("ui");
  const [pending, start] = useTransition();
  const next: Locale = locale === "en" ? "ru" : "en";

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => start(() => setLocale(next))}
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
      className={className}
    >
      <span className="font-mono text-xs tabular-nums">
        {locale.toUpperCase()} → {next.toUpperCase()}
      </span>
    </Button>
  );
}
