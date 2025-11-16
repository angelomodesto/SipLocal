'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Filters from '@/components/Filters';
import BusinessCard from '@/components/BusinessCard';
import type { FilterState } from '@/components/Filters';

export default function Home() {
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async (filters?: FilterState) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.city) params.set('city', filters.city);
      if (filters?.price) params.set('price', filters.price);
      if (filters?.rating) params.set('rating', String(filters.rating));
      if (filters?.category) params.set('category', filters.category);
      params.set('limit', '60');

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
    // initial load
    fetchBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    fetchBusinesses(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Filters onFilterChange={handleFilterChange} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredBusinesses.length} Coffee Shops & Cafes
          </h2>
          <p className="text-gray-600 mt-1">Find the perfect spot for your next cup</p>
        </div>

        {/* Loading/Error */}
        {loading && (
          <div className="text-gray-600 mb-6">Loading businesses...</div>
        )}
        {error && (
          <div className="mb-6 text-red-700">Error: {error}</div>
        )}

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} {...business} />
          ))}
        </div>

        {/* Empty State */}
        {!loading && !error && filteredBusinesses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No businesses found matching your filters.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 SipLocal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
