
import { createClient } from '@supabase/supabase-js';

/**
 * HostFlow Production Sync - Supabase Client
 * 
 * This client uses a resilient environment resolution strategy to handle different
 * deployment environments (Vite, custom shims, or native ESM).
 */

const getSafeEnv = (key: string): string | undefined => {
  // Try process.env (Standard Node/CommonJS/Bundler shim)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  // Try import.meta.env (Vite/Modern ESM)
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch (e) {}

  return undefined;
};

// Check for both Vite-prefixed and standard environment variables
const supabaseUrl = getSafeEnv('VITE_SUPABASE_URL') || getSafeEnv('SUPABASE_URL');
const supabaseAnonKey = getSafeEnv('VITE_SUPABASE_ANON_KEY') || getSafeEnv('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ HostFlow Warning: Supabase credentials not found.\n" +
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment secrets.\n" +
    "The app will run in local-only mode until credentials are provided."
  );
}

// Initialize only if we have valid credentials to prevent Supabase from throwing "required" errors
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : (null as any); // Fallback to null; cloudService.ts handles null supabase gracefully
