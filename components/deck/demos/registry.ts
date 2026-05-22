import type { ComponentType } from "react";
import { SqlInjectionDemo } from "./SqlInjectionDemo";

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
};
