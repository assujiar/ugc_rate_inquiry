import "server-only";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Server-side Supabase client for Server Components & Server Actions.
 * IMPORTANT: Pass the `cookies` function (not cookies()) to auth-helpers.
 * This avoids Next 16 cookie API shape issues.
 */
export function createSupabaseServerClient() {
  return createServerComponentClient({ cookies });
}