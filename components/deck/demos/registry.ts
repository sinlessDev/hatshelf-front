import type { ComponentType } from "react";
import { SqlInjectionDemo } from "./SqlInjectionDemo";
import { JwtForgeryDemo } from "./JwtForgeryDemo";
import { IdorDemo } from "./IdorDemo";
import { MassAssignmentDemo } from "./MassAssignmentDemo";
import { TimingAttackDemo } from "./TimingAttackDemo";

export type DemoMeta = {
  title: string;
  subtitle?: string;
  Component: ComponentType;
};

export const demos: Record<string, DemoMeta> = {
  sqli: {
    title: "SQL injection — see it land",
    subtitle:
      "Try the classic payloads against a vulnerable login, then switch to parameterized.",
    Component: SqlInjectionDemo,
  },
  jwt: {
    title: "JWT forgery — three common verifier bugs",
    subtitle:
      "Flip the algorithm, confuse the key type, or crack a weak secret. Same outcome: identity forged.",
    Component: JwtForgeryDemo,
  },
  idor: {
    title: "IDOR — authenticated, but unauthorized",
    subtitle:
      "Same Alice on both sides. The vulnerable handler leaks other tenants. The owned version returns 404.",
    Component: IdorDemo,
  },
  "mass-assignment": {
    title: "Mass assignment — extra fields in the body",
    subtitle:
      "Send isAdmin: true in the PATCH body. With auto-bind, it sticks. With zod .strict(), it's rejected.",
    Component: MassAssignmentDemo,
  },
  timing: {
    title: "Timing attack — recovering a token byte by byte",
    subtitle:
      "Brute-force the API token by measuring response time. Short-circuit compare leaks; constant-time doesn't.",
    Component: TimingAttackDemo,
  },
};
