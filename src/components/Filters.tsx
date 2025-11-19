'use client';

import { useState } from 'react';

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void;
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

export default function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    city: null,
    price: null,
    rating: null,
    category: null,
  });

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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>City:</label>
            <select
              value={filters.city || ''}
              className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] bg-white text-sm font-medium"
              style={{ 
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-muted)',
              }}
              onChange={(e) => updateFilter('city', e.target.value)}
            >
              {CITIES.map((city) => (
                <option key={city} value={city === 'All Cities' ? '' : city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>Price:</label>
            <select
              value={filters.price || ''}
              className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] bg-white text-sm font-medium"
              style={{ 
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-muted)',
              }}
              onChange={(e) => updateFilter('price', e.target.value)}
            >
              {PRICE_RANGES.map((price) => (
                <option key={price} value={price === 'All Prices' ? '' : price}>
                  {price}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>Rating:</label>
            <select
              value={filters.rating ?? ''}
              className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] bg-white text-sm font-medium"
              style={{ 
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-muted)',
              }}
              onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : null)}
            >
              {RATING_FILTERS.map((filter) => (
                <option key={filter.label} value={filter.value ?? ''}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>Category:</label>
            <select
              value={filters.category || ''}
              className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] bg-white text-sm font-medium"
              style={{ 
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-muted)',
              }}
              onChange={(e) => updateFilter('category', e.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category === 'All Categories' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
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

