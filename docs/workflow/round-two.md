# Round two — precise prompt

## Exact delegated prompt

User authorizes two independent AI coding sessions for FlyRank workflow drill. You are precise round, never inspect other worktrees. Create /workspace/scratch/f7a2d3ee8dce/week2-precise as git worktree from /workspace/scratch/f7a2d3ee8dce/week2-frontend main HEAD. Explore AGENTS.md, src/app/settings/page.tsx, src/components/settings-form.tsx, tests/setup.ts and component tests, then record plan, implement and verify. Add notification preferences form on /settings in separate component. Controlled email notifications checkbox and digest frequency daily/weekly; persist only on Save under leaddesk-notification-preferences, validate storage shape, handle malformed/blocked reads and failed writes without false success; labels keyboard semantics and role status/alert; clearing stale success after edit; disabled digest when notifications off but preserve frequency. Example: enable weekly/save/reload retains values; failed storage shows error; malformed cache falls back safely. No dependencies or network. Write meaningful tests and run them plus typecheck/build if feasible using existing lead-desk node_modules via symlink if needed. Save exact prompt, explore-plan-code notes, honest timing and verification in docs/workflow/round-two.md. Update CLAUDE.md 3 concrete learned rules. Commit conventional locally, no remote writes. Report SHA and outcomes.

## Explore and plan (before implementation)

Started approximately 2026-11-21 07:26 UTC; timing is wall-clock observation, not instrumented active work. Base main: 3b9dd18. Read root AGENTS.md, settings page/form, setup, component tests, CSS and package configuration. Read installed Next.js use-client guide after correcting an initial .mdx path to .md. Existing setup cleans localStorage and restores mocks after tests; forms use native labels and live feedback. Existing input CSS assumes full-width text inputs, so checkbox needs a scoped override.

Plan: add a small client component using Zod strict shape validation, safe effect-based hydration and defaults (email off, daily); write only in submit handler; report blocked reads and writes; clear feedback after edits. Integrate beside workspace form, preserve frequency while disabled, style scoped controls. Test persistence/remount, no automatic writes, corrupt and blocked storage, failed saves and keyboard operation. Run all unit tests, typecheck and production build using existing dependencies; record actual results.

## Code and verification

Implemented independent notification-preferences-form.tsx mounted after workspace preferences. Native checkbox/select semantics, explicit device-only practice copy, strict Zod cache shape, save-only persistence, preserved disabled frequency and feedback cleared on edit. Added scoped styles and three learned rules to CLAUDE.md. Invalid JSON shows a read error; invalid valid-JSON shapes quietly retain defaults. Both leave the cache untouched until Save.

Verification on 2026-11-21:

- `npm test`: PASS, 3 files / 31 tests, including 13 new cases (reported duration 2.85 seconds). Covers unsaved edits, remount persistence, disabled weekly preservation, seven malformed shapes, blocked reads, failed writes and retry, stale feedback and native keyboard activation/submission.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; Next.js 16.4.6 webpack production compilation, TypeScript and static page generation including /settings completed. Compilation reported 12.4 seconds.
- `git diff --check`: PASS.
- No browser session, visual audit, real email delivery, end-to-end suite or remote write was performed. Existing npm http-proxy and Vite module-format warnings were informational.

Finished verification around 07:28 UTC, roughly two minutes wall time from initial exploration; this is approximate, not a benchmark of human or model productivity. No dependencies were installed or network requested. Existing dependencies were temporarily symlinked from lead-desk and the symlink was removed after verification. Only the instructed source main worktree and this independent worktree were read.
