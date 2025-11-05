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
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* City Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">City:</label>
            <select
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="text-sm font-medium text-gray-700">Price:</label>
            <select
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="text-sm font-medium text-gray-700">Rating:</label>
            <select
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => updateFilter('category', e.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category === 'All Categories' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filters.city || filters.price || filters.rating || filters.category) && (
            <button
              onClick={() => {
                const cleared = { city: null, price: null, rating: null, category: null };
                setFilters(cleared);
                onFilterChange?.(cleared);
              }}
              className="px-4 py-1.5 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

