type Window = { count: number; expires: number };
const windows = new Map<string, Window>();

// Per-instance protection is supplemented by the host's WAF in deployment.
// The global bucket also caps provider spend when clients rotate IP addresses.
export function takeRateLimit(key: string, now = Date.now()): boolean {
  for (const [id, window] of windows) {
    if (window.expires <= now) windows.delete(id);
  }
  const current = windows.get(key) || { count: 0, expires: now + 60_000 };
  if (current.count >= (key === "global" ? 60 : 10)) return false;
  current.count += 1;
  windows.set(key, current);
  return true;
}
