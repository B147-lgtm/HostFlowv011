
import { supabase } from './supabaseClient';

export const MASTER_EMAIL = "badal.london@gmail.com";

// Default state structure for new users
const getInitialState = () => ({
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
  timestamp: Date.now()
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
      console.error("Supabase client not initialized. Check your environment variables.");
      return null;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    });

    if (error || !data.user) return null;

    return this.fetchVault(data.user.id);
  },

  /**
   * Log out of Supabase
   */
  async logout(): Promise<void> {
    if (supabase) await supabase.auth.signOut();
  },

  /**
   * Register new user and initialize vault
   */
  async createAccount(email: string, password: string, initialState: any): Promise<boolean> {
    if (!supabase) return false;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim()
    });

    if (error || !data.user) {
      console.error("Sign up failed:", error?.message);
      return false;
    }

    // Initialize the vault row immediately
    const success = await this.pushData(initialState);
    return success;
  },

  /**
   * Save app state to Postgres
   */
  async pushData(state: any): Promise<boolean> {
    if (!supabase) return false;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Use Postgres JSONB Upsert
    const { error } = await supabase
      .from('vaults')
      .upsert({
        user_id: user.id,
        state: state,
        last_synced: new Date().toISOString(),
        app_version: 'v39'
      }, { onConflict: 'user_id' });

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

    // If no row exists, initialize it
    if (!data) {
      const freshState = getInitialState();
      await this.pushData(freshState);
      return freshState;
    }

    return data.state;
  },

  /**
   * Admin Tools
   */
  async adminListAccounts(): Promise<any[]> {
    return [];
  },

  async adminGetUserData(email: string): Promise<any | null> {
    return null;
  },

  async adminDeleteAccount(email: string): Promise<boolean> {
    return false;
  }
};
