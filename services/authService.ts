import { supabaseAdmin, supabasePublic } from "@/lib/supabase";

async function upsertUserProfile(user: { id: string; email?: string | null; user_metadata?: { name?: string } | null }, fallbackName?: string) {
  const profileResult = await supabaseAdmin.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? fallbackName ?? null,
      avatar_url: null,
    },
    { onConflict: "id" },
  );

  if (profileResult.error) {
    throw new Error(`Profile insert failed: ${profileResult.error.message}`);
  }
}

async function findAuthUserByEmail(email: string) {
  let page = 1;

  while (true) {
    const result = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (result.error) {
      throw new Error(`Failed to inspect existing users: ${result.error.message}`);
    }

    const existingUser = result.data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return existingUser;
    }

    if (result.data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

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
    if (/already been registered|already exists/i.test(result.error.message)) {
      const existingUser = await findAuthUserByEmail(email);
      if (existingUser) {
        await upsertUserProfile(existingUser, name);
      }
    }

    throw new Error(result.error.message);
  }

  const user = result.data.user;
  if (!user) {
    throw new Error("User creation returned no user payload");
  }

  try {
    await upsertUserProfile(user, name);
  } catch (error) {
    const cleanupResult = await supabaseAdmin.auth.admin.deleteUser(user.id);
    const baseMessage = error instanceof Error ? error.message : "Profile insert failed";

    if (cleanupResult.error) {
      throw new Error(`${baseMessage}. Cleanup failed: ${cleanupResult.error.message}`);
    }

    throw new Error(baseMessage);
  }

  return result.data.user;
}

export async function login(email: string, password: string) {
  const result = await supabasePublic.auth.signInWithPassword({ email, password });

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (result.data.user) {
    await upsertUserProfile(result.data.user);
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
