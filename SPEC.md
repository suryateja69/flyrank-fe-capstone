# LeadDesk capstone specification

## Problem and audience

Small web agencies receive project inquiries with unclear scope, budget, and timing. LeadDesk helps a prospective client express their needs in a guided conversation and gives the agency an explainable qualification result for human review. This fits FlyRank’s lead-qualification-widget direction and connects streaming chat, structured tools, failure handling, and accessible UI in one bounded product.

## Primary flow

Open the workspace, start discovery, describe the business/project, answer follow-up questions, and receive a qualification card. The visitor can stop a stream, retry a failed response, and start a fresh conversation. No outreach is performed.

## Screens and stack

Overview, discovery, settings, about, service health, and component playground. Next.js App Router, React, TypeScript, Tailwind, AI SDK, Google AI provider, Zod, Vitest, React Testing Library, Playwright, axe.

## Acceptance checks

- Responsive at 375 and 1280 px without horizontal page overflow.
- Live AI response streams with a working stop and next-turn interaction.
- Typed qualification tool visibly renders all four states.
- Unknown facts contribute zero; scoring remains inspectable and deterministic.
- Invalid input, missing configuration, stream failure, rate limiting, and empty state show useful next actions.
- Core components pass tests, keyboard checks, and a deployed performance/accessibility audit.
- Credentials remain server-side; request sizes, output, duration, and rate are bounded.

## Scope decisions

One tab-local conversation; no persistent CRM or email. Google AI is selected to support an independently configured provider. Live provider success and production deployment remain verification requirements.
