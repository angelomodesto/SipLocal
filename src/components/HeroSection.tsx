'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  onQuickFilter?: (filter: string) => void;
}

export default function HeroSection({ onSearch, onQuickFilter }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [carouselPhotos, setCarouselPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const quickFilters = [
    { id: 'cozy', label: '☕ Cozy', emoji: '☕' },
    { id: 'study', label: '🧑‍💻 Study-Friendly', emoji: '🧑‍💻' },
    { id: 'late', label: '🌙 Open Late', emoji: '🌙' },
    { id: 'wifi', label: '📶 Good Wi-Fi', emoji: '📶' },
    { id: 'pastries', label: '🍩 Pastries', emoji: '🍩' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    // TODO: Wire up search functionality
  };

  const handleQuickFilter = (filterId: string) => {
    const newActive = activeFilter === filterId ? null : filterId;
    setActiveFilter(newActive);
    onQuickFilter?.(newActive || '');
    // TODO: Wire up quick filter functionality to existing filter system
  };

  // Fetch business photos for carousel
  useEffect(() => {
    const fetchBusinessPhotos = async () => {
      try {
        // Fetch businesses to get photos for carousel
        const res = await fetch('/api/businesses?limit=30', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.businesses) {
          // Collect all imageUrl from businesses (filter out duplicates)
          const allPhotos: string[] = [];
          json.businesses.forEach((business: any) => {
            if (business.imageUrl && !allPhotos.includes(business.imageUrl)) {
              allPhotos.push(business.imageUrl);
            }
          });
          
          // Shuffle and use all available photos (or limit to 15)
          const shuffled = allPhotos.sort(() => Math.random() - 0.5).slice(0, 15);
          if (shuffled.length > 0) {
            setCarouselPhotos(shuffled);
          }
        }
      } catch (error) {
        console.error('Error fetching business photos for carousel:', error);
      }
    };

    fetchBusinessPhotos();
  }, []);

  // Auto-rotate carousel every 5.5 seconds
  useEffect(() => {
    if (carouselPhotos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % carouselPhotos.length);
    }, 5500); // 5.5 seconds

    return () => clearInterval(interval);
  }, [carouselPhotos.length]);

  return (
    <section 
      className="w-full py-12 md:py-16 lg:py-20 hero-grain"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Heading & Search */}
          <div className="space-y-6">
            {/* Heading */}
            <div className="space-y-3">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight"
                style={{ color: 'var(--color-primary-dark)' }}
              >
                Find your next favorite café
              </h1>
              <p 
                className="text-lg md:text-xl"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Discover local coffee spots curated just for you.
              </p>
            </div>

            {/* Large Search Bar */}
            <form onSubmit={handleSearch} className="w-full" id="hero-search">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search coffee shops, cafes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 pr-6 text-lg border rounded-2xl focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] bg-white shadow-md"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border-muted)',
                  }}
                />
                <svg
                  className="absolute left-5 top-4 h-6 w-6"
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
              </div>
            </form>

            {/* Quick-Filter Pills */}
            <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleQuickFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-[var(--transition-base)] whitespace-nowrap ${
                    activeFilter === filter.id
                      ? 'shadow-md'
                      : 'shadow-sm hover:shadow-md'
                  }`}
                  style={{
                    background: activeFilter === filter.id 
                      ? 'var(--color-primary)' 
                      : 'var(--color-surface)',
                    color: activeFilter === filter.id 
                      ? 'white' 
                      : 'var(--color-muted)',
                    border: activeFilter === filter.id 
                      ? 'none' 
                      : `1px solid var(--color-border-warm)`,
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Photo Carousel */}
          <div className="relative hidden lg:block">
            <div 
              className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-lg hero-grain"
              style={{ background: 'var(--color-surface)' }}
            >
              {carouselPhotos.length > 0 ? (
                <>
                  {/* Photo Carousel */}
                  {carouselPhotos.map((photo, index) => (
                    <div
                      key={photo}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentPhotoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <Image
                        src={photo}
                        alt="Coffee shop"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 0vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                  
                  {/* Warm gradient overlay */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-dark)]/20 via-[var(--color-primary)]/10 to-transparent z-20 pointer-events-none"
                  />
                  
                  {/* Subtle vignette overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background: 'radial-gradient(circle at center, transparent 0%, rgba(115, 47, 36, 0.08) 100%)',
                    }}
                  />

                  {/* Carousel indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                    {carouselPhotos.slice(0, 5).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentPhotoIndex % 5
                            ? 'w-8 bg-white'
                            : 'w-2 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Fallback when no photos available */
                <>
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-dark)]/20 via-[var(--color-primary)]/10 to-[var(--color-surface)]"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(115, 47, 36, 0.15) 0%, rgba(180, 84, 39, 0.1) 50%, rgba(249, 227, 203, 0.8) 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div 
                        className="text-8xl opacity-30"
                        style={{ color: 'var(--color-primary-dark)' }}
                      >
                        ☕
                      </div>
                      <p 
                        className="text-lg font-medium opacity-60"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Your perfect spot awaits
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

