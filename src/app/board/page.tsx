'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { getSupabaseClient } from '@/lib/supabaseClient';
import PinButton from '@/components/PinButton';
import PinEditModal from '@/components/PinEditModal';

interface Pin {
  id: string;
  businessId: string;
  status: 'favorite' | 'want_to_try';
  userNotes: string | null;
  userImageUrl: string | null;
  createdAt: string;
  business: {
    id: string;
    name: string;
    imageUrl: string | null;
    rating: number;
    reviewCount: number;
    price: string | null;
    categories: Array<{ alias: string; title: string }>;
    city: string;
    state: string;
  } | null;
}

export default function BoardPage() {
  const router = useRouter();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'favorite' | 'want_to_try'>('all');
  const [editingPin, setEditingPin] = useState<Pin | null>(null);

  useEffect(() => {
    const checkAuthAndLoadPins = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setCurrentUser(user);
      await loadPins(user.id);
    };

    checkAuthAndLoadPins();
  }, [router]);

  const loadPins = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(`/api/pins`, { headers });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to load pins');
        setPins([]);
      } else {
        setPins(json.pins || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setPins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (pinId: string) => {
    if (!currentUser) return;
    
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(`/api/pins?pin_id=${pinId}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json();
      if (json.success) {
        // Reload pins
        await loadPins(currentUser.id);
      }
    } catch (error) {
      console.error('Error unpinning:', error);
    }
  };

  const filteredPins = filter === 'all' 
    ? pins 
    : pins.filter(pin => pin.status === filter);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className="text-xs" style={{ color: 'var(--color-primary)' }}>
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-xs" style={{ color: 'var(--color-primary)' }}>☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-xs" style={{ color: 'var(--color-border)' }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background-warm)' }}>
        <Header />
        <main className="container mx-auto px-4 py-16">
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading your board...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-warm)' }}>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            My Pin Board
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Your favorite cafés and places to try
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-medium transition-[var(--transition-base)] ${
              filter === 'all'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
            }`}
          >
            All ({pins.length})
          </button>
          <button
            onClick={() => setFilter('favorite')}
            className={`px-4 py-2 rounded-full font-medium transition-[var(--transition-base)] ${
              filter === 'favorite'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
            }`}
          >
            Favorites ({pins.filter(p => p.status === 'favorite').length})
          </button>
          <button
            onClick={() => setFilter('want_to_try')}
            className={`px-4 py-2 rounded-full font-medium transition-[var(--transition-base)] ${
              filter === 'want_to_try'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
            }`}
          >
            Want to Try ({pins.filter(p => p.status === 'want_to_try').length})
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl" style={{ color: '#dc2626' }}>
            Error: {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPins.length === 0 && (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 mx-auto mb-4"
              style={{ color: 'var(--color-muted)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <p className="text-xl font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              {filter === 'all' ? 'No pins yet' : `No ${filter === 'favorite' ? 'favorites' : 'want to try'} pins`}
            </p>
            <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
              Start pinning cafés you love or want to visit!
            </p>
            <Link
              href="/cafes"
              className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
            >
              Browse Cafés
            </Link>
          </div>
        )}

        {/* Pinterest-like Masonry Grid */}
        {filteredPins.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filteredPins.map((pin) => {
              if (!pin.business) return null;
              
              const imageUrl = pin.userImageUrl || pin.business.imageUrl;
              
              return (
                <div
                  key={pin.id}
                  className="break-inside-avoid mb-4 bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden shadow-md hover:shadow-lg transition-[var(--transition-smooth)]"
                >
                  {/* Image */}
                  <Link href={`/businesses/${encodeURIComponent(pin.businessId)}`}>
                    <div className="relative w-full aspect-[4/3] bg-[var(--color-surface)] overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={pin.business.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--color-muted)' }}>
                          <svg
                            className="w-16 h-16 opacity-40"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pin.status === 'favorite'
                              ? 'bg-red-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {pin.status === 'favorite' ? '❤️ Favorite' : '📌 Want to Try'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/businesses/${encodeURIComponent(pin.businessId)}`}>
                        <h3 className="font-semibold text-lg line-clamp-2 hover:underline" style={{ color: 'var(--color-text-primary)' }}>
                          {pin.business.name}
                        </h3>
                      </Link>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingPin(pin)}
                          className="p-1 rounded-full hover:bg-[var(--color-surface)] transition-[var(--transition-base)]"
                          title="Edit pin"
                        >
                          <svg
                            className="w-5 h-5"
                            style={{ color: 'var(--color-muted)' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleUnpin(pin.id)}
                          className="p-1 rounded-full hover:bg-[var(--color-surface)] transition-[var(--transition-base)]"
                          title="Remove from board"
                        >
                          <svg
                            className="w-5 h-5"
                            style={{ color: 'var(--color-muted)' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(pin.business.rating)}
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {pin.business.rating.toFixed(1)} ({pin.business.reviewCount})
                      </span>
                    </div>

                    {/* Location */}
                    <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                      {pin.business.city}, {pin.business.state}
                    </p>

                    {/* User Notes */}
                    {pin.userNotes && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border-warm)' }}>
                        <p className="text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>
                          &quot;{pin.userNotes}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Edit Pin Modal */}
      {currentUser && editingPin && (
        <PinEditModal
          isOpen={!!editingPin}
          onClose={() => setEditingPin(null)}
          pin={{
            id: editingPin.id,
            businessId: editingPin.businessId,
            businessName: editingPin.business?.name || 'Unknown',
            status: editingPin.status,
            userNotes: editingPin.userNotes,
            userImageUrl: editingPin.userImageUrl,
          }}
          userId={currentUser.id}
          onSave={() => {
            if (currentUser) {
              loadPins(currentUser.id);
            }
          }}
        />
      )}
    </div>
  );
}

