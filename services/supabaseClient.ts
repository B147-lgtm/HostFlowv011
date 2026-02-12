
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
console.log("Supabase Connection: " + (supabaseUrl ? "ENDPOINT_OK" : "ENDPOINT_MISSING"));
console.log("Supabase Key: " + (supabaseAnonKey ? "KEY_OK" : "KEY_MISSING"));

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ HostFlow System Alert: Supabase credentials not found in environment.\n" +
    "Cloud vault features will be disabled. App will operate in local-cache mode only."
  );
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage // Explicitly use localStorage for persistence
      }
    })
  : (null as any);
