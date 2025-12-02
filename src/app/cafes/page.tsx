'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Filters from '@/components/Filters';
import BusinessCard from '@/components/BusinessCard';
import type { FilterState } from '@/components/Filters';

function CafesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const fetchBusinesses = async (filters?: FilterState, searchQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.city) params.set('city', filters.city);
      if (filters?.price) params.set('price', filters.price);
      if (filters?.rating) params.set('rating', String(filters.rating));
      if (filters?.category) params.set('category', filters.category);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100'); // Show more on the cafes page

      const res = await fetch(`/api/businesses?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to load businesses');
        setFilteredBusinesses([]);
      } else {
        setFilteredBusinesses(json.businesses || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setFilteredBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get search query from URL params
    const searchQuery = searchParams.get('search') || '';
    
    // Initial load with URL params
    const filters: FilterState = {
      city: searchParams.get('city') || null,
      price: searchParams.get('price') || null,
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : null,
      category: searchParams.get('category') || null,
    };
    
    fetchBusinesses(filters, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFilterChange = (filters: FilterState) => {
    // Update URL params with filters
    const params = new URLSearchParams(searchParams.toString());
    
    if (filters.city) {
      params.set('city', filters.city);
    } else {
      params.delete('city');
    }
    
    if (filters.price) {
      params.set('price', filters.price);
    } else {
      params.delete('price');
    }
    
    if (filters.rating) {
      params.set('rating', String(filters.rating));
    } else {
      params.delete('rating');
    }
    
    if (filters.category) {
      params.set('category', filters.category);
    } else {
      params.delete('category');
    }
    
    router.push(`/cafes?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    
    router.push(`/cafes?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/cafes?${params.toString()}`);
  };

  const currentSearch = searchParams.get('search') || '';

  // Sync search query with URL params
  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  return (
    <>
      {/* Page Header */}
      <section className="bg-white border-b border-[var(--color-border-warm)] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            All Cafés
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Browse all coffee shops and cafés in the Rio Grande Valley
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search coffee shops, cafes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 pl-14 pr-12 text-base border rounded-2xl focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] bg-white shadow-sm"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border-muted)',
                }}
              />
              <svg
                className="absolute left-5 top-3.5 h-5 w-5"
                style={{ color: 'var(--color-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-3.5 p-1 rounded-full hover:bg-[var(--color-surface)] transition-[var(--transition-base)]"
                  aria-label="Clear search"
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
              )}
            </div>
          </form>
          
          {currentSearch && (
            <div className="mt-4 flex items-center gap-2">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Search results for: <span className="font-semibold">{currentSearch}</span>
              </p>
              <button
                onClick={handleClearSearch}
                className="text-sm underline hover:no-underline transition-[var(--transition-base)]"
                style={{ color: 'var(--color-primary)' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </section>

      <Filters 
        onFilterChange={handleFilterChange}
        initialFilters={{
          city: searchParams.get('city') || null,
          price: searchParams.get('price') || null,
          rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : null,
          category: searchParams.get('category') || null,
        }}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'Coffee Shop' : 'Coffee Shops'} & Cafés
          </h2>
          {currentSearch && (
            <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Matching &quot;{currentSearch}&quot;
            </p>
          )}
        </div>

        {/* Loading/Error */}
        {loading && (
          <div className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>Loading cafés...</div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl" style={{ color: '#dc2626' }}>
            Error: {error}
          </div>
        )}

        {/* Business Cards Grid */}
        {!loading && !error && filteredBusinesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.id} {...business} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBusinesses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              No cafés found {currentSearch ? `matching &quot;${currentSearch}&quot;` : 'matching your filters'}.
            </p>
            <p className="mt-2" style={{ color: 'var(--color-muted)' }}>
              Try adjusting your search criteria or filters.
            </p>
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
    </>
  );
}

export default function CafesPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background-warm)' }}>
      <Header />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
        </div>
      }>
        <CafesContent />
      </Suspense>
    </div>
  );
}

