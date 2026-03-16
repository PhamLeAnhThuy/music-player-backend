import { jsonError, jsonOk } from "@/lib/http";
import { resetPassword } from "@/services/authService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };

    if (!body.email) {
      return jsonError("email is required", 400);
    }

    await resetPassword(body.email);
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password";
    return jsonError(message, 500);
  }
}
