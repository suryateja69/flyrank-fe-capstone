# Accessible component practice

The independent Week 4 exercise is in [`playground/handmade.tsx`](playground/handmade.tsx). These are AI-assisted React + TypeScript implementations, not evidence of unaided learner authorship. They import React and React DOM only; no Radix, shadcn, or other widget implementation is used for these three widgets. The existing `/playground` page re-exports them through `src/components/playground.tsx` alongside a clearly separate library comparison.

## APG audit and corrections

Reviewed the official W3C [modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), and [disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) patterns.

- **Modal isolation gap, corrected:** previously the custom dialog stayed inside the app tree and trapped Tab without isolating the background. It now portals to `document.body`, temporarily sets existing body siblings inert, and restores their exact previous inert attributes on close/unmount. A focus-in guard also redirects escaped focus into the dialog. Scroll locking is restored, initial focus goes to the named input, Tab/Shift+Tab wrap, Escape dismisses, and focus returns to the invoking button. Each instance now uses a unique input ID rather than the repeated `dialog-name` ID.
- **Accidental form submission gap, corrected:** native practice buttons previously omitted `type`; they now use `type="button"`, so rendering these widgets inside a form does not accidentally submit it.
- Tabs use automatic activation for immediate local content, one roving tab stop, left/right wrap, Home/End, tab-to-panel navigation, and explicit tab/panel ID relationships. Up/down remain available for browser scrolling. Disclosure uses a native button's Enter/Space behavior, `aria-expanded`, `aria-controls`, and `hidden` content.

## Read the actual shadcn source

The installed comparison source is `src/components/ui/dialog.tsx` and `src/components/ui/tabs.tsx`, with configuration in `components.json` and Radix dependencies in `package.json`/lockfile. The earlier registry CLI could not reach its registry; the existing project fetched the MIT shadcn source from its official GitHub repository and adapted imports. This update retains those files rather than claiming a new successful CLI installation.

Two concrete remaining differences from that source:

1. `DialogContent` composes `DialogPortal`, `DialogOverlay`, `DialogPrimitive.Content`, and a visible `DialogPrimitive.Close`; `DialogTitle`/`DialogDescription` delegate accessible relationships to Radix. Our modal implements its own focus listeners and inert cleanup. It covers this one static modal, but does not implement Radix's layered dismissal/focus-scope composition or nested-modal coordination. The formerly missing background isolation is now fixed for existing body siblings; dynamically inserted siblings and nested modals remain outside this exercise's scope.
2. `Tabs` passes `orientation` to `TabsPrimitive.Root`, and the wrappers preserve primitive props with `React.ComponentProps`. Radix supplies orientation-aware focus movement and disabled-tab behavior. Our implementation explicitly supports three enabled horizontal tabs only; adding vertical or disabled variants needs deliberate new logic and tests. No `any` props were added.

## Verification

`tests/playground.test.tsx` exercises keyboard activation, both focus-wrap directions, focus escape containment, return focus, restoration of pre-existing inert state, unique instance labels, arrow wrap, Home/End, single tab stop, panel entry, and disclosure's linked visibility. Existing component tests remain in place.

`e2e/playground.spec.ts` adds a real-browser keyboard-only sequence from page navigation through modal, tabs, and disclosure. It reaches the trigger with Tab rather than mouse clicks or injected focus. Browser/screen-reader verification is separate from jsdom; no screen-reader certification is claimed. The modal's focusable selector is intentionally bounded to its fixed visible controls, not a generic arbitrary-content dialog API.

Local results (2026-11-21): `npm test -- --reporter=dot` passed **27/27** tests across four files; `npm run typecheck` passed; `npm run build` passed with all routes generated. Production-mode Playwright reached browser launch but could not run because this environment has no cached Chromium headless-shell executable. The initial dev-server attempt also exposed the temporary shared node_modules symlink's Turbopack root restriction; this is not a committed configuration change. The new browser sequence must run in CI with Playwright browsers installed or be checked on the deployed site.
