'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      
      // Get initial user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Listen for auth changes and handle token refresh
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Always update user state based on session
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'TOKEN_REFRESHED' && session) {
          // Token was refreshed, user is still authenticated
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear state
          setUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          // User signed in, ensure state is updated
          setUser(session.user);
        }
      });

      // Set up automatic token refresh
      const refreshInterval = setInterval(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Refresh the session if it's close to expiring
            const expiresAt = session.expires_at;
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
            
            // Refresh if token expires in less than 5 minutes
            if (timeUntilExpiry < 300) {
              await supabase.auth.refreshSession();
            }
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      }, 60000); // Check every minute

      return () => {
        subscription.unsubscribe();
        clearInterval(refreshInterval);
      };
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    // Use window.location for a full page reload to clear all state
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-[var(--color-border-warm)] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Using Just Another Hand font with Merlot color */}
          <Link 
            href="/" 
            className="text-5xl md:text-6xl font-logo" 
            style={{ 
              color: 'var(--color-primary-dark)',
              fontFamily: '"Just Another Hand", cursive',
              fontWeight: 400,
              fontStyle: 'normal'
            }}
          >
            SipLocal
          </Link>

          {/* Navigation & User Menu */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-[var(--color-muted)] hover:text-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
              >
                Home
              </Link>
              <Link
                href="/cafes"
                className="px-4 py-2 text-[var(--color-muted)] hover:text-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
              >
                All Cafés
              </Link>
              {user && (
                <Link
                  href="/board"
                  className="px-4 py-2 text-[var(--color-muted)] hover:text-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
                >
                  My Board
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[var(--color-surface)] transition-[var(--transition-base)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-medium">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {user.email}
                    </span>
                    <svg
                      className="w-4 h-4"
                      style={{ color: 'var(--color-muted)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[var(--color-border-warm)] shadow-lg z-50">
                        <div className="py-2">
                          <Link
                            href="/board"
                            className="block px-4 py-2 text-sm hover:bg-[var(--color-surface)] transition-[var(--transition-base)]"
                            style={{ color: 'var(--color-text-primary)' }}
                            onClick={() => setShowMenu(false)}
                          >
                            My Pin Board
                          </Link>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm hover:bg-[var(--color-surface)] transition-[var(--transition-base)]"
                            style={{ color: 'var(--color-text-primary)' }}
                            onClick={() => setShowMenu(false)}
                          >
                            My Profile
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-surface)] transition-[var(--transition-base)]"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-[var(--color-muted)] hover:text-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

