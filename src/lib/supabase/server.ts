import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export function createServerSupabaseClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Server-only admin client with service-role permissions.
 * STRICT SECURITY: NEVER CALL OR IMPORT THIS IN CLIENT-SIDE CODE.
 */
export function createAdminSupabaseClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
