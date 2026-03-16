import { jsonError, jsonOk } from "@/lib/http";
import { logout } from "@/services/authService";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.replace("Bearer ", "");

    await logout(accessToken);
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log out";
    return jsonError(message, 500);
  }
}
