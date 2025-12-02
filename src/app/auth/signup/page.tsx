'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = getSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        setMessage('Account created! Please check your email to verify your account.');
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
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
          <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>Create Account</h1>

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

          <form className="flex flex-col gap-4" onSubmit={handleSignup}>
            {/* Email */}
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email</span>
              <input
                type="email"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                required
              />
            </label>

            {/* Password */}
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Password</span>
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
                aria-label="Password"
                required
              />
            </label>

            {/* Signup button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--color-primary)] text-white py-3 rounded-xl hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] underline font-medium transition-[var(--transition-base)]">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
