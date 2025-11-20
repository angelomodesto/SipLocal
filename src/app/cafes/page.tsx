'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Filters from '@/components/Filters';
import BusinessCard from '@/components/BusinessCard';
import type { FilterState } from '@/components/Filters';

export default function CafesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const currentSearch = searchParams.get('search') || '';

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-warm)' }}>
      <Header />
      
      {/* Page Header */}
      <section className="bg-white border-b border-[var(--color-border-warm)] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            All Cafés
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Browse all coffee shops and cafés in the Rio Grande Valley
          </p>
          {currentSearch && (
            <div className="mt-4">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Search results for: <span className="font-semibold">{currentSearch}</span>
              </p>
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
    </div>
  );
}

