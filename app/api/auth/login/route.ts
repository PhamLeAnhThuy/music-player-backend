import { jsonError, jsonOk } from "@/lib/http";
import { login } from "@/services/authService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return jsonError("email and password are required", 400);
    }

    const session = await login(body.email, body.password);
    return jsonOk({ session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log in";
    return jsonError(message, 500);
  }
}
