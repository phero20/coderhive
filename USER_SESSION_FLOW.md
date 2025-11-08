# User Session & Navbar Update Flow

## 🎯 Complete Authentication & UI Update Flow

### 1️⃣ **User Login/Register**

```
User fills form → Submits credentials
         ↓
Supabase Authentication
         ↓
Get/Create User Profile from users table
         ↓
Store in localStorage:
  • user: { id, name, email, role, ... }
  • supabase_session: { access_token, expires_at, ... }
  • access_token: "eyJhbGc..."
         ↓
Dispatch Custom Event: 'userLogin'
         ↓
Navbar Listens & Updates Immediately ⚡
```

---

## 2️⃣ **localStorage Data Structure**

After successful login, localStorage contains:

```javascript
// User Profile (from users table)
localStorage.getItem('user')
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "manufacturer",  // or "reseller"
  "created_at": "2025-01-08T...",
  "updated_at": "2025-01-08T..."
}

// Supabase Session
localStorage.getItem('supabase.auth.token')
{
  "access_token": "eyJhbGc...",
  "refresh_token": "...",
  "expires_at": 1704758400,
  "user": { ... }
}

// Our Session Copy
localStorage.getItem('supabase_session')
// Same as above

// Access Token
localStorage.getItem('access_token')
"eyJhbGc..."
```

---

## 3️⃣ **Navbar Update Mechanisms**

The Navbar updates through **4 different mechanisms** to ensure it's always in sync:

### A. **Initial Load**
```javascript
useEffect(() => {
  const storedUser = getStoredUser();
  if (storedUser) {
    setUser(storedUser); // Immediate display
  }
}, []);
```

### B. **Custom Event (Immediate)**
```javascript
// Auth.jsx dispatches after login
window.dispatchEvent(new CustomEvent('userLogin', { 
  detail: userProfile 
}));

// Navbar listens
window.addEventListener('userLogin', (e) => {
  setUser(e.detail); // Instant update!
});
```

### C. **localStorage Polling (1 second)**
```javascript
setInterval(() => {
  const currentUser = getStoredUser();
  if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
    setUser(currentUser); // Update if changed
  }
}, 1000);
```

### D. **Supabase Auth State Changes**
```javascript
onAuthStateChange((event, user) => {
  setUser(user); // Update on SIGNED_IN, SIGNED_OUT, etc.
});
```

### E. **Storage Events (Cross-tab sync)**
```javascript
window.addEventListener('storage', (e) => {
  if (e.key === 'user') {
    setUser(JSON.parse(e.newValue));
  }
});
```

---

## 4️⃣ **Navbar Display Logic**

### Avatar Display
```javascript
// Shows first letter of name or email
<div className="w-10 h-10 rounded-full bg-blue-600 text-white">
  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
</div>
```

**Example:**
- Name: "John Doe" → Shows **"J"**
- Email: "admin@example.com" → Shows **"A"**

### Role-Based Navigation
```javascript
{user ? (
  user.role === "reseller" ? (
    <Link to="/resellers">Resellers Portal</Link>
  ) : (
    <Link to="/manufacturers">Manufacturer Portal</Link>
  )
) : null}
```

**Logic:**
- **If logged in as Reseller** → Shows "Resellers Portal" link
- **If logged in as Manufacturer** → Shows "Manufacturer Portal" link
- **If not logged in** → Shows neither (empty)

### Dropdown Menu
```javascript
<div className="dropdown">
  <p>{user.name || 'User'}</p>
  <p>{user.email}</p>
  <span className={user.role === 'manufacturer' ? 'purple-badge' : 'green-badge'}>
    {user.role}
  </span>
  <button onClick={logout}>🚪 Logout</button>
</div>
```

**Displays:**
- User name (or "User" if missing)
- Email address
- Role badge (purple for manufacturer, green for reseller)
- Logout button

---

## 5️⃣ **Complete Flow Timeline**

