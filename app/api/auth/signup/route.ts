import { jsonError, jsonOk } from "@/lib/http";
import { signUp } from "@/services/authService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; name?: string };

    if (!body.email || !body.password) {
      return jsonError("email and password are required", 400);
    }

    const user = await signUp(body.email, body.password, body.name);
    return jsonOk({ user }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign up";
    return jsonError(message, 500);
  }
}
