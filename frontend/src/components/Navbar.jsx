import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check localStorage for user data on component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setShowDropdown(false);
    navigate("/");
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
            <li>
              <Link to="/resellers" className="hover:text-blue-700">
                Resellers Portal
              </Link>
            </li>
            <li>
              <Link to="/manufacturers" className="hover:text-blue-700">
                Manufacturer Portal
              </Link>
            </li>
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
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.role && (
                      <p className="text-xs text-gray-500">
                        Role:{" "}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Logout
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
