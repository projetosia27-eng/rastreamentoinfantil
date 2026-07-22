import { supabase } from './supabaseClient';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const supabaseRealtimeService = {
  /**
   * Subscribe to all database changes for a specific table
   * @param table The PostgreSQL table name (e.g. 'alerts', 'children')
   * @param event The event type to listen to: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
   * @param callback The function executed when a change is detected
   */
  subscribeToTable: <T extends Record<string, any>>(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
    callback: (payload: RealtimePostgresChangesPayload<T>) => void
  ): RealtimeChannel | null => {
    if (!supabase) {
      console.warn('Realtime subscription skipped: Supabase client is not initialized.');
      return null;
    }

    // Initialize the realtime subscription channel
    const channelName = `realtime-changes-${table}-${event}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
        },
        (payload) => {
          callback(payload as RealtimePostgresChangesPayload<T>);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to real-time events [${event}] on table "${table}"`);
        } else {
          console.log(`Real-time channel status for [${table}]: ${status}`);
        }
      });

    return channel;
  },

  /**
   * Unsubscribe from an active real-time channel
   */
  unsubscribeChannel: async (channel: RealtimeChannel | null): Promise<void> => {
    if (!supabase || !channel) return;
    await supabase.removeChannel(channel);
    console.log('Successfully unsubscribed from real-time channel.');
  }
};
