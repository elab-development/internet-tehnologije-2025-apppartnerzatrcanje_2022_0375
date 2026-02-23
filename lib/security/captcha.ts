export async function verifyCaptchaToken(token: string | undefined | null) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // If secret is not configured, keep local/dev flow unblocked.
  if (!secret) {
    return { ok: true as const };
  }

  if (!token || token.trim().length === 0) {
    return { ok: false as const, reason: "missing_token" as const };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      return { ok: false as const, reason: "provider_error" as const };
    }

    const result = (await response.json()) as { success?: boolean };
    return result.success ? { ok: true as const } : { ok: false as const, reason: "failed_check" as const };
  } catch {
    return { ok: false as const, reason: "provider_error" as const };
  }
}
