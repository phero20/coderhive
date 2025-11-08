import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '@/lib/auth';

/**
 * ProtectedRoute component - Wraps protected pages with authentication checks
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render
 * @param {string} props.requiredRole - Required user role ('manufacturer' or 'reseller')
 * @param {string} props.redirectTo - Where to redirect if not authenticated (default: '/auth')
 */
export default function ProtectedRoute({ children, requiredRole, redirectTo = '/auth' }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      try {
        console.log('[ProtectedRoute] Checking authentication for role:', requiredRole);
        
        // Simple check: just verify localStorage has user data
        const storedUser = getStoredUser();
        console.log('[ProtectedRoute] Checking user:', storedUser?.email, 'Role:', storedUser?.role);
        
        if (!storedUser) {
          console.log('[ProtectedRoute] ❌ No user in localStorage, redirecting to:', redirectTo);
          if (isMounted) {
            navigate(redirectTo, { replace: true });
          }
          return;
        }
        
        // Check role if required
        if (requiredRole && storedUser.role !== requiredRole) {
          console.log(`[ProtectedRoute] ❌ Role mismatch. Required: ${requiredRole}, Got: ${storedUser.role}`);
          if (isMounted) {
            navigate('/', { replace: true });
          }
          return;
        }

        // All checks passed - user exists and has correct role
        console.log('[ProtectedRoute] ✅ User authenticated, rendering content');
        if (isMounted) {
          setUser(storedUser);
          setIsAuthenticated(true);
          setIsLoading(false);
        }

      } catch (error) {
        console.error('[ProtectedRoute] Authentication check failed:', error);
        if (isMounted) {
          navigate(redirectTo, { replace: true });
        }
      }
    };

    checkAuthentication();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate, requiredRole, redirectTo]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect via useEffect
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - render children with user context
  return children;
}
