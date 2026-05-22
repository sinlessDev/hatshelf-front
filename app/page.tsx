import { getTranslations } from "next-intl/server";
import { Deck } from "@/components/deck/Deck";
import { slides } from "@/lib/slides/data";
import { prepareSlides } from "@/lib/slides/prepare";
import { resolveSlides } from "@/lib/slides/resolve";

export default async function Page() {
  const t = await getTranslations();
  const resolved = resolveSlides(slides, t);
  const prepared = await prepareSlides(resolved);
  return <Deck slides={prepared} />;
}
