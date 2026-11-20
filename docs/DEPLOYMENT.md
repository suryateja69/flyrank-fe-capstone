# Deployment checklist

## Before deployment

- [x] Commit application source and a lockfile.
- [x] Keep credentials out of version control and document variables.
- [x] Add input/output caps and bounded stream duration.
- [x] Add per-instance request limiting and document its limitations.
- [x] Add application health endpoint and recoverable configuration error.
- [ ] Confirm final typecheck, tests, and production build at the deployed commit.
- [ ] Configure Vercel/Netlify account and Git-connected deployment.
- [ ] Add GOOGLE_GENERATIVE_AI_API_KEY as a server-only host secret.
- [ ] Enable provider quotas/spending limits and host-level rate protection.

## Verify the deployment

- [ ] Record the production URL and deployment commit.
- [ ] Hold a real multi-turn conversation and observe token streaming.
- [ ] Stop a stream, preserve its partial text, and send another message.
- [ ] Observe a real successful qualification tool result.
- [ ] Test two real failure paths with screenshots or a recording.
- [ ] Run deployed mobile Lighthouse and WAVE/axe, then record before/after results.
- [ ] Check keyboard navigation, 375/1280 px, Firefox, and mobile Safari.
- [ ] Inspect CI at the final commit and record its passing run.

## Monitoring and rollback

Monitor `/api/health` for application availability. It reports whether a provider key is configured, without exposing its value; it does not claim to test the provider. Review deployment logs for the generic `chat_generation_failed` marker. Conversation text and credentials are not logged intentionally.

If the production release fails, use the host’s previous-deployment promotion/rollback feature, then fix on a branch and redeploy a verified commit. For a broken AI configuration, preserve the explicit 503 error rather than pretending to return an AI answer. Confirm quotas and the server variable before retrying.

Deployment sign-off is pending. The unchecked items require verification on the actual host.
