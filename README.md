# TaskFlow · Week 3 React application

A standalone personal task planner built with React, TypeScript and Next.js. This branch contains an independent practice project; the LeadDesk capstone on `main` is separate. No AI service, account, API key or deployment is required.

## Run locally

Requires Node.js 20.9 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Use `npm run build` then `npm start` for production. Run `npm test` and `npm run typecheck` to validate.

## Features

- Create, edit, prioritize and delete tasks; undo the latest deletion.
- Change task status between To do, In progress and Done.
- Search by title, filter by status, view completion counts and momentum.
- Browser storage persists tasks on this device. No server synchronization.
- Responsive layout, native keyboard controls, visible focus and labeled inputs.
- Trimmed task titles must contain 1–120 characters. Saved records are validated before use.

## Exercise evidence

- [Exact implementation and review prompts](docs/week3/PROMPTS.md)
- [How AI assisted the work](docs/week3/AI_ASSISTANCE.md)
- [Review corrections](docs/week3/REVIEW.md)

The assignment's reference video could not be retrieved because the request was throttled. This application follows the supplied written exercise, and does not claim to reproduce or have watched the video. This work addresses the first React development task only; deployment is outside scope.

## Structure

`src/components/planner.tsx` owns the interactive UI; `src/lib/tasks.ts` defines the task model and saved-data boundary. `src/app` provides the page, metadata and responsive styles. Tests exercise workflows and persistence boundaries.
