"use client";

import { useState } from "react";
import { ZapIcon, PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "bad" | "good";

type User = {
  id: number;
  name: string;
  bio: string;
  avatarUrl: string;
  email: string;
  isAdmin: boolean;
  role: string;
  ownerId: number;
};

const INITIAL_USER: User = {
  id: 42,
  name: "Alice Chen",
  bio: "Backend eng. Coffee, distributed systems.",
  avatarUrl: "https://example.com/avatar/alice.png",
  email: "alice@example.com",
  isAdmin: false,
  role: "member",
  ownerId: 42,
};

const ALLOWED_FIELDS = ["name", "bio", "avatarUrl"] as const;

type Field = { key: string; value: string };

function defaultExtraFields(): Field[] {
  return [
    { key: "isAdmin", value: "true" },
    { key: "role", value: "owner" },
  ];
}

function coerce(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  return value;
}

type Response =
  | { ok: true; updated: User; appliedKeys: string[] }
  | { ok: false; status: 400; reason: string; rejectedKeys: string[] };

function send(mode: Mode, baseUser: User, fields: Field[]): Response {
  const body: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.key.trim()) body[f.key.trim()] = coerce(f.value);
  }

  if (mode === "bad") {
    // Spread the whole body over the user — every key applies.
    const updated = { ...baseUser, ...(body as Partial<User>) };
    return { ok: true, updated, appliedKeys: Object.keys(body) };
  }

  // Good: allowlist + strict
  const rejected = Object.keys(body).filter(
    (k) => !(ALLOWED_FIELDS as readonly string[]).includes(k),
  );
  if (rejected.length > 0) {
    return {
      ok: false,
      status: 400,
      reason: `Unknown keys rejected by .strict(): ${rejected.join(", ")}`,
      rejectedKeys: rejected,
    };
  }
  const safe: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) safe[k] = body[k];
  }
  return {
    ok: true,
    updated: { ...baseUser, ...(safe as Partial<User>) },
    appliedKeys: Object.keys(safe),
  };
}

export function MassAssignmentDemo() {
  const [mode, setMode] = useState<Mode>("bad");
  const [name, setName] = useState(INITIAL_USER.name);
  const [bio, setBio] = useState(INITIAL_USER.bio);
  const [extra, setExtra] = useState<Field[]>(defaultExtraFields());
  const [response, setResponse] = useState<Response | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fields: Field[] = [
      { key: "name", value: name },
      { key: "bio", value: bio },
      ...extra.filter((f) => f.key.trim()),
    ];
    setResponse(send(mode, INITIAL_USER, fields));
  };

  const onSwitchMode = (m: Mode) => {
    setMode(m);
    setResponse(null);
  };

  const addExtra = () => setExtra((xs) => [...xs, { key: "", value: "" }]);
  const updateExtra = (i: number, patch: Partial<Field>) =>
    setExtra((xs) => xs.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeExtra = (i: number) =>
    setExtra((xs) => xs.filter((_, idx) => idx !== i));

  const handlerCode =
    mode === "bad"
      ? `app.patch("/users/me", auth, async (req, res) => {
  const updated = await User.update(req.user.id, req.body);
  res.json(updated);
});`
      : `const PatchMe = z.object({
  name: z.string().min(1).max(80),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
}).strict();   // unknown keys → reject

app.patch("/users/me", auth, async (req, res) => {
  const data = PatchMe.parse(req.body);
  const updated = await User.update(req.user.id, data);
  res.json(updated);
});`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center gap-1 self-start rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-1">
        <button
          type="button"
          onClick={() => onSwitchMode("bad")}
          className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition ${
            mode === "bad"
              ? "bg-(--color-accent-red-soft) text-(--color-accent-red)"
              : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
          }`}
        >
          ❌ Auto-bind everything
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode("good")}
          className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition ${
            mode === "good"
              ? "bg-(--color-accent-green-soft) text-(--color-accent-green)"
              : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
          }`}
        >
          ✓ zod .strict()
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left: form */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="ma-name" className="text-(--color-deck-text)">
              Name
            </Label>
            <Input
              id="ma-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ma-bio" className="text-(--color-deck-text)">
              Bio
            </Label>
            <Input
              id="ma-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-(--color-deck-border-soft) pt-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
                Extra fields (sent via DevTools)
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={addExtra}
              >
                <PlusIcon data-icon="inline-start" />
                Add field
              </Button>
            </div>
            {extra.length === 0 ? (
              <p className="font-mono text-xs text-(--color-deck-text-dim)">
                No extra fields. Add one to forge a privilege escalation.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {extra.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Input
                      value={f.key}
                      onChange={(e) => updateExtra(i, { key: e.target.value })}
                      placeholder="key (e.g. isAdmin)"
                      className="font-mono text-xs"
                    />
                    <Input
                      value={f.value}
                      onChange={(e) =>
                        updateExtra(i, { value: e.target.value })
                      }
                      placeholder="value"
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeExtra(i)}
                      aria-label="Remove field"
                    >
                      <XIcon />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button type="submit" className="self-start">
            <ZapIcon data-icon="inline-start" />
            PATCH /users/me
          </Button>
        </form>

        {/* Right: handler + response */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              Handler
            </span>
            <pre className="overflow-x-auto rounded-lg border border-(--color-deck-border) bg-black/30 p-4 font-mono text-[11px] leading-relaxed text-(--color-deck-text)">
              {handlerCode}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              Response
            </span>
            {response === null ? (
              <div className="rounded-lg border border-dashed border-(--color-deck-border) bg-(--color-deck-card) px-4 py-6 text-center font-mono text-xs text-(--color-deck-text-dim)">
                Submit the form to see what the server applies.
              </div>
            ) : response.ok ? (
              <div
                className={`flex flex-col gap-2 rounded-lg border px-4 py-3 ${
                  response.updated.isAdmin && !INITIAL_USER.isAdmin
                    ? "border-(--color-accent-red)/30 bg-(--color-accent-red-soft)"
                    : "border-(--color-accent-green)/30 bg-(--color-accent-green-soft)"
                }`}
              >
                <span
                  className={`font-mono text-xs ${
                    response.updated.isAdmin && !INITIAL_USER.isAdmin
                      ? "text-(--color-accent-red)"
                      : "text-(--color-accent-green)"
                  }`}
                >
                  200 OK — applied keys: {response.appliedKeys.join(", ")}
                </span>
                <pre className="font-mono text-xs whitespace-pre-wrap text-(--color-deck-text)">
                  {JSON.stringify(response.updated, null, 2)}
                </pre>
                {response.updated.isAdmin && !INITIAL_USER.isAdmin ? (
                  <span className="text-xs text-(--color-deck-text-muted) italic">
                    ⚠ isAdmin flipped from false → true. The user just escalated
                    by sending an extra body field.
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-1 rounded-lg border border-(--color-accent-green)/30 bg-(--color-accent-green-soft) px-4 py-3">
                <span className="font-mono text-xs text-(--color-accent-green)">
                  {response.status} Bad Request
                </span>
                <span className="font-mono text-xs text-(--color-deck-text-muted)">
                  {response.reason}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-(--color-deck-border-soft) bg-(--color-deck-card)/50 px-4 py-3 text-xs leading-relaxed text-(--color-deck-text-muted)">
            <p className="mb-1 font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              The Homakov case
            </p>
            <p>
              GitHub, 2012. Egor Homakov added himself as a Rails contributor
              by posting an extra <code>public_key[user_id]</code> field. Rails
              auto-bound every parameter to the model. Rails 4 made strong
              parameters the default — same idea as zod{" "}
              <code>.strict()</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
