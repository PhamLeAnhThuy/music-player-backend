import { supabaseAdmin, supabasePublic } from "@/lib/supabase";

export async function signUp(email: string, password: string, name?: string) {
  const result = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: name ?? "",
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  const user = result.data.user;
  if (!user) {
    throw new Error("User creation returned no user payload");
  }

  const profileResult = await supabaseAdmin.from("users").upsert(
    {
      id: user.id,
      email: user.email ?? email,
      name: name ?? null,
      avatar_url: null,
    },
    { onConflict: "id" },
  );

  if (profileResult.error) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    throw new Error(`Profile insert failed: ${profileResult.error.message}`);
  }

  return result.data.user;
}

export async function login(email: string, password: string) {
  const result = await supabasePublic.auth.signInWithPassword({ email, password });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function logout(accessToken?: string) {
  if (!accessToken) {
    return;
  }

  const result = await supabasePublic.auth.signOut();
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function resetPassword(email: string) {
  const result = await supabasePublic.auth.resetPasswordForEmail(email);
  if (result.error) {
    throw new Error(result.error.message);
  }
}
