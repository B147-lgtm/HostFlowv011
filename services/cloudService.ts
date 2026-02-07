
import { supabase } from './supabaseClient';

export const MASTER_EMAIL = "badal.london@gmail.com";

// Add never properties to help TypeScript discriminate the union effectively
export type LoginResult = 
  | { ok: true; state: any; warning?: string; error?: never } 
  | { ok: false; error: string; state?: never; warning?: never };

// Default state structure for new users
const getInitialState = (email?: string, name?: string) => ({
  properties: [],
  activePropertyId: 'all',
  allBookings: [],
  allTransactions: [],
  allGuests: [],
  allStaffLogs: [],
  allInventory: [],
  stayPackages: [
    { id: 'p1', title: 'Basic Stay', desc: 'Standard room access.', iconType: 'home' },
    { id: 'p2', title: 'Premium Suite', desc: 'Luxury quarters upgrade.', iconType: 'star' },
    { id: 'p3', title: 'Event Hall', desc: 'Access to gardens and main hall.', iconType: 'sparkles' }
  ],
  timestamp: Date.now(),
  userEmail: email,
  userName: name
});

export const cloudSync = {
  /**
   * Resume existing session on app boot
   */
  async resumeSession(): Promise<any | null> {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    try {
      return await this.fetchVault(session.user.id);
    } catch (e) {
      console.warn("Resuming session but vault fetch failed, using fallback.");
      return getInitialState(session.user.email, session.user.user_metadata?.full_name);
    }
  },

  /**
   * Login with Supabase Auth
   * Updated to never return null if Auth succeeds, ensuring dashboard access.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    if (!supabase) {
      return { ok: false, error: "Supabase client not initialized." };
    }
    
    console.log("Supabase Auth Request: Login attempt for", email);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError.status, authError.message);
      return { ok: false, error: authError.message };
    }

    if (!data.user) {
      return { ok: false, error: "Authentication succeeded but no user was returned." };
    }

    console.log("Supabase Auth Success: User ID", data.user.id);

    try {
      const state = await this.fetchVault(data.user.id);
      return { ok: true, state };
    } catch (vaultError: any) {
      console.error("Vault Access Error (RLS or Fetch):", vaultError.message);
      // If Auth succeeded but vault failed, provide initial state to avoid locking user out
      return { 
        ok: true, 
        state: getInitialState(data.user.email, data.user.user_metadata?.full_name),
        warning: `Database sync limited: ${vaultError.message}`
      };
    }
  },

  /**
   * Log out of Supabase
   */
  async logout(): Promise<void> {
    if (supabase) await supabase.auth.signOut();
  },

  /**
   * Register new user
   */
  async createAccount(email: string, password: string, initialState: any): Promise<{success: boolean, confirmationRequired: boolean, error?: string}> {
    if (!supabase) return { success: false, confirmationRequired: false, error: "Supabase not connected" };
    
    console.log("Supabase Auth Request: SignUp attempt for", email);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      options: {
        data: {
          full_name: initialState.userName || 'New Host'
        }
      }
    });

    if (signUpError) {
      console.error("Supabase SignUp Error:", signUpError.status, signUpError.message);
      return { success: false, confirmationRequired: false, error: signUpError.message };
    }

    // If session is present, they are logged in immediately
    if (data.session && data.user) {
      console.log("Supabase SignUp: Immediate session established.");
      await this.pushData(initialState, data.user.id);
      return { success: true, confirmationRequired: false };
    }

    // If user is present but no session, confirmation is required
    if (data.user) {
      console.log("Supabase SignUp: User created, confirmation required.");
      return { success: true, confirmationRequired: true };
    }

    return { success: false, confirmationRequired: false, error: "Unknown registration result." };
  },

  /**
   * Save app state to Postgres
   */
  async pushData(state: any, userId?: string): Promise<boolean> {
    if (!supabase) return false;
    
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }
    
    if (!targetUserId) return false;

    const { error } = await supabase
      .from('vaults')
      .upsert({
        user_id: targetUserId,
        state: state,
        last_synced: new Date().toISOString(),
        app_version: 'v40'
      });

    if (error) {
      console.error("Supabase Vault Upsert Error:", error.message);
      return false;
    }
    return true;
  },

  /**
   * Internal helper to fetch or create vault row
   */
  async fetchVault(userId: string): Promise<any | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('vaults')
      .select('state')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Supabase Vault Select Error:", error.message);
      throw error;
    }

    if (!data) {
      console.log("Vault empty. Provisioning new row...");
      const { data: { user } } = await supabase.auth.getUser();
      const freshState = getInitialState(user?.email, user?.user_metadata?.full_name);
      await this.pushData(freshState, userId);
      return freshState;
    }

    return data.state;
  },

  /**
   * Admin Tools
   */
  async adminListAccounts(): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('vaults').select('user_id, last_synced, state');
    if (error) return [];
    return data.map(row => ({
      email: row.state?.userEmail || `User ${row.user_id.slice(0, 8)}`,
      createdAt: row.last_synced,
      password: "••••••••", 
      userId: row.user_id
    }));
  },

  async adminGetUserData(email: string): Promise<any | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('vaults').select('state');
    if (error) return null;
    const vault = data.find(v => v.state?.userEmail?.toLowerCase() === email.toLowerCase());
    return vault ? vault.state : null;
  },

  async adminDeleteAccount(email: string): Promise<boolean> {
    if (!supabase) return false;
    const { data: vaults } = await supabase.from('vaults').select('user_id, state');
    const target = vaults?.find(v => v.state?.userEmail?.toLowerCase() === email.toLowerCase());
    if (!target) return false;
    const { error } = await supabase.from('vaults').delete().eq('user_id', target.user_id);
    return !error;
  }
};
