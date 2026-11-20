# Accessible component comparison

The custom dialog, tabs, and disclosure are authored in `src/components/playground.tsx`. The imported shadcn reference components live in `src/components/ui/` and wrap Radix primitives. The registry CLI could not reach its registry in this environment, so the MIT source was fetched from shadcn-ui/ui’s official GitHub repository and its import paths were adapted for this project.

Two concrete differences are visible in the code. First, the custom dialog manages its own keyboard handler and focus restoration, while Radix supplies a FocusScope and dismissal behavior through its content primitive. The test suite caught our focusable-selector ordering bug and we corrected it. Second, the library portal renders outside the surrounding page tree and supplies background accessibility isolation. The custom version stays in the page tree and traps Tab but does not yet make background content inert for every assistive-technology navigation mode. It is a learning playground, and the library pattern is preferable for a production modal.

The custom tabs explicitly implement arrow wrapping, Home/End, selected state, and tab/panel relationships. Radix supplies orientation-aware roving focus and disabled-tab handling. The custom example is limited to three enabled horizontal tabs and would need more work to support disabled and vertical variants.

Tests cover focus on open, Shift+Tab wrap, Escape dismissal, focus return, tab arrow/Home/End behavior, and keyboard disclosure activation. Browser and screen-reader checks are still required before calling the custom widgets production-accessible.
