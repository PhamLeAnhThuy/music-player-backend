import { jsonError, jsonOk } from "@/lib/http";
import { searchSongs } from "@/services/songService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") ?? "";
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);

    if (!query.trim()) {
      return jsonError("query parameter q is required", 400);
    }

    const data = await searchSongs(query, limit);
    return jsonOk(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search songs";
    return jsonError(message, 500);
  }
}
