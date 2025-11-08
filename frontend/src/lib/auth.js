import { supabase } from './supabase';

// Auth utilities for Supabase integration

export const logout = async () => {
  try {
    console.log('[Auth] Logging out...');
    
    // Clear all auth-related localStorage FIRST
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('supabase_session');
    
    // Dispatch logout event for immediate UI updates
    window.dispatchEvent(new CustomEvent('userLogout'));
    
    // Then sign out from Supabase (this might trigger auth state changes)
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('[Auth] Supabase signOut error:', error);
      // Continue anyway since we already cleared localStorage
    }
    
    console.log('[Auth] Logout complete');
    
    // Redirect to home
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    // Clear localStorage even if logout fails
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('supabase_session');
    
    // Dispatch logout event anyway
    window.dispatchEvent(new CustomEvent('userLogout'));
  }
};

export const getCurrentUser = async () => {
  try {
    console.log('[Auth] Getting current user...');
    
    // First check localStorage for existing user data
    const storedUser = localStorage.getItem('user');
    const storedSession = localStorage.getItem('supabase_session');
    
    if (storedUser && storedSession) {
      try {
        const user = JSON.parse(storedUser);
        const session = JSON.parse(storedSession);
        
        // Check if session is still valid (not expired)
        if (session.expires_at && new Date(session.expires_at * 1000) > new Date()) {
          console.log('[Auth] Using cached user session for:', user.email);
          return user;
        } else {
          console.log('[Auth] Cached session expired, refreshing...');
        }
      } catch (e) {
        console.warn('[Auth] Error parsing stored session:', e);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('supabase_session');
      }
    }
    
    // If no valid cached session, check with Supabase
    console.log('[Auth] Checking session with Supabase...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[Auth] Session error:', sessionError);
      throw sessionError;
    }
    
    if (!session) {
      console.log('[Auth] No active Supabase session found');
      // No active session, clear localStorage and return null
      localStorage.removeItem('user');
      localStorage.removeItem('supabase_session');
      localStorage.removeItem('access_token');
      return null;
    }
    
    console.log('[Auth] Active session found for:', session.user.email);
    
    // Save fresh session info
    localStorage.setItem('supabase_session', JSON.stringify(session));
    localStorage.setItem('access_token', session.access_token);
    
    const user = session.user;
    if (user) {
      // Get user profile from our users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (!profileError && userProfile) {
        console.log('[Auth] User profile loaded:', userProfile.email, 'Role:', userProfile.role);
        localStorage.setItem('user', JSON.stringify(userProfile));
        return userProfile;
      } else {
        console.warn('[Auth] User profile not found in users table for:', user.email);
        console.warn('[Auth] Profile error:', profileError);
        // Clear localStorage if profile doesn't exist
        localStorage.removeItem('user');
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('access_token');
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('supabase_session');
    localStorage.removeItem('access_token');
    return null;
  }
};

export const isAuthenticated = async () => {
  try {
    // Quick check with stored session first
    if (hasValidStoredSession()) {
      return true;
    }
    
    // If no valid stored session, check with Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (session) {
      // Update stored session
      localStorage.setItem('supabase_session', JSON.stringify(session));
      localStorage.setItem('access_token', session.access_token);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state change:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN' && session) {
      // Save session info
      localStorage.setItem('supabase_session', JSON.stringify(session));
      localStorage.setItem('access_token', session.access_token);
      
      const user = await getCurrentUser();
      callback(event, user);
    } else if (event === 'SIGNED_OUT' || !session) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('supabase_session');
      callback(event, null);
    } else if (event === 'TOKEN_REFRESHED' && session) {
      // Update stored session when token is refreshed
      localStorage.setItem('supabase_session', JSON.stringify(session));
      localStorage.setItem('access_token', session.access_token);
    }
  });
};

// Helper function to get stored user without API calls (for quick checks)
export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

// Helper function to check if we have a valid stored session
export const hasValidStoredSession = () => {
  try {
    // Check both our copy and Supabase's storage
    const supabaseSession = localStorage.getItem('supabase.auth.token');
    const ourSession = localStorage.getItem('supabase_session');
    const user = localStorage.getItem('user');
    
    // Must have user data at minimum
    if (!user) {
      console.log('[Auth] No user data in localStorage');
      return false;
    }
    
    // Check Supabase's session first (most reliable)
    if (supabaseSession) {
      try {
        const session = JSON.parse(supabaseSession);
        if (session.expires_at) {
          const expiryTime = new Date(session.expires_at * 1000);
          const now = new Date();
          const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
          
          const isValid = expiryTime.getTime() > (now.getTime() + bufferTime);
          console.log('[Auth] Supabase session valid:', isValid, 'Expires:', expiryTime);
          return isValid;
        }
      } catch (e) {
        console.warn('[Auth] Error parsing Supabase session:', e);
      }
    }
    
    // Fallback to our session copy
    if (ourSession) {
      try {
        const session = JSON.parse(ourSession);
        if (session.expires_at) {
          const expiryTime = new Date(session.expires_at * 1000);
          const now = new Date();
          const bufferTime = 5 * 60 * 1000;
          
          const isValid = expiryTime.getTime() > (now.getTime() + bufferTime);
          console.log('[Auth] Our session valid:', isValid, 'Expires:', expiryTime);
          return isValid;
        }
      } catch (e) {
        console.warn('[Auth] Error parsing our session:', e);
      }
    }
    
    // If we have user data but no valid session, assume valid for now
    // Supabase will handle the actual auth check
    console.log('[Auth] User exists but no session data, allowing through');
    return true;
    
  } catch (error) {
    console.error('[Auth] Error checking stored session:', error);
    return false;
  }
};
