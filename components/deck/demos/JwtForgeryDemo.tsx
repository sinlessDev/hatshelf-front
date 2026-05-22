"use client";

import { useMemo, useState } from "react";
import { ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Mode = "none" | "confusion" | "weak-secret";

// All "tokens" below are fakes — encoded with btoa, not signed. The demo only
// inspects shape; the server simulation below decides whether to accept.

function b64url(s: string) {
  return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function buildToken(header: object, payload: object, sig: string) {
  return `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}.${sig}`;
}

function tryDecode(token: string): {
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  signature: string;
  parts: string[];
} {
  const parts = token.split(".");
  let header: Record<string, unknown> | undefined;
  let payload: Record<string, unknown> | undefined;
  try {
    if (parts[0])
      header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    /* ignore */
  }
  try {
    if (parts[1])
      payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
  } catch {
    /* ignore */
  }
  return { header, payload, signature: parts[2] ?? "", parts };
}

const SERVER_SECRET = "dev"; // intentionally weak for the demo
const PUBLIC_KEY =
  "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhki...\n-----END PUBLIC KEY-----";

const COMMON_SECRETS = [
  "secret",
  "password",
  "changeme",
  "dev",
  "test",
  "12345",
  "admin",
  "default",
];

// ── Mode metadata ────────────────────────────────────────────────────────────

const MODES: Record<
  Mode,
  {
    label: string;
    serverConfig: string;
    starter: string;
    starterDecoded: { header: object; payload: object; sig: string };
  }
> = {
  none: {
    label: "alg = none",
    serverConfig:
      "jwt.verify(token, SECRET)   // accepts ANY algorithm, including 'none'",
    starter: buildToken(
      { alg: "HS256", typ: "JWT" },
      { sub: "alice", role: "user" },
      "sIgnedBySerVer",
    ),
    starterDecoded: {
      header: { alg: "HS256", typ: "JWT" },
      payload: { sub: "alice", role: "user" },
      sig: "sIgnedBySerVer",
    },
  },
  confusion: {
    label: "RS256 → HS256",
    serverConfig:
      "jwt.verify(token, PUBLIC_KEY)   // no algorithms pin, public key used for HMAC",
    starter: buildToken(
      { alg: "RS256", typ: "JWT" },
      { sub: "alice", role: "user" },
      "rs256-signature",
    ),
    starterDecoded: {
      header: { alg: "RS256", typ: "JWT" },
      payload: { sub: "alice", role: "user" },
      sig: "rs256-signature",
    },
  },
  "weak-secret": {
    label: "Weak HS256 secret",
    serverConfig: `jwt.verify(token, "${SERVER_SECRET}")   // 3-byte secret`,
    starter: buildToken(
      { alg: "HS256", typ: "JWT" },
      { sub: "alice", role: "user" },
      "hs256-signature",
    ),
    starterDecoded: {
      header: { alg: "HS256", typ: "JWT" },
      payload: { sub: "alice", role: "user" },
      sig: "hs256-signature",
    },
  },
};

// Server simulation per mode

function verifyToken(
  mode: Mode,
  token: string,
  crackedSecret: string | null,
): { ok: boolean; reason: string; identity?: Record<string, unknown> } {
  const { header, payload, signature } = tryDecode(token);
  if (!header || !payload)
    return { ok: false, reason: "Malformed token (could not decode)" };

  if (mode === "none") {
    // Vulnerable verifier honors alg=none and skips signature check.
    if (String(header.alg).toLowerCase() === "none") {
      return {
        ok: true,
        reason: "alg=none accepted — signature was not checked",
        identity: payload,
      };
    }
    // Otherwise pretend HS256 with "dev" — accepts only the original token.
    if (signature === MODES.none.starterDecoded.sig) {
      return { ok: true, reason: "Signature matched", identity: payload };
    }
    return { ok: false, reason: "Signature mismatch" };
  }

  if (mode === "confusion") {
    // Vulnerable verifier uses the public key as the secret when alg=HS256.
    if (String(header.alg) === "HS256") {
      // Forger needed to HMAC-sign with the public key. We accept any non-empty
      // signature here as the "forged" one to keep the demo focused.
      if (signature && signature !== MODES.confusion.starterDecoded.sig) {
        return {
          ok: true,
          reason:
            "HS256 verified using the public key as the HMAC secret. Public keys are public.",
          identity: payload,
        };
      }
    }
    if (
      String(header.alg) === "RS256" &&
      signature === MODES.confusion.starterDecoded.sig
    ) {
      return {
        ok: true,
        reason: "RS256 verified with public key",
        identity: payload,
      };
    }
    return { ok: false, reason: "Signature did not verify" };
  }

  // weak-secret mode
  if (crackedSecret !== null) {
    return {
      ok: true,
      reason: `Forged token signed with cracked secret '${crackedSecret}' — verifies cleanly.`,
      identity: payload,
    };
  }
  if (signature === MODES["weak-secret"].starterDecoded.sig) {
    return { ok: true, reason: "Original token verifies", identity: payload };
  }
  return { ok: false, reason: "Signature mismatch — crack the secret first." };
}

export function JwtForgeryDemo() {
  const [mode, setMode] = useState<Mode>("none");
  const [payloadText, setPayloadText] = useState(
    JSON.stringify({ sub: "alice", role: "admin" }, null, 2),
  );
  const [headerText, setHeaderText] = useState(
    JSON.stringify({ alg: "none", typ: "JWT" }, null, 2),
  );
  const [signature, setSignature] = useState("");
  const [crackedSecret, setCrackedSecret] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<null | ReturnType<
    typeof verifyToken
  >>(null);

  // Build the forged token live from the three editable parts
  const forgedToken = useMemo(() => {
    try {
      const header = JSON.parse(headerText);
      const payload = JSON.parse(payloadText);
      return buildToken(header, payload, signature);
    } catch {
      return "<invalid JSON in header or payload>";
    }
  }, [headerText, payloadText, signature]);

  const onModeChange = (m: Mode) => {
    setMode(m);
    setCrackedSecret(null);
    setVerifyResult(null);
    if (m === "none") {
      setHeaderText(JSON.stringify({ alg: "none", typ: "JWT" }, null, 2));
      setPayloadText(JSON.stringify({ sub: "alice", role: "admin" }, null, 2));
      setSignature("");
    } else if (m === "confusion") {
      setHeaderText(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
      setPayloadText(JSON.stringify({ sub: "alice", role: "admin" }, null, 2));
      setSignature("forged-hmac-using-pubkey");
    } else {
      setHeaderText(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
      setPayloadText(JSON.stringify({ sub: "alice", role: "admin" }, null, 2));
      setSignature("");
    }
  };

  const onCrack = () => {
    // Pretend to brute-force; SERVER_SECRET is in the list.
    setCrackedSecret(SERVER_SECRET);
    setSignature(`hmac-sha256("${SERVER_SECRET}", header.payload)`);
  };

  const onSubmit = () => {
    setVerifyResult(verifyToken(mode, forgedToken, crackedSecret));
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-1 self-start rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-1">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition ${
              mode === m
                ? "bg-(--color-accent-red-soft) text-(--color-accent-red)"
                : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Left: token editor */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-4">
            <Label className="mb-2 text-(--color-deck-text)">
              Server config
            </Label>
            <pre className="overflow-x-auto rounded bg-black/30 p-3 font-mono text-[11px] text-(--color-deck-text-muted)">
              {MODES[mode].serverConfig}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-(--color-deck-text)">Header</Label>
            <Textarea
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              rows={3}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-(--color-deck-text)">Payload</Label>
            <Textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={5}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-(--color-deck-text)">
              Signature{" "}
              <span className="font-mono text-[10px] text-(--color-deck-text-dim)">
                (leave blank for alg=none)
              </span>
            </Label>
            <Textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={2}
              className="font-mono text-xs"
            />
          </div>

          {mode === "confusion" ? (
            <div className="rounded-lg border border-(--color-deck-border-soft) bg-(--color-deck-card)/50 p-3 font-mono text-[11px] text-(--color-deck-text-muted)">
              <div className="mb-1 text-[10px] tracking-widest uppercase text-(--color-deck-text-dim)">
                Public key (you can see this — it&apos;s published)
              </div>
              <pre className="whitespace-pre-wrap break-all">{PUBLIC_KEY}</pre>
              <p className="mt-2 text-(--color-deck-text-muted) normal-case tracking-normal">
                Forging step: HMAC-SHA256 the header.payload with the public key
                as the secret. Set alg = HS256.
              </p>
            </div>
          ) : null}

          {mode === "weak-secret" ? (
            <div className="rounded-lg border border-(--color-deck-border-soft) bg-(--color-deck-card)/50 p-3">
              <div className="mb-1 font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
                hashcat-style dictionary attack
              </div>
              <div className="mb-2 flex flex-wrap gap-1 font-mono text-[11px] text-(--color-deck-text-muted)">
                {COMMON_SECRETS.map((s) => (
                  <span
                    key={s}
                    className={`rounded px-1.5 py-0.5 ${
                      s === SERVER_SECRET && crackedSecret
                        ? "bg-(--color-accent-red-soft) text-(--color-accent-red)"
                        : "bg-black/30"
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
              {crackedSecret ? (
                <p className="font-mono text-xs text-(--color-accent-red)">
                  ✓ Cracked: &apos;{crackedSecret}&apos; — try in 0.4s
                </p>
              ) : (
                <Button variant="outline" size="sm" onClick={onCrack}>
                  Run crack
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {/* Right: token preview + verify */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-(--color-deck-text)">Forged token</Label>
            <pre className="overflow-x-auto rounded-lg border border-(--color-deck-border) bg-black/30 p-4 font-mono text-[11px] leading-relaxed break-all text-(--color-deck-text)">
              {forgedToken}
            </pre>
          </div>

          <Button onClick={onSubmit} className="self-start">
            <ZapIcon data-icon="inline-start" />
            Send to /api/me
          </Button>

          <div className="flex flex-col gap-2">
            <Label className="text-(--color-deck-text)">
              Verifier response
            </Label>
            {verifyResult === null ? (
              <div className="rounded-lg border border-dashed border-(--color-deck-border) bg-(--color-deck-card) px-4 py-6 text-center font-mono text-xs text-(--color-deck-text-dim)">
                Submit the token to see whether the server accepts it.
              </div>
            ) : verifyResult.ok ? (
              <div className="flex flex-col gap-1 rounded-lg border border-(--color-accent-red)/30 bg-(--color-accent-red-soft) px-4 py-3">
                <span className="font-mono text-xs text-(--color-accent-red)">
                  ✓ 200 OK — token accepted
                </span>
                <pre className="font-mono text-xs text-(--color-deck-text)">
                  {JSON.stringify(verifyResult.identity, null, 2)}
                </pre>
                <span className="text-xs text-(--color-deck-text-muted) italic">
                  {verifyResult.reason}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1 rounded-lg border border-(--color-accent-green)/30 bg-(--color-accent-green-soft) px-4 py-3">
                <span className="font-mono text-xs text-(--color-accent-green)">
                  ✗ 401 Unauthorized
                </span>
                <span className="font-mono text-xs text-(--color-deck-text-muted)">
                  {verifyResult.reason}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-(--color-deck-border-soft) bg-(--color-deck-card)/50 px-4 py-3 text-xs leading-relaxed text-(--color-deck-text-muted)">
            <p className="mb-1 font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              The fix
            </p>
            <p>
              Pin the algorithm: <code>algorithms: [&quot;HS256&quot;]</code> or{" "}
              <code>[&quot;RS256&quot;]</code>. Use ≥32 random bytes for HS
              secrets. Always validate <code>iss</code>, <code>aud</code>, and{" "}
              <code>exp</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
