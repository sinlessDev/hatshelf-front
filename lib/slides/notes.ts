/**
 * Speaker notes keyed by slide index (0-based, matches the order in `slides`
 * from `data.ts`). All translatable text lives in messages/{locale}.json
 * under the `notes.*` namespace; this file only carries the key references.
 * Resolved to plain strings via `resolveNotes()` in `lib/slides/resolve.ts`.
 */

import type { LocSlideNote } from "./types";

export type { SlideNote } from "./types";

export const slideNotes: LocSlideNote[] = [
  // 1. Title
  {
    summaryKey: "notes.title.summary",
    talkingPointsKey: "notes.title.talkingPoints",
    transitionKey: "notes.title.transition",
  },

  // 2. Threat model
  {
    summaryKey: "notes.threatModel.summary",
    talkingPointsKey: "notes.threatModel.talkingPoints",
    detailsKey: "notes.threatModel.details",
    watchForKey: "notes.threatModel.watchFor",
    transitionKey: "notes.threatModel.transition",
  },

  // 3. Section 01 — Authentication & Authorization
  {
    summaryKey: "notes.section1.summary",
    talkingPointsKey: "notes.section1.talkingPoints",
  },

  // 4. Password hashing
  {
    summaryKey: "notes.passwords.summary",
    talkingPointsKey: "notes.passwords.talkingPoints",
    detailsKey: "notes.passwords.details",
    watchForKey: "notes.passwords.watchFor",
    transitionKey: "notes.passwords.transition",
  },

  // 5. JWT attacks
  {
    summaryKey: "notes.jwt.summary",
    talkingPointsKey: "notes.jwt.talkingPoints",
    detailsKey: "notes.jwt.details",
    watchForKey: "notes.jwt.watchFor",
    transitionKey: "notes.jwt.transition",
  },

  // 6. Session security
  {
    summaryKey: "notes.sessions.summary",
    talkingPointsKey: "notes.sessions.talkingPoints",
    detailsKey: "notes.sessions.details",
    watchForKey: "notes.sessions.watchFor",
    transitionKey: "notes.sessions.transition",
  },

  // 7. RBAC / ABAC / IDOR
  {
    summaryKey: "notes.authz.summary",
    talkingPointsKey: "notes.authz.talkingPoints",
    detailsKey: "notes.authz.details",
    watchForKey: "notes.authz.watchFor",
    transitionKey: "notes.authz.transition",
  },

  // 8. Section 02 — Injection
  {
    summaryKey: "notes.section2.summary",
    talkingPointsKey: "notes.section2.talkingPoints",
  },

  // 9. SQL injection
  {
    summaryKey: "notes.sqli.summary",
    talkingPointsKey: "notes.sqli.talkingPoints",
    detailsKey: "notes.sqli.details",
    watchForKey: "notes.sqli.watchFor",
    transitionKey: "notes.sqli.transition",
  },

  // 10. NoSQL + command injection
  {
    summaryKey: "notes.nosqlCmd.summary",
    talkingPointsKey: "notes.nosqlCmd.talkingPoints",
    detailsKey: "notes.nosqlCmd.details",
    watchForKey: "notes.nosqlCmd.watchFor",
    transitionKey: "notes.nosqlCmd.transition",
  },

  // 11. Path traversal & SSRF
  {
    summaryKey: "notes.pathSsrf.summary",
    talkingPointsKey: "notes.pathSsrf.talkingPoints",
    detailsKey: "notes.pathSsrf.details",
    watchForKey: "notes.pathSsrf.watchFor",
    transitionKey: "notes.pathSsrf.transition",
  },

  // 12. Section 03 — Data Protection & Secrets
  {
    summaryKey: "notes.section3.summary",
    talkingPointsKey: "notes.section3.talkingPoints",
  },

  // 13. Secrets management
  {
    summaryKey: "notes.secrets.summary",
    talkingPointsKey: "notes.secrets.talkingPoints",
    detailsKey: "notes.secrets.details",
    watchForKey: "notes.secrets.watchFor",
    transitionKey: "notes.secrets.transition",
  },

  // 14. Encryption
  {
    summaryKey: "notes.encryption.summary",
    talkingPointsKey: "notes.encryption.talkingPoints",
    detailsKey: "notes.encryption.details",
    watchForKey: "notes.encryption.watchFor",
    transitionKey: "notes.encryption.transition",
  },

  // 15. Section 04 — Infrastructure & API Security
  {
    summaryKey: "notes.section4.summary",
    talkingPointsKey: "notes.section4.talkingPoints",
  },

  // 16. Rate limiting + timing attacks
  {
    summaryKey: "notes.rateLimits.summary",
    talkingPointsKey: "notes.rateLimits.talkingPoints",
    detailsKey: "notes.rateLimits.details",
    watchForKey: "notes.rateLimits.watchFor",
    transitionKey: "notes.rateLimits.transition",
  },

  // 17. CORS & headers
  {
    summaryKey: "notes.cors.summary",
    talkingPointsKey: "notes.cors.talkingPoints",
    detailsKey: "notes.cors.details",
    watchForKey: "notes.cors.watchFor",
    transitionKey: "notes.cors.transition",
  },

  // 18. Dependency CVEs
  {
    summaryKey: "notes.supplyChain.summary",
    talkingPointsKey: "notes.supplyChain.talkingPoints",
    detailsKey: "notes.supplyChain.details",
    watchForKey: "notes.supplyChain.watchFor",
    transitionKey: "notes.supplyChain.transition",
  },

  // 19. Section 05 — Advanced Topics
  {
    summaryKey: "notes.section5.summary",
    talkingPointsKey: "notes.section5.talkingPoints",
  },

  // 20. Mass assignment
  {
    summaryKey: "notes.massAssignment.summary",
    talkingPointsKey: "notes.massAssignment.talkingPoints",
    detailsKey: "notes.massAssignment.details",
    watchForKey: "notes.massAssignment.watchFor",
    transitionKey: "notes.massAssignment.transition",
  },

  // 21. Deserialization
  {
    summaryKey: "notes.deserialization.summary",
    talkingPointsKey: "notes.deserialization.talkingPoints",
    detailsKey: "notes.deserialization.details",
    watchForKey: "notes.deserialization.watchFor",
    transitionKey: "notes.deserialization.transition",
  },

  // 22. Logging & errors
  {
    summaryKey: "notes.logging.summary",
    talkingPointsKey: "notes.logging.talkingPoints",
    detailsKey: "notes.logging.details",
    watchForKey: "notes.logging.watchFor",
    transitionKey: "notes.logging.transition",
  },

  // 23. Close
  {
    summaryKey: "notes.close.summary",
    talkingPointsKey: "notes.close.talkingPoints",
    watchForKey: "notes.close.watchFor",
  },
];