```
T=0ms    User clicks "Login"
         ↓
T=100ms  Supabase authenticates
         ↓
T=200ms  Fetch user profile from database
         ↓
T=250ms  Store in localStorage
         ↓
T=251ms  Dispatch 'userLogin' event
         ↓
T=252ms  Navbar receives event → Updates user state
         ↓
T=253ms  Avatar appears with first letter
         ↓
T=254ms  Role-based nav link appears
         ↓
T=1500ms Redirect to home page
         ↓
T=1501ms Page loads, Navbar reads from localStorage
         ↓
T=1502ms User sees their avatar and correct portal link ✅
```

---

## 6️⃣ **Role-Based UI Examples**

### Manufacturer User
```
Navbar shows:
┌─────────────────────────────────────────────────┐
│ UrbanSupply AI  [Home] [Features]               │
│ [Manufacturer Portal] [Demo]           [Avatar] │
└─────────────────────────────────────────────────┘

Avatar Dropdown:
┌──────────────────────┐
│ John Doe             │
│ john@mfg.com         │
│ [Manufacturer] 🟣    │
│ ──────────────────── │
│ 🚪 Logout            │
└──────────────────────┘
```

### Reseller User
```
Navbar shows:
┌─────────────────────────────────────────────────┐
│ UrbanSupply AI  [Home] [Features]               │
│ [Resellers Portal] [Demo]              [Avatar] │
└─────────────────────────────────────────────────┘

Avatar Dropdown:
┌──────────────────────┐
│ Jane Smith           │
│ jane@resell.com      │
│ [Reseller] 🟢        │
│ ──────────────────── │
│ 🚪 Logout            │
└──────────────────────┘
```

### Not Logged In
```
Navbar shows:
┌─────────────────────────────────────────────────┐
│ UrbanSupply AI  [Home] [Features]               │
│ [Demo]                          [Sign In Button]│
└─────────────────────────────────────────────────┘
```

---

## 7️⃣ **Debugging User Session**

### Check if user is stored
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Name:', user?.name);
console.log('Email:', user?.email);
console.log('Role:', user?.role);
```

### Check Navbar state
```javascript
// Look for these console logs
[Navbar] Initial user load: john@example.com Role: manufacturer
[Navbar] User login event: john@example.com Role: manufacturer
[Navbar] User state updated: john@example.com Role: manufacturer
```

### Verify role-based navigation
```javascript
const user = JSON.parse(localStorage.getItem('user'));
if (user.role === 'manufacturer') {
  console.log('Should see: Manufacturer Portal link');
} else if (user.role === 'reseller') {
  console.log('Should see: Resellers Portal link');
}
```

---

## 8️⃣ **Common Issues & Solutions**

### Issue: Avatar doesn't appear after login
**Solution:** Check console for `[Navbar] User login event` log. If missing, the custom event isn't firing.

### Issue: Wrong portal link shows
**Solution:** Check `user.role` in localStorage. Should be exactly "manufacturer" or "reseller" (lowercase).

### Issue: Navbar doesn't update immediately
**Solution:** The polling mechanism updates every 1 second. Custom event should be instant. Check if event is dispatched.

### Issue: Avatar shows wrong letter
**Solution:** Check if `user.name` exists. If null, it falls back to email first letter.

---

## 9️⃣ **Testing Checklist**

- [ ] Login as manufacturer → Avatar shows with first letter
- [ ] Login as manufacturer → "Manufacturer Portal" link appears
- [ ] Login as reseller → "Resellers Portal" link appears
- [ ] Dropdown shows correct name, email, and role badge
- [ ] Role badge is purple for manufacturer, green for reseller
- [ ] Logout clears avatar and shows "Sign In" button
- [ ] Page refresh maintains user state
- [ ] Multiple tabs sync user state
- [ ] Console shows proper log messages

---

## 🎉 Summary

**User data flow:**
1. Login/Register → Store in localStorage
2. Dispatch custom event
3. Navbar listens and updates immediately
4. Avatar shows first letter of name/email
5. Navigation shows role-appropriate portal link
6. Dropdown displays user info with colored role badge

**Update mechanisms:**
- Custom event (instant)
- Polling (1 second)
- Auth state changes
- Storage events (cross-tab)

**Result:** Navbar always shows correct user state, regardless of how the page was loaded or refreshed! ✅
