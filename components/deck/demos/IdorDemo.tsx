"use client";

import { useState } from "react";
import { ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Mode = "bad" | "good";

type Invoice = {
  id: number;
  ownerId: number;
  ownerEmail: string;
  amount: number;
  description: string;
};

const INVOICES: Invoice[] = [
  { id: 1001, ownerId: 1, ownerEmail: "alice@example.com", amount: 4200, description: "Consulting · January" },
  { id: 1002, ownerId: 1, ownerEmail: "alice@example.com", amount: 1800, description: "Design review" },
  { id: 1003, ownerId: 2, ownerEmail: "bob@example.com", amount: 31000, description: "Series A bridge — wire transfer" },
  { id: 1004, ownerId: 3, ownerEmail: "carol@example.com", amount: 7500, description: "Quarterly retainer" },
  { id: 1005, ownerId: 4, ownerEmail: "globex.corp@example.com", amount: 240000, description: "Acquisition due diligence" },
];

const CURRENT_USER = { id: 1, email: "alice@example.com" };

type Response =
  | { ok: true; invoice: Invoice }
  | { ok: false; status: 404 | 403; reason: string };

function fetchInvoice(mode: Mode, requestedId: number): Response {
  const inv = INVOICES.find((i) => i.id === requestedId);
  if (mode === "bad") {
    if (!inv) return { ok: false, status: 404, reason: "Not found" };
    return { ok: true, invoice: inv };
  }
  if (!inv || inv.ownerId !== CURRENT_USER.id) {
    return { ok: false, status: 404, reason: "Not found (or not yours)" };
  }
  return { ok: true, invoice: inv };
}

export function IdorDemo() {
  const [mode, setMode] = useState<Mode>("bad");
  const [requestedId, setRequestedId] = useState(1001);
  const [response, setResponse] = useState<Response | null>(null);

  const send = (id: number) => {
    setRequestedId(id);
    setResponse(fetchInvoice(mode, id));
  };

  const query =
    mode === "bad"
      ? `db.invoice.findById(${requestedId})`
      : `db.invoice.findOne({\n  _id: ${requestedId},\n  ownerId: ${CURRENT_USER.id},   // ← the whole game\n})`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center gap-1 self-start rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-1">
        <button
          type="button"
          onClick={() => {
            setMode("bad");
            setResponse(null);
          }}
          className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition ${
            mode === "bad"
              ? "bg-(--color-accent-red-soft) text-(--color-accent-red)"
              : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
          }`}
        >
          ❌ No ownership check
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("good");
            setResponse(null);
          }}
          className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition ${
            mode === "good"
              ? "bg-(--color-accent-green-soft) text-(--color-accent-green)"
              : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
          }`}
        >
          ✓ Owned only
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left: invoice list + manual request */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-4 text-xs">
            <p className="font-mono text-(--color-deck-text-muted)">
              <span className="text-(--color-deck-text-dim)">Authenticated as:</span>{" "}
              <span className="text-(--color-deck-text)">
                {CURRENT_USER.email} (user.id = {CURRENT_USER.id})
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              Click any invoice id to GET /api/invoices/&lt;id&gt;
            </span>
            <ul className="flex flex-col gap-1">
              {INVOICES.map((inv) => {
                const isYours = inv.ownerId === CURRENT_USER.id;
                return (
                  <li key={inv.id}>
                    <button
                      type="button"
                      onClick={() => send(inv.id)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-md border border-(--color-deck-border) bg-(--color-deck-card) px-3 py-2 text-left font-mono text-xs transition hover:bg-(--color-deck-card-hover)"
                    >
                      <span className="text-(--color-deck-text)">
                        #{inv.id}
                        <span className="ml-3 text-(--color-deck-text-muted)">
                          {inv.ownerEmail}
                        </span>
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider ${
                          isYours
                            ? "text-(--color-accent-green)"
                            : "text-(--color-deck-text-dim)"
                        }`}
                      >
                        {isYours ? "yours" : "not yours"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="idor-manual"
              className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase"
            >
              Or just guess an id
            </Label>
            <div className="flex gap-2">
              <input
                id="idor-manual"
                type="number"
                value={requestedId}
                onChange={(e) => setRequestedId(parseInt(e.target.value, 10) || 0)}
                className="flex-1 rounded-md border border-(--color-deck-border) bg-(--color-deck-card) px-3 py-1.5 font-mono text-xs text-(--color-deck-text) outline-none focus-visible:border-(--color-accent-blue)"
              />
              <Button size="sm" onClick={() => send(requestedId)}>
                <ZapIcon data-icon="inline-start" />
                Fetch
              </Button>
            </div>
          </div>
        </div>

        {/* Right: query + response */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              Server query
            </span>
            <pre className="overflow-x-auto rounded-lg border border-(--color-deck-border) bg-black/30 p-4 font-mono text-xs leading-relaxed text-(--color-deck-text)">
              {query}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              Response
            </span>
            {response === null ? (
              <div className="rounded-lg border border-dashed border-(--color-deck-border) bg-(--color-deck-card) px-4 py-6 text-center font-mono text-xs text-(--color-deck-text-dim)">
                Pick an invoice id to fetch.
              </div>
            ) : response.ok ? (
              <div className="flex flex-col gap-1 rounded-lg border border-(--color-accent-red)/30 bg-(--color-accent-red-soft) px-4 py-3">
                <span className="font-mono text-xs text-(--color-accent-red)">
                  200 OK
                  {response.invoice.ownerId !== CURRENT_USER.id ? (
                    <span className="ml-2 italic text-(--color-deck-text)">
                      ← leaked another tenant&apos;s invoice
                    </span>
                  ) : null}
                </span>
                <pre className="font-mono text-xs whitespace-pre-wrap text-(--color-deck-text)">
                  {JSON.stringify(response.invoice, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col gap-1 rounded-lg border border-(--color-accent-green)/30 bg-(--color-accent-green-soft) px-4 py-3">
                <span className="font-mono text-xs text-(--color-accent-green)">
                  {response.status} {response.reason}
                </span>
                <span className="text-xs text-(--color-deck-text-muted) italic">
                  Return 404 (not 403): don&apos;t leak whether the resource exists.
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-(--color-deck-border-soft) bg-(--color-deck-card)/50 px-4 py-3 text-xs leading-relaxed text-(--color-deck-text-muted)">
            <p className="mb-1 font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              How to read this
            </p>
            <p>
              Both versions are authenticated as Alice. The vulnerable handler
              looks up by id only — any incrementing id leaks data. The owned
              version adds <code>ownerId</code> to the query and returns 404
              for anything Alice doesn&apos;t own.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
