'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Filters from '@/components/Filters';
import BusinessCard from '@/components/BusinessCard';
import type { FilterState } from '@/components/Filters';

// Mock data for wireframe implementation
const mockBusinesses = [
  {
    id: '1',
    name: 'The Coffee House',
    imageUrl: null,
    rating: 4.5,
    reviewCount: 52,
    price: '$$',
    categories: [{ alias: 'coffee', title: 'Coffee & Tea' }, { alias: 'cafes', title: 'Cafes' }],
    city: 'McAllen',
    state: 'TX',
    aiSummary: 'A cozy neighborhood cafe known for its artisanal coffee and fresh pastries. Perfect for morning meetings or afternoon study sessions.',
  },
  {
    id: '2',
    name: 'Brew & Bite Cafe',
    imageUrl: null,
    rating: 4.8,
    reviewCount: 127,
    price: '$',
    categories: [{ alias: 'cafes', title: 'Cafes' }, { alias: 'breakfast', title: 'Breakfast & Brunch' }],
    city: 'Brownsville',
    state: 'TX',
    aiSummary: 'Popular local spot serving excellent coffee and breakfast favorites. Known for friendly service and comfortable atmosphere.',
  },
  {
    id: '3',
    name: 'Cafe Del Rio',
    imageUrl: null,
    rating: 4.2,
    reviewCount: 89,
    price: '$$',
    categories: [{ alias: 'coffee', title: 'Coffee & Tea' }],
    city: 'Edinburg',
    state: 'TX',
    aiSummary: 'Modern cafe with a great selection of specialty coffees and light meals. Great WiFi and perfect for remote work.',
  },
  {
    id: '4',
    name: 'Morning Brew',
    imageUrl: null,
    rating: 4.7,
    reviewCount: 203,
    price: '$$',
    categories: [{ alias: 'coffee', title: 'Coffee & Tea' }, { alias: 'bakeries', title: 'Bakeries' }],
    city: 'Harlingen',
    state: 'TX',
    aiSummary: 'Top-rated coffee shop with exceptional pastries and a welcoming vibe. Consistently great coffee and service.',
  },
  {
    id: '5',
    name: 'The Daily Grind',
    imageUrl: null,
    rating: 4.0,
    reviewCount: 45,
    price: '$',
    categories: [{ alias: 'coffee', title: 'Coffee & Tea' }],
    city: 'Weslaco',
    state: 'TX',
    aiSummary: 'Local favorite for quality coffee at affordable prices. Simple and straightforward, no frills coffee experience.',
  },
  {
    id: '6',
    name: 'Artisan Coffee Co.',
    imageUrl: null,
    rating: 4.9,
    reviewCount: 312,
    price: '$$$',
    categories: [{ alias: 'coffee', title: 'Coffee & Tea' }, { alias: 'cafes', title: 'Cafes' }],
    city: 'McAllen',
    state: 'TX',
    aiSummary: 'Premium coffee shop featuring expertly crafted beverages and artisanal treats. Known for latte art and high-quality beans.',
  },
];

export default function Home() {
  const [filteredBusinesses, setFilteredBusinesses] = useState(mockBusinesses);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...mockBusinesses];

    // Apply filters
    if (filters.city) {
      filtered = filtered.filter((b) => b.city === filters.city);
    }
    if (filters.price) {
      filtered = filtered.filter((b) => b.price === filters.price);
    }
    if (filters.rating) {
      filtered = filtered.filter((b) => b.rating >= filters.rating!);
    }
    if (filters.category) {
      filtered = filtered.filter((b) =>
        b.categories.some((cat) => cat.title === filters.category)
      );
    }

    setFilteredBusinesses(filtered);
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

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} {...business} />
          ))}
        </div>

        {/* Empty State */}
        {filteredBusinesses.length === 0 && (
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
