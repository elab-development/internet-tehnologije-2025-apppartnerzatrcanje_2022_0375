import { NextResponse, type NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getAllowedOrigin(request: NextRequest) {
  const configured = process.env.CORS_ORIGIN?.trim();
  if (configured) {
    return configured;
  }
  return request.nextUrl.origin;
}

function isSameOriginRequest(request: NextRequest) {
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  const targetOrigin = request.nextUrl.origin;

  if (originHeader) {
    return originHeader === targetOrigin;
  }

  if (refererHeader) {
    try {
      return new URL(refererHeader).origin === targetOrigin;
    } catch {
      return false;
    }
  }

  // Non-browser and same-origin server requests might not send either header.
  return true;
}

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  const allowedOrigin = getAllowedOrigin(request);
  const originHeader = request.headers.get("origin");

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self' https:; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
  );

  if (originHeader && originHeader === allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Vary", "Origin");
  }
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      applySecurityHeaders(response, request);
      return response;
    }

    if (MUTATING_METHODS.has(request.method) && !isSameOriginRequest(request)) {
      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: "CSRF_BLOCKED",
            message: "Cross-site request blocked.",
          },
        },
        { status: 403 }
      );
      applySecurityHeaders(response, request);
      return response;
    }
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, request);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
