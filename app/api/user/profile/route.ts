import { getUserIdFromRequest, jsonError, jsonOk } from "@/lib/http";
import { getUserProfile, updateUserProfile } from "@/services/userService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      return jsonError("Profile not found", 404);
    }

    return jsonOk({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return jsonError(message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const body = (await request.json()) as { name?: string; avatar_url?: string };
    const profile = await updateUserProfile(userId, {
      name: body.name,
      avatar_url: body.avatar_url,
    });

    return jsonOk({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return jsonError(message, 500);
  }
}
