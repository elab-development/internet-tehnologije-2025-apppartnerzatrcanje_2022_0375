type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function nowMs() {
  return Date.now();
}

function parseClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

export function rateLimit(
  request: Request,
  key: string,
  options: { windowMs: number; max: number }
) {
  const ip = parseClientIp(request);
  const bucketKey = `${key}:${ip}`;
  const current = buckets.get(bucketKey);
  const now = nowMs();

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return { ok: true as const, remaining: options.max - 1, resetMs: options.windowMs };
  }

  if (current.count >= options.max) {
    return { ok: false as const, remaining: 0, resetMs: Math.max(0, current.resetAt - now) };
  }

  current.count += 1;
  buckets.set(bucketKey, current);
  return { ok: true as const, remaining: options.max - current.count, resetMs: current.resetAt - now };
}
