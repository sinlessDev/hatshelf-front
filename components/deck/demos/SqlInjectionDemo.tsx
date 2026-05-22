"use client";

import { useMemo, useState } from "react";
import { ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "bad" | "good";

const USERS = [
  { id: 1, email: "admin@example.com", password: "hunter2" },
  { id: 2, email: "ada@example.com", password: "lovelace" },
];

const INJECTION = /(['"]\s*OR\s+['"]?1['"]?\s*=\s*['"]?1|'\s*OR\s+1\s*=\s*1)/i;

type Result =
  | { kind: "ok"; row: (typeof USERS)[number] }
  | { kind: "fail"; reason: string };

function runBad(email: string, password: string): Result {
  if (INJECTION.test(password) || INJECTION.test(email)) {
    return { kind: "ok", row: USERS[0] };
  }
  const row = USERS.find((u) => u.email === email && u.password === password);
  return row
    ? { kind: "ok", row }
    : { kind: "fail", reason: "0 rows returned" };
}

function runGood(email: string, password: string): Result {
  // Parameterized: the driver binds email as a value. Injection text becomes
  // literal data and matches no row.
  const row = USERS.find((u) => u.email === email);
  if (!row) return { kind: "fail", reason: "0 rows returned for email" };
  if (row.password !== password)
    return { kind: "fail", reason: "Password verification failed" };
  return { kind: "ok", row };
}

function badQuery(email: string, password: string) {
  return `SELECT id, email FROM users
WHERE email = '${email}'
  AND password = '${password}';`;
}

function goodQuery(email: string, password: string) {
  return `SELECT id, email, password_hash FROM users
WHERE email = $1;

  $1 = ${JSON.stringify(email)}
  // password verified in app code:
  argon2.verify(row.password_hash, ${JSON.stringify(password)})`;
}

const PRESETS = [
  {
    label: "Normal login",
    email: "admin@example.com",
    password: "hunter2",
  },
  {
    label: "Wrong password",
    email: "admin@example.com",
    password: "letmein",
  },
  {
    label: "SQL injection (classic)",
    email: "admin@example.com",
    password: "' OR '1'='1",
  },
  {
    label: "SQL injection (no email needed)",
    email: "anything@x.com",
    password: "' OR 1=1 --",
  },
] as const;

export function SqlInjectionDemo() {
  const [mode, setMode] = useState<Mode>("bad");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  const result = useMemo(() => {
    if (submittedAt === null) return null;
    return mode === "bad" ? runBad(email, password) : runGood(email, password);
  }, [mode, email, password, submittedAt]);

  const query = mode === "bad" ? badQuery(email, password) : goodQuery(email, password);
  const isInjection = INJECTION.test(password) || INJECTION.test(email);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      {/* Left: the form */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-1 self-start rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-1">
          <button
            type="button"
            onClick={() => {
              setMode("bad");
              setSubmittedAt(null);
            }}
            className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition ${
              mode === "bad"
                ? "bg-(--color-accent-red-soft) text-(--color-accent-red)"
                : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
            }`}
          >
            ❌ Vulnerable
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("good");
              setSubmittedAt(null);
            }}
            className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition ${
              mode === "good"
                ? "bg-(--color-accent-green-soft) text-(--color-accent-green)"
                : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
            }`}
          >
            ✓ Parameterized
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedAt(Date.now());
          }}
          className="flex flex-col gap-4 rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="demo-email" className="text-(--color-deck-text)">
              Email
            </Label>
            <Input
              id="demo-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              className="font-mono"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="demo-password" className="text-(--color-deck-text)">
              Password
            </Label>
            <Input
              id="demo-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              type="text"
              className="font-mono"
              placeholder="try ' OR '1'='1"
            />
          </div>
          <Button type="submit" className="self-start">
            <ZapIcon data-icon="inline-start" />
            Submit login
          </Button>
        </form>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
            Try a preset
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail(p.email);
                  setPassword(p.password);
                  setSubmittedAt(null);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: server trace + result */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
            Query sent to the database
          </span>
          <pre className="overflow-x-auto rounded-lg border border-(--color-deck-border) bg-black/30 p-4 font-mono text-xs leading-relaxed text-(--color-deck-text)">
            {query}
          </pre>
          {mode === "bad" && isInjection ? (
            <p className="rounded-md border border-(--color-accent-red)/30 bg-(--color-accent-red-soft) px-3 py-2 text-xs text-(--color-accent-red)">
              ⚠ Input concatenated into SQL. The WHERE clause is now an
              attacker-controlled expression.
            </p>
          ) : null}
          {mode === "good" && isInjection ? (
            <p className="rounded-md border border-(--color-accent-green)/30 bg-(--color-accent-green-soft) px-3 py-2 text-xs text-(--color-accent-green)">
              ✓ Input is bound as a value. The injection text is just a string
              that doesn't match any email.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
            Result
          </span>
          {result === null ? (
            <div className="rounded-lg border border-dashed border-(--color-deck-border) bg-(--color-deck-card) px-4 py-6 text-center font-mono text-xs text-(--color-deck-text-dim)">
              Submit the form to run the query.
            </div>
          ) : result.kind === "ok" ? (
            <div className="flex flex-col gap-1 rounded-lg border border-(--color-accent-green)/30 bg-(--color-accent-green-soft) px-4 py-3">
              <span className="font-mono text-xs text-(--color-accent-green)">
                ✓ Logged in
              </span>
              <span className="font-mono text-sm text-(--color-deck-text)">
                user.id = {result.row.id} · {result.row.email}
              </span>
              {mode === "bad" && isInjection ? (
                <span className="mt-1 text-xs text-(--color-deck-text-muted) italic">
                  Note: no password was actually verified. The injected{" "}
                  <code>OR 1=1</code> made the WHERE clause true for the first
                  row.
                </span>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-1 rounded-lg border border-(--color-accent-red)/30 bg-(--color-accent-red-soft) px-4 py-3">
              <span className="font-mono text-xs text-(--color-accent-red)">
                ✗ Login failed
              </span>
              <span className="font-mono text-sm text-(--color-deck-text-muted)">
                {result.reason}
              </span>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-(--color-deck-border-soft) bg-(--color-deck-card)/50 px-4 py-3 text-xs leading-relaxed text-(--color-deck-text-muted)">
          <p className="mb-1 font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
            How to read this
          </p>
          <p>
            The <span className="text-(--color-accent-red)">vulnerable</span>{" "}
            mode builds the SQL string by concatenating your input. The{" "}
            <span className="text-(--color-accent-green)">parameterized</span>{" "}
            mode sends the query and the input separately — the driver guarantees
            the input is never parsed as SQL.
          </p>
        </div>
      </div>
    </div>
  );
}
