
import { supabase } from './supabaseClient';

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
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("HostFlow: Session restoration error:", sessionError.message);
      return null;
    }

    if (!session || !session.user) {
      return null;
    }

    try {
      return await this.fetchVault(session.user.id);
    } catch (e: any) {
      console.warn("HostFlow: Session valid but vault inaccessible. Providing fallback state.");
      return getInitialState(session.user.email, session.user.user_metadata?.full_name);
    }
  },

  /**
   * Login with Supabase Auth
   */
  async login(email: string, password: string): Promise<LoginResult> {
    if (!supabase) {
      return { ok: false, error: "Supabase client not initialized." };
    }
    
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    });

    if (authError) {
      console.error("HostFlow Auth Error:", authError.status, "-", authError.message);
      return { ok: false, error: authError.message };
    }

    if (!data.user) {
      return { ok: false, error: "Authentication succeeded but no user data returned." };
    }

    try {
      const state = await this.fetchVault(data.user.id);
      return { ok: true, state };
    } catch (vaultError: any) {
      console.error("HostFlow Vault Access Error:", vaultError.message);
      return { 
        ok: true, 
        state: getInitialState(data.user.email, data.user.user_metadata?.full_name),
        warning: `Cloud vault inaccessible (${vaultError.message}). Operating in session-only mode.`
      };
    }
  },

  /**
   * Register new user and provision initial vault
   */
  async createAccount(email: string, password: string, name?: string): Promise<LoginResult> {
    if (!supabase) return { ok: false, error: "Supabase not connected" };
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      options: {
        data: {
          full_name: name || 'Host'
        }
      }
    });

    if (signUpError) {
      console.error("HostFlow Registration Error:", signUpError.message);
      return { ok: false, error: signUpError.message };
    }

    if (data.session && data.user) {
      const initialState = getInitialState(data.user.email, name);
      await this.pushData(initialState, data.user.id);
      return { ok: true, state: initialState };
    }

    if (data.user) {
      return { ok: false, error: "Confirmation Required: Check your inbox to activate your vault." };
    }

    return { ok: false, error: "Registration process failed to return identity." };
  },

  /**
   * Log out of Supabase
   */
  async logout(): Promise<void> {
    if (supabase) await supabase.auth.signOut();
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
        app_version: 'v41'
      });

    if (error) {
      console.error("HostFlow Vault Push Error:", error.message);
      return false;
    }
    return true;
  },

  /**
   * Internal helper to fetch or create vault row
   */
  async fetchVault(userId: string): Promise<any> {
    if (!supabase) throw new Error("Supabase client unavailable.");
    
    const { data, error } = await supabase
      .from('vaults')
      .select('state')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("HostFlow Vault Retrieval Error:", error.message);
      throw error;
    }

    if (!data) {
      console.log("HostFlow: Initializing new production vault...");
      const { data: { user } } = await supabase.auth.getUser();
      const freshState = getInitialState(user?.email, user?.user_metadata?.full_name);
      const success = await this.pushData(freshState, userId);
      if (!success) throw new Error("Failed to initialize vault.");
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
