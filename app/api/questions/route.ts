import { NextResponse } from "next/server";
import { submitQuestion } from "@/lib/questions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { name, text } = body as { name?: unknown; text?: unknown };
  if (typeof text !== "string") {
    return NextResponse.json({ error: "text_required" }, { status: 400 });
  }
  const result = await submitQuestion({
    name: typeof name === "string" ? name : undefined,
    text,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: result.question.id });
}
