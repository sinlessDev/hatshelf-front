import { NextResponse } from "next/server";
import {
  clearQuestions,
  deleteQuestion,
  listQuestions,
} from "@/lib/questions";

export const runtime = "nodejs";

export async function GET() {
  const questions = await listQuestions();
  return NextResponse.json({ questions });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id === "all") {
    await clearQuestions();
    return NextResponse.json({ ok: true });
  }
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  await deleteQuestion(id);
  return NextResponse.json({ ok: true });
}
