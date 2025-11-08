import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getStoredUser } from "@/lib/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Initial load from localStorage
    const loadUser = () => {
      const storedUser = getStoredUser();
      console.log('[Navbar] Loading user:', storedUser?.email, 'Role:', storedUser?.role);
      setUser(storedUser);
    };
    
    loadUser();

    // Listen to custom userLogin event (from Auth.jsx)
    const handleUserLogin = (e) => {
      const newUser = e.detail;
      console.log('[Navbar] User login event:', newUser?.email, 'Role:', newUser?.role);
      setUser(newUser);
    };

    // Listen to custom userLogout event
    const handleUserLogout = () => {
      console.log('[Navbar] User logout event');
      setUser(null);
      setShowDropdown(false);
    };

    // Listen to localStorage changes (cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        console.log('[Navbar] Storage change:', newUser?.email, 'Role:', newUser?.role);
        setUser(newUser);
      }
    };

    // Add event listeners
    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    console.log('[Navbar] Logout clicked');
    await logout();
    setUser(null);
    setShowDropdown(false);
    // Dispatch logout event for other components
    window.dispatchEvent(new CustomEvent('userLogout'));
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-blue-700">
        UrbanSupply AI
      </Link>
      <ul className="hidden md:flex gap-8 text-gray-700">
        <li>
          <Link to="/" className="hover:text-blue-700">
            Home
          </Link>
        </li>
        <li>
          <Link to="/#features" className="hover:text-blue-700">
            Features
          </Link>
        </li>
        {/* Show only the portal that matches the logged-in user's role. If not logged in, show both portal links. */}
        {user ? (
          user.role === "reseller" ? (
            <li>
              <Link to="/resellers" className="hover:text-blue-700">
                Resellers Portal
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/manufacturers" className="hover:text-blue-700">
                Manufacturer Portal
              </Link>
            </li>
          )
        ) : (
          <>
           
          </>
        )}
        <li>
          <Link to="/#demo" className="hover:text-blue-700">
            Demo
          </Link>
        </li>
      </ul>

      {!isAuthPage && (
        <>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 transition"
                title={`${user.name} (${user.role})`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    {user.role && (
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'manufacturer' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Sign In
            </button>
          )}
        </>
      )}
    </nav>
  );
}
