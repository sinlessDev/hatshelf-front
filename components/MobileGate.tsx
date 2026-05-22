import { MonitorIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function MobileGate() {
  const t = useTranslations("ui.mobile");
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-(--color-deck-bg) px-8 text-center md:hidden">
      <div className="grid size-14 place-items-center rounded-xl border border-(--color-deck-border) bg-(--color-deck-card)">
        <MonitorIcon className="size-6 text-(--color-deck-text-muted)" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-lg text-(--color-deck-text)">
          {t("title")}
        </h1>
        <p className="max-w-xs text-sm text-(--color-deck-text-muted)">
          {t("body")}
        </p>
      </div>
      <span className="font-mono text-[0.7rem] tracking-widest text-(--color-deck-text-dim) uppercase">
        ≥ 768px
      </span>
    </div>
  );
}
