'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Listen for password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMessage('Please enter your new password below.');
      }
    });

    // Check if we have the necessary tokens from the reset link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
      // User came from password reset email
      setMessage('Please enter your new password below.');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      
      // Get the hash parameters from the URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session first
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(sessionError.message);
          return;
        }
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage('Password updated successfully! Redirecting to login...');
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-warm)' }}>
      <Header />
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-[var(--color-border-warm)]">
          <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
            Reset Password
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {message}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>New Password</span>
              <input
                type="password"
                className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-transparent transition-[var(--transition-base)]"
                style={{ 
                  borderColor: 'var(--color-border-muted)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(180, 84, 39, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-muted)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="New password"
                required
                minLength={6}
                disabled={loading || !!message}
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Confirm Password</span>
              <input
                type="password"
                className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-transparent transition-[var(--transition-base)]"
                style={{ 
                  borderColor: 'var(--color-border-muted)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(180, 84, 39, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-muted)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-label="Confirm password"
                required
                minLength={6}
                disabled={loading || !!message}
              />
            </label>

            <button
              type="submit"
              disabled={loading || !!message}
              className="bg-[var(--color-primary)] text-white py-3 rounded-xl hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
            <Link href="/auth/login" className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] underline font-medium transition-[var(--transition-base)]">
              Back to login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

