# Capstone conventions

- Planned stack: Node.js LTS, React, TypeScript, Vite, and Tailwind CSS. Follow the stack requirements in each FlyRank assignment.
- Use PascalCase for React components, camelCase for functions, and semantic HTML for page structure.
- Build mobile-first. Check desktop layouts, keyboard navigation, visible focus, and image alternative text.
- Extract shared storefront components when they are needed across pages.
- Keep secrets in ignored environment files. Review generated changes and run available project checks.
- Use Conventional Commits for all changes.

## Current implementation

The capstone is LeadDesk, a Next.js App Router project with React, TypeScript, Tailwind, AI SDK, Google AI, and Zod. This supersedes the initial Vite/storefront placeholder.

- Model configuration and system instructions live in src/lib/ai-config.ts; server tool validation and scoring remain outside React components.
- Untrusted qualification output must be validated before rendering a score card.
- Keep the partial response when stopping generation; retry a failed response without duplicating the user message.
- Never describe mocked fixtures, missing provider configuration, unrun browser audits, or a pending deployment as a completed live feature.
