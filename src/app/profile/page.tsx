'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    const loadProfile = async (userToLoad: any) => {
      if (!mounted || !userToLoad) return;

      setUser(userToLoad);

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userToLoad.id)
        .single();

      if (!mounted) return;

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        setError('Failed to load profile');
      } else if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setAvatarUrl(profileData.avatar_url || '');
      } else {
        // Profile doesn't exist, create one
        setFullName(userToLoad.email?.split('@')[0] || '');
      }

      setLoading(false);
    };

    const checkAuthAndLoadProfile = async () => {
      // Wait a bit for localStorage to be read (Supabase needs time to restore session)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mounted) return;

      // Get session first (reads from localStorage)
      const { data: { session } } = await supabase.auth.getSession();
      
      let currentUser = session?.user;
      
      if (!currentUser) {
        // If no session, try getUser (makes a network call to verify)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (userError || !user) {
          router.push('/auth/login?redirect=/profile');
          return;
        }
        
        currentUser = user;
      }

      await loadProfile(currentUser);
    };

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/auth/login?redirect=/profile');
      } else if (event === 'SIGNED_IN' && session?.user) {
        loadProfile(session.user);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    checkAuthAndLoadProfile();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = getSupabaseClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        setError('Not authenticated');
        return;
      }

      // Update or insert profile
      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: fullName || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setProfile(data);
      setMessage('Profile updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background-warm)' }}>
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Loading profile...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-warm)' }}>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
            My Profile
          </h1>

          <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border-warm)] p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              {/* Email (read-only) */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="border rounded-xl p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                  style={{ borderColor: 'var(--color-border-muted)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Email cannot be changed
                </p>
              </div>

              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                  placeholder="Enter your full name"
                />
              </div>

              {/* Avatar URL */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
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
                  placeholder="https://example.com/avatar.jpg"
                />
                {avatarUrl && (
                  <div className="mt-2">
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2"
                      style={{ borderColor: 'var(--color-border-warm)' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="bg-[var(--color-primary)] text-white py-3 rounded-xl hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--color-border-warm)' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Account Actions
              </h2>
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login?redirect=/profile"
                  className="text-sm text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] underline"
                >
                  Change Password
                </Link>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

