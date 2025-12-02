'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import BusinessCard from '@/components/BusinessCard';

export default function Home() {
  const router = useRouter();
  const [topBusinesses, setTopBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/businesses?top=true', { cache: 'no-store' });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to load businesses');
        setTopBusinesses([]);
      } else {
        setTopBusinesses(json.businesses || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setTopBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopBusinesses();
  }, []);

  const handleSearch = (query: string) => {
    // Redirect to cafes page with search query
    if (query.trim()) {
      router.push(`/cafes?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/cafes');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-warm)' }}>
      <Header />
      <HeroSection onSearch={handleSearch} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Cafés of the Week
            </h2>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Top-rated local coffee spots you'll love
            </p>
          </div>
          <Link
            href="/cafes"
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium shadow-sm hover:shadow-md"
          >
            View All Cafés →
          </Link>
        </div>

        {/* Loading/Error */}
        {loading && (
          <div className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>Loading top cafés...</div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl" style={{ color: '#dc2626' }}>
            Error: {error}
          </div>
        )}

        {/* Top Business Cards Grid */}
        {!loading && !error && topBusinesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {topBusinesses.map((business) => (
              <BusinessCard key={business.id} {...business} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && topBusinesses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>No cafés found.</p>
            <Link
              href="/cafes"
              className="mt-4 inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
            >
              Browse All Cafés
            </Link>
          </div>
        )}

        {/* Call to Action */}
        {!loading && !error && topBusinesses.length > 0 && (
          <div className="text-center py-12 border-t border-[var(--color-border-warm)] mt-12">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Want to see more?
            </h3>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Explore our complete collection of local cafés and coffee shops
            </p>
            <Link
              href="/cafes"
              className="inline-block px-8 py-4 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium shadow-sm hover:shadow-md text-lg"
            >
              Browse All Cafés
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[var(--color-border-warm)] mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
            <p>&copy; 2024 SipLocal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
