import { supabase } from './supabaseClient';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export const supabaseAuthService = {
  /**
   * Register a new user with email and password
   */
  signUp: async (email: string, password: string, displayName?: string) => {
    if (!supabase) throw new Error('Supabase client is not initialized. Please configure credentials first.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign in an existing user with email and password
   */
  signIn: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client is not initialized. Please configure credentials first.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Log out the currently authenticated user
   */
  signOut: async () => {
    if (!supabase) throw new Error('Supabase client is not initialized. Please configure credentials first.');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current active session
   */
  getSession: async (): Promise<Session | null> => {
    if (!supabase) return null;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Error getting session:', error);
        return null;
      }
      return session;
    } catch (e) {
      console.warn('Failed to fetch session:', e);
      return null;
    }
  },

  /**
   * Get the currently logged-in user profile
   */
  getCurrentUser: async (): Promise<User | null> => {
    if (!supabase) return null;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.warn('Error getting authenticated user:', error);
        return null;
      }
      return user;
    } catch (e) {
      console.warn('Failed to fetch user:', e);
      return null;
    }
  },

  signInWithGoogle: async () => {
    if (!supabase) throw new Error('Supabase client is not initialized. Please configure credentials first.');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) throw error;
    return data;
  },

  updateUserMetadata: async (metadata: any) => {
    if (!supabase) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });
    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to changes in authorization state (e.g. login, logout, token refresh)
   */
  subscribeToAuthChanges: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    if (!supabase) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }
};
