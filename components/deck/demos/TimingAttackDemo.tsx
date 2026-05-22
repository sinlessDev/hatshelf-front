"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Mode = "bad" | "good";

const SECRET = "sk_live_t0pSecret";
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

// Bad: == short-circuits at first mismatch. Time grows with matching prefix.
function badTime(actual: string, guess: string): number {
  let matched = 0;
  for (let i = 0; i < guess.length && i < actual.length; i++) {
    if (guess[i] !== actual[i]) break;
    matched++;
  }
  return matched * 0.5 + (Math.random() - 0.5) * 0.15;
}

// Good: full-length compare every time, constant time independent of prefix.
function goodTime(actual: string, guess: string): number {
  void guess;
  return actual.length * 0.5 + (Math.random() - 0.5) * 0.15;
}

type Sample = { guess: string; ms: number };

export function TimingAttackDemo() {
  const [mode, setMode] = useState<Mode>("bad");
  const [recovered, setRecovered] = useState("");
  const [running, setRunning] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [attempts, setAttempts] = useState(0);
  const stopRef = useRef(false);

  const reset = () => {
    stopRef.current = true;
    setRunning(false);
    setRecovered("");
    setSamples([]);
    setAttempts(0);
  };

  useEffect(() => () => {
    stopRef.current = true;
  }, []);

  // Run the brute-force attack one position at a time.
  const runAttack = async () => {
    stopRef.current = false;
    setRunning(true);
    setRecovered("");
    setSamples([]);
    setAttempts(0);

    let prefix = "";
    const measure = mode === "bad" ? badTime : goodTime;

    for (let pos = 0; pos < SECRET.length; pos++) {
      if (stopRef.current) break;

      let best: { ch: string; ms: number } | null = null;
      const tries: Sample[] = [];

      for (const ch of ALPHABET) {
        if (stopRef.current) break;
        // Use full-length guess so good mode's full compare is meaningful.
        const ms = measure(
          SECRET,
          prefix + ch + "x".repeat(SECRET.length - pos - 1),
        );
        tries.push({ guess: prefix + ch, ms });
        if (!best || ms > best.ms) best = { ch, ms };

        // Yield every few attempts for animation
        if (tries.length % 8 === 0) {
          setSamples((s) => [...s.slice(-100), ...tries.slice(-8)]);
          setAttempts((a) => a + 8);
          await new Promise((r) => setTimeout(r, 20));
        }
      }
      // Flush remaining
      setSamples((s) => [...s.slice(-100), ...tries.slice(-(tries.length % 8 || 0))]);
      setAttempts((a) => a + (tries.length % 8 || 0));

      if (!best) break;
      // In good mode, all timings are ~equal and best is essentially random
      // (won't converge). Bad mode picks the actual next char.
      prefix += best.ch;
      setRecovered(prefix);
      await new Promise((r) => setTimeout(r, 50));
    }

    setRunning(false);
  };

  const maxMs = Math.max(...samples.map((s) => s.ms), 1);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center gap-1 self-start rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-1">
        <button
          type="button"
          onClick={() => {
            setMode("bad");
            reset();
          }}
          disabled={running}
          className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
            mode === "bad"
              ? "bg-(--color-accent-red-soft) text-(--color-accent-red)"
              : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
          }`}
        >
          ❌ a == b (short-circuit)
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("good");
            reset();
          }}
          disabled={running}
          className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
            mode === "good"
              ? "bg-(--color-accent-green-soft) text-(--color-accent-green)"
              : "text-(--color-deck-text-muted) hover:text-(--color-deck-text)"
          }`}
        >
          ✓ timingSafeEqual
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left: target + controls */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-(--color-deck-border) bg-(--color-deck-card) p-4">
            <Label className="mb-2 text-(--color-deck-text)">
              Target server (the secret you don&apos;t know)
            </Label>
            <pre className="overflow-x-auto rounded bg-black/30 p-3 font-mono text-xs text-(--color-deck-text)">
              {mode === "bad"
                ? `if (req.headers["x-api-token"] === expected) next();`
                : `if (timingSafeEqual(
  Buffer.from(req.headers["x-api-token"]),
  Buffer.from(expected),
)) next();`}
            </pre>
            <p className="mt-2 font-mono text-[10px] text-(--color-deck-text-dim)">
              {mode === "bad"
                ? "== returns as soon as the first byte differs. Response time leaks how many leading bytes were correct."
                : "Compares all bytes regardless. Response time is constant."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={runAttack} disabled={running}>
              <PlayIcon data-icon="inline-start" />
              {running ? "Attacking…" : "Run brute-force"}
            </Button>
            <Button variant="outline" onClick={reset} disabled={running}>
              <RotateCcwIcon data-icon="inline-start" />
              Reset
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              Recovered so far ({attempts} attempts)
            </span>
            <pre className="rounded-lg border border-(--color-deck-border) bg-black/30 p-4 font-mono text-base text-(--color-deck-text) tracking-wider">
              {recovered}
              <span className="text-(--color-deck-text-dim)">
                {"?".repeat(SECRET.length - recovered.length)}
              </span>
            </pre>
            {!running && recovered === SECRET ? (
              <p className="font-mono text-xs text-(--color-accent-red)">
                ✗ Full secret recovered. Length × |alphabet| ≈{" "}
                {SECRET.length * ALPHABET.length} requests.
              </p>
            ) : null}
            {!running && mode === "good" && attempts > 0 && recovered !== SECRET ? (
              <p className="font-mono text-xs text-(--color-accent-green)">
                ✓ Attack picked essentially random characters. Constant-time
                compare gave nothing away.
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: latency chart */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
            Measured response time per guess (last {samples.length})
          </span>
          <div className="flex h-72 items-end gap-[2px] rounded-lg border border-(--color-deck-border) bg-black/30 p-3">
            {samples.length === 0 ? (
              <div className="m-auto font-mono text-xs text-(--color-deck-text-dim)">
                Run the attack to see per-guess latency.
              </div>
            ) : (
              samples.map((s, i) => {
                const h = Math.max(2, (s.ms / maxMs) * 100);
                return (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`min-w-[3px] flex-1 rounded-sm ${
                      mode === "bad"
                        ? "bg-(--color-accent-red)"
                        : "bg-(--color-accent-green)"
                    }`}
                    title={`${s.guess} → ${s.ms.toFixed(2)}ms`}
                  />
                );
              })
            )}
          </div>
          <p className="font-mono text-[10px] text-(--color-deck-text-dim)">
            {mode === "bad"
              ? "Watch the staircase: every time the attack locks in the next correct character, the baseline jumps up by ~0.5ms."
              : "Watch the noise floor: bars are flat because the verifier always touches every byte."}
          </p>

          <div className="mt-4 rounded-lg border border-(--color-deck-border-soft) bg-(--color-deck-card)/50 px-4 py-3 text-xs leading-relaxed text-(--color-deck-text-muted)">
            <p className="mb-1 font-mono text-[10px] tracking-widest text-(--color-deck-text-dim) uppercase">
              About the timing
            </p>
            <p>
              This demo simulates microsecond-scale timing differences. In
              practice Crosby &amp; Wallach (2009) demonstrated ~25µs resolution
              over the public internet — enough to recover tokens byte by byte
              with thousands of requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
