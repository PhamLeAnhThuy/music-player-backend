import { NextRequest, NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}
