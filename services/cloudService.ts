
import { supabase } from './supabaseClient';

export const MASTER_EMAIL = "badal.london@gmail.com";

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

    return this.fetchVault(session.user.id);
  },

  /**
   * Login with Supabase Auth
   */
  async login(email: string, password: string): Promise<any | null> {
    if (!supabase) {
      console.error("Supabase client not initialized.");
      return null;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    });

    if (error) {
      console.error("Login error:", error.message);
      throw error; 
    }

    if (!data.user) return null;

    return this.fetchVault(data.user.id);
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
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      options: {
        data: {
          full_name: initialState.userName || 'New Host'
        }
      }
    });

    if (error) {
      console.error("Sign up error:", error.message);
      return { success: false, confirmationRequired: false, error: error.message };
    }

    // If session is present, initialize the vault immediately
    if (data.session && data.user) {
      await this.pushData(initialState, data.user.id);
      return { success: true, confirmationRequired: false };
    }

    // If confirmation is required
    if (data.user) {
      return { success: true, confirmationRequired: true };
    }

    return { success: false, confirmationRequired: false, error: "Unknown registration error" };
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
      console.error("Cloud push failed:", error.message);
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
      console.error("Vault fetch error:", error.message);
      return null;
    }

    // If no row exists, initialize it with default data
    if (!data) {
      console.log("Initializing new vault for user...");
      const { data: { user } } = await supabase.auth.getUser();
      const freshState = getInitialState(user?.email, user?.user_metadata?.full_name);
      const pushed = await this.pushData(freshState, userId);
      return pushed ? freshState : null;
    }

    return data.state;
  },

  /**
   * Admin: List all accounts (based on vaults)
   */
  async adminListAccounts(): Promise<any[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('vaults')
      .select('user_id, last_synced, state');

    if (error) {
      console.error("Admin list error:", error.message);
      return [];
    }

    return data.map(row => ({
      email: row.state?.userEmail || `User ${row.user_id.slice(0, 8)}`,
      createdAt: row.last_synced,
      password: "••••••••", // Password not accessible via client SDK for security
      userId: row.user_id
    }));
  },

  /**
   * Admin: Get specific user state
   */
  async adminGetUserData(email: string): Promise<any | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('vaults')
      .select('state');

    if (error) return null;
    
    const vault = data.find(v => v.state?.userEmail?.toLowerCase() === email.toLowerCase());
    return vault ? vault.state : null;
  },

  /**
   * Admin: Delete account vault
   */
  async adminDeleteAccount(email: string): Promise<boolean> {
    if (!supabase) return false;

    const { data: vaults } = await supabase.from('vaults').select('user_id, state');
    const target = vaults?.find(v => v.state?.userEmail?.toLowerCase() === email.toLowerCase());
    
    if (!target) return false;

    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('user_id', target.user_id);

    return !error;
  }
};
