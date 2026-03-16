import { supabaseAdmin } from "@/lib/supabase";
import { UserProfile } from "@/types/domain";

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const result = await supabaseAdmin.from("users").select("*").eq("id", userId).maybeSingle();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function updateUserProfile(userId: string, payload: Partial<Pick<UserProfile, "name" | "avatar_url">>) {
  const result = await supabaseAdmin
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
