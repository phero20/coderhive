import { createClient } from '@supabase/supabase-js';

// Preferred: use Vite env vars. Fallback: hardcoded values provided by the user.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://lwjhnclabubeyupiecpv.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3amhuY2xhYnViZXl1cGllY3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDc1ODAsImV4cCI6MjA3ODE4MzU4MH0.MlF_XuLWRGsqY3jnYHV05QJWH9-6JLgugDE1fe7IK3Q';

// CRITICAL: Configure Supabase client with proper session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in localStorage for persistence across page refreshes
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    // Auto-refresh tokens before they expire
    autoRefreshToken: true,
    // Persist session across browser tabs
    persistSession: true,
    // Detect session from URL (for email confirmations, etc.)
    detectSessionInUrl: true,
  },
});
