# Authentication & Session Management - Debug Guide

## Overview
This application uses Supabase authentication with custom user profiles stored in a PostgreSQL `users` table. Session persistence is managed through localStorage and Supabase's built-in session management.

## Authentication Flow

### 1. **Login Process**
```
User enters credentials → Supabase auth → Get session + tokens → 
Fetch user profile from users table → Save to localStorage → Redirect to dashboard
```

**localStorage Keys Set:**
- `supabase.auth.token` - Supabase managed session (auto-managed)
- `supabase_session` - Our copy of session data
- `access_token` - JWT access token
- `user` - User profile from users table

### 2. **Protected Route Access**
```
User navigates to /manufacturers or /resellers →
ProtectedRoute component checks:
  1. Check localStorage for valid session (fast)
  2. If valid → Render page
  3. If invalid → Check with Supabase API
  4. If no auth → Redirect to /auth
  5. If wrong role → Redirect to /
```

### 3. **Session Persistence**
- **Supabase Config**: `persistSession: true` in supabase.js
- **Storage**: localStorage with key `supabase.auth.token`
- **Auto-refresh**: Tokens refresh automatically before expiry
- **Expiry Check**: 5-minute buffer before actual expiry

## Key Files

### `/frontend/src/lib/supabase.js`
- Configures Supabase client with session persistence
- **Critical settings**:
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `storage: window.localStorage`

### `/frontend/src/lib/auth.js`
- `getCurrentUser()` - Gets user with session validation
- `getStoredUser()` - Quick localStorage read (no API call)
- `hasValidStoredSession()` - Checks session expiry
- `logout()` - Clears all auth data
- `onAuthStateChange()` - Listens to auth events

### `/frontend/src/components/ProtectedRoute.jsx`
- Wraps protected pages
- Handles authentication checks
- Enforces role-based access
- Shows loading state during auth check

### `/frontend/src/App.jsx`
- Route configuration
- Wraps `/manufacturers` and `/resellers` with ProtectedRoute

## Debugging Steps

### Check 1: Verify Supabase Session
Open browser console and run:
```javascript
// Check if Supabase session exists
const session = localStorage.getItem('supabase.auth.token');
console.log('Supabase session:', session ? 'EXISTS' : 'MISSING');

// Check our session copy
const ourSession = localStorage.getItem('supabase_session');
console.log('Our session:', ourSession ? JSON.parse(ourSession) : 'MISSING');

// Check user profile
const user = localStorage.getItem('user');
console.log('User profile:', user ? JSON.parse(user) : 'MISSING');
```

### Check 2: Verify Session Expiry
```javascript
const session = JSON.parse(localStorage.getItem('supabase_session'));
if (session && session.expires_at) {
  const expiryTime = new Date(session.expires_at * 1000);
  const now = new Date();
  console.log('Session expires at:', expiryTime);
  console.log('Current time:', now);
  console.log('Is expired:', expiryTime < now);
  console.log('Time remaining (minutes):', (expiryTime - now) / 1000 / 60);
}
```

### Check 3: Test Authentication Flow
```javascript
// Import Supabase client in console
import { supabase } from './src/lib/supabase.js';

// Check current session
const { data, error } = await supabase.auth.getSession();
console.log('Supabase session:', data.session);
console.log('Error:', error);

// Check user
const { data: userData } = await supabase.auth.getUser();
console.log('Supabase user:', userData.user);
```

### Check 4: Monitor Console Logs
The application logs authentication events with `[Auth]` and `[ProtectedRoute]` prefixes:

**Expected Login Flow:**
```
[Auth] Getting current user...
[Auth] Checking session with Supabase...
[Auth] Active session found for: user@example.com
[Auth] User profile loaded: user@example.com Role: manufacturer
[ProtectedRoute] Checking authentication...
[ProtectedRoute] Stored user: user@example.com
[ProtectedRoute] Has valid session: true
[ProtectedRoute] Using cached session for: user@example.com
[Manufacturers] Loading data for user: user@example.com
```

**Expected Redirect (Not Authenticated):**
```
[ProtectedRoute] Checking authentication...
[ProtectedRoute] Stored user: null
[ProtectedRoute] Has valid session: false
[Auth] Getting current user...
[Auth] Checking session with Supabase...
[Auth] No active Supabase session found
[ProtectedRoute] No authenticated user found, redirecting to: /auth
```

## Common Issues & Solutions

### Issue 1: "Redirects to /auth after login"
**Cause**: User profile not found in users table
**Solution**: 
1. Check if user exists in users table
2. Run SQL: `SELECT * FROM users WHERE email = 'user@example.com';`
3. If missing, the login flow should auto-create it
4. Check console for profile errors

### Issue 2: "Session doesn't persist across page refresh"
**Cause**: Supabase client not configured with persistence
**Solution**: 
1. Verify `/frontend/src/lib/supabase.js` has `persistSession: true`
2. Check if localStorage is enabled in browser
3. Check if cookies are blocked

### Issue 3: "Wrong role access (manufacturer sees reseller page)"
**Cause**: ProtectedRoute not enforcing role
**Solution**:
1. Verify App.jsx wraps routes with ProtectedRoute
2. Check requiredRole prop is set correctly
3. Verify user.role in users table matches

### Issue 4: "Token expired errors"
**Cause**: Session expired and not refreshing
**Solution**:
1. Verify `autoRefreshToken: true` in supabase.js
2. Check network tab for refresh_token requests
3. Clear localStorage and re-login

### Issue 5: "User data missing after login"
**Cause**: Race condition or localStorage not saving
**Solution**:
1. Check Auth.jsx saves all required data
2. Verify localStorage.setItem calls complete
3. Add delay before redirect (already set to 1500ms)

## SQL to Verify Database

### Check if user exists
```sql
SELECT id, name, email, role, created_at 
FROM users 
WHERE email = 'your-email@example.com';
```

### Check if manufacturer exists for user
```sql
SELECT m.*, u.name as owner_name, u.email as owner_email
FROM manufacturers m
LEFT JOIN users u ON m.owner_user_id = u.id
WHERE u.email = 'your-email@example.com';
```

### Create test manufacturer user
```sql
-- Insert user
INSERT INTO users (name, email, role, password_hash)
VALUES ('Test Manufacturer', 'test@manufacturer.com', 'manufacturer', 'supabase_managed')
RETURNING *;

-- Insert manufacturer (replace USER_ID with id from above)
INSERT INTO manufacturers (name, email, owner_user_id, phone, address)
VALUES ('Test Manufacturing Co', 'test@manufacturer.com', USER_ID, '+91-XXX', 'India')
RETURNING *;
```

## Testing Checklist

- [ ] User can register and receives confirmation email
- [ ] User can login with correct credentials
- [ ] Session persists after page refresh
- [ ] Session persists across browser tabs
- [ ] Manufacturer role can access /manufacturers
- [ ] Manufacturer role cannot access /resellers
- [ ] Reseller role can access /resellers
- [ ] Reseller role cannot access /manufacturers
- [ ] Logout clears all session data
- [ ] Direct navigation to protected route redirects if not logged in
- [ ] Token auto-refreshes before expiry
- [ ] User data loads correctly on protected pages

## Environment Variables

Ensure these are set in `.env`:
```
VITE_SUPABASE_URL=https://lwjhnclabubeyupiecpv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Support

If issues persist after following this guide:
1. Clear all localStorage: `localStorage.clear()`
2. Clear browser cache
3. Try incognito mode
4. Check Supabase dashboard for auth logs
5. Review browser console for errors
6. Check network tab for failed API calls
