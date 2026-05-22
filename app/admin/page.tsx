import { AdminPanel } from "./AdminPanel";
import { listQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await listQuestions();
  return <AdminPanel initial={initial} />;
}
