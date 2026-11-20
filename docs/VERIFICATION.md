# Verification record

## Measured locally on 20 November 2026

- Node 24.22.3 and npm 11.19.1.
- `npm run typecheck` passed before the last documentation/source-formatting pass; rerun required after final source changes.
- `npm run build` produced all application routes successfully before the last library reference update; final rerun required.
- 18 Vitest tests passed. Measured core-component coverage was 74.86% statements and 88.75% lines. This is the configured core-component set, not a whole-repository coverage claim.
- A regression test originally failed when Shift+Tab escaped the custom dialog. A `:is(button,input,a[href]):not(:disabled)` selector fixed focusable node ordering in the test DOM.

## Verification blocked or pending

The local Playwright package could not download its Chromium build because the download endpoint was blocked. The available system Chromium failed to start under the execution environment’s socket restrictions. Consequently the browser test and axe checks have not passed locally. The committed GitHub Actions workflow runs them on an Ubuntu runner, where their outcome must be inspected.

Live provider calls are pending server configuration. No live AI response, deployed URL, Lighthouse score, WAVE result, mobile Safari pass, measured WebGL frame rate, or certificate acceptance is claimed.

The fixtures on the tool-state page and in Playwright tests use clearly identified sample data. They are test evidence, not a substitute for the live AI requirement.
