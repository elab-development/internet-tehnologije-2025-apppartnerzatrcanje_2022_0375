import { NextResponse } from "next/server";

type ErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export function jsonSuccess(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(error: ErrorPayload, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}
