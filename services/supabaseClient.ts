
import { createClient } from '@supabase/supabase-js';

/**
 * HostFlow Production Sync - Supabase Client
 */

const getSafeEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch (e) {}

  return undefined;
};

const supabaseUrl = getSafeEnv('VITE_SUPABASE_URL') || getSafeEnv('SUPABASE_URL');
const supabaseAnonKey = getSafeEnv('VITE_SUPABASE_ANON_KEY') || getSafeEnv('SUPABASE_ANON_KEY');

// Debug output for environment state (safe)
console.log("Supabase Client Init - URL detected:", !!supabaseUrl);
console.log("Supabase Client Init - AnonKey detected:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ HostFlow Warning: Supabase credentials not found.\n" +
    "The app will run in local-only mode until credentials are provided."
  );
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : (null as any);
