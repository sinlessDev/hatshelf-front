import { Deck } from "@/components/deck/Deck";
import { slides } from "@/lib/slides/data";
import { prepareSlides } from "@/lib/slides/prepare";

export default async function Page() {
  const prepared = await prepareSlides(slides);
  return <Deck slides={prepared} />;
}
