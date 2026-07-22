import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or local storage fallback for interactive developer testing
const getSupabaseCredentials = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem('supabase_fallback_url');
  const localKey = localStorage.getItem('supabase_fallback_anon_key');

  return {
    url: envUrl || localUrl || '',
    key: envKey || localKey || '',
    isConfigured: !!(envUrl || localUrl) && !!(envKey || localKey),
    isFromEnv: !!(envUrl && envKey),
  };
};

export const { url, key, isConfigured, isFromEnv } = getSupabaseCredentials();

// Create the client conditionally to avoid crashing if credentials are missing
export let supabase: SupabaseClient | null = null;

if (isConfigured) {
  try {
    supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase Client:', error);
  }
}

/**
 * Update the client dynamically (useful for real-time testing in preview if the user enters config)
 */
export function initializeSupabaseWithCredentials(customUrl: string, customKey: string) {
  localStorage.setItem('supabase_fallback_url', customUrl);
  localStorage.setItem('supabase_fallback_anon_key', customKey);
  window.location.reload();
}

/**
 * Clear fallback credentials
 */
export function clearSupabaseCredentials() {
  localStorage.removeItem('supabase_fallback_url');
  localStorage.removeItem('supabase_fallback_anon_key');
  window.location.reload();
}
