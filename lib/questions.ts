import "server-only";
import { Redis } from "@upstash/redis";

const KEY = "questions";
const MAX_NAME = 60;
const MAX_TEXT = 1000;

let _redis: Redis | null = null;
function redis(): Redis {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

export type Question = {
  id: string;
  name: string;
  text: string;
  ts: number;
};

export type SubmitInput = { name?: string; text: string };
export type SubmitResult =
  | { ok: true; question: Question }
  | { ok: false; error: string };

export async function submitQuestion(input: SubmitInput): Promise<SubmitResult> {
  const text = (input.text ?? "").trim();
  if (!text) return { ok: false, error: "Question text is required." };
  if (text.length > MAX_TEXT) return { ok: false, error: "Question is too long." };

  const rawName = (input.name ?? "").trim().slice(0, MAX_NAME);
  const name = rawName.length > 0 ? rawName : "Anonymous";

  const question: Question = {
    id: crypto.randomUUID(),
    name,
    text,
    ts: Date.now(),
  };

  await redis().lpush(KEY, JSON.stringify(question));
  return { ok: true, question };
}

export async function listQuestions(): Promise<Question[]> {
  const rows = await redis().lrange<string | Question>(KEY, 0, -1);
  return rows.map((r) => (typeof r === "string" ? (JSON.parse(r) as Question) : r));
}

export async function deleteQuestion(id: string): Promise<void> {
  const all = await listQuestions();
  await redis().del(KEY);
  const keep = all.filter((q) => q.id !== id);
  if (keep.length > 0) {
    // LPUSH reverses; we want newest first → push oldest first.
    const ordered = [...keep].reverse();
    await redis().lpush(KEY, ...ordered.map((q) => JSON.stringify(q)));
  }
}

export async function clearQuestions(): Promise<void> {
  await redis().del(KEY);
}
