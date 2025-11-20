'use client';

import { useState, useEffect } from 'react';

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  city: string | null;
  price: string | null;
  rating: number | null;
  category: string | null;
}

const CITIES = [
  'All Cities',
  'Brownsville',
  'Harlingen',
  'McAllen',
  'Edinburg',
  'Weslaco',
  'Mission',
  'San Benito',
  'Pharr',
];

const PRICE_RANGES = ['All Prices', '$', '$$', '$$$', '$$$$'];

const RATING_FILTERS = [
  { label: 'All Ratings', value: null },
  { label: '4+ Stars', value: 4 },
  { label: '3+ Stars', value: 3 },
  { label: '2+ Stars', value: 2 },
];

const CATEGORIES = [
  'All Categories',
  'Coffee & Tea',
  'Cafes',
  'Bakeries',
  'Breakfast & Brunch',
];

export default function Filters({ onFilterChange, initialFilters }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      city: null,
      price: null,
      rating: null,
      category: null,
    }
  );

  // Sync filters with initialFilters when they change (e.g., from URL params)
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const updateFilter = (key: keyof FilterState, value: string | number | null) => {
    const newFilters = {
      ...filters,
      [key]: value === 'All Cities' || value === 'All Prices' || value === 'All Categories' 
        ? null 
        : value,
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="bg-white border-b border-[var(--color-border-warm)] py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* City Filter */}
          <div className="relative">
            <select
              value={filters.city || ''}
              className="appearance-none px-5 py-2.5 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] text-sm font-medium cursor-pointer hover:shadow-md"
              style={{ 
                color: filters.city ? 'var(--color-text-primary)' : 'var(--color-muted)',
                borderColor: filters.city ? 'var(--color-primary)' : 'var(--color-border-muted)',
                background: filters.city ? 'var(--color-surface)' : 'white',
              }}
              onChange={(e) => updateFilter('city', e.target.value)}
            >
              <option value="" style={{ color: 'var(--color-muted)' }}>All Cities</option>
              {CITIES.filter(city => city !== 'All Cities').map((city) => (
                <option key={city} value={city} style={{ color: 'var(--color-text-primary)' }}>
                  {city}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4"
                style={{ color: 'var(--color-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Price Filter */}
          <div className="relative">
            <select
              value={filters.price || ''}
              className="appearance-none px-5 py-2.5 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] text-sm font-medium cursor-pointer hover:shadow-md"
              style={{ 
                color: filters.price ? 'var(--color-text-primary)' : 'var(--color-muted)',
                borderColor: filters.price ? 'var(--color-primary)' : 'var(--color-border-muted)',
                background: filters.price ? 'var(--color-surface)' : 'white',
              }}
              onChange={(e) => updateFilter('price', e.target.value)}
            >
              <option value="" style={{ color: 'var(--color-muted)' }}>All Prices</option>
              {PRICE_RANGES.filter(price => price !== 'All Prices').map((price) => (
                <option key={price} value={price} style={{ color: 'var(--color-text-primary)' }}>
                  {price}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4"
                style={{ color: 'var(--color-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <select
              value={filters.rating ?? ''}
              className="appearance-none px-5 py-2.5 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] text-sm font-medium cursor-pointer hover:shadow-md"
              style={{ 
                color: filters.rating ? 'var(--color-text-primary)' : 'var(--color-muted)',
                borderColor: filters.rating ? 'var(--color-primary)' : 'var(--color-border-muted)',
                background: filters.rating ? 'var(--color-surface)' : 'white',
              }}
              onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="" style={{ color: 'var(--color-muted)' }}>All Ratings</option>
              {RATING_FILTERS.filter(filter => filter.value !== null).map((filter) => (
                <option key={filter.label} value={filter.value ?? ''} style={{ color: 'var(--color-text-primary)' }}>
                  {filter.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4"
                style={{ color: 'var(--color-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={filters.category || ''}
              className="appearance-none px-5 py-2.5 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] text-sm font-medium cursor-pointer hover:shadow-md"
              style={{ 
                color: filters.category ? 'var(--color-text-primary)' : 'var(--color-muted)',
                borderColor: filters.category ? 'var(--color-primary)' : 'var(--color-border-muted)',
                background: filters.category ? 'var(--color-surface)' : 'white',
              }}
              onChange={(e) => updateFilter('category', e.target.value)}
            >
              <option value="" style={{ color: 'var(--color-muted)' }}>All Categories</option>
              {CATEGORIES.filter(category => category !== 'All Categories').map((category) => (
                <option key={category} value={category} style={{ color: 'var(--color-text-primary)' }}>
                  {category}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4"
                style={{ color: 'var(--color-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Active Filters as Pills */}
          <div className="flex flex-wrap gap-2 items-center ml-2">
            {filters.city && (
              <span className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium">
                {filters.city}
              </span>
            )}
            {filters.price && (
              <span className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium">
                {filters.price}
              </span>
            )}
            {filters.rating && (
              <span className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium">
                {filters.rating}+ Stars
              </span>
            )}
            {filters.category && (
              <span className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium">
                {filters.category}
              </span>
            )}
          </div>

          {/* Clear Filters Button */}
          {(filters.city || filters.price || filters.rating || filters.category) && (
            <button
              onClick={() => {
                const cleared = { city: null, price: null, rating: null, category: null };
                setFilters(cleared);
                onFilterChange?.(cleared);
              }}
              className="px-4 py-1.5 text-sm text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] underline font-medium transition-[var(--transition-base)]"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

