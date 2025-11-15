'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        // Redirect to homepage on successful login
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Login</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* Email */}
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1 text-gray-700">Email</span>
              <input
                type="email"
                className="border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                required
              />
            </label>

            {/* Password */}
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1 text-gray-700">Password</span>
              <input
                type="password"
                className="border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                required
              />
            </label>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
