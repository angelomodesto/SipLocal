'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

type Business = {
  id: string;
  name: string;
  photos: string[];
  rating: number;
  reviewCount: number;
  price: string | null;
  categories: Array<{ alias: string; title: string }>;
  city: string;
  state: string;
  address?: string;
  phone?: string;
  aiSummary?: string | null;
};

export default function BusinessDetailPage() {
  const params = useParams();
  const businessId = params?.id as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/businesses/${businessId}`, { cache: 'no-store' });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || 'Business not found');
          setBusiness(null);
        } else {
          setBusiness(json.business as Business);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    };
    if (businessId) fetchBusiness();
  }, [businessId]);

  // If business not found, show 404
  if (!loading && (!business || error)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Not Found</h1>
            <p className="text-gray-600 mb-8">The business you're looking for doesn't exist.</p>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (loading || !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <p className="text-gray-600">Loading business...</p>
        </main>
      </div>
    );
  }

  // Generate star rating display
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const starSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl';

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className={`text-yellow-400 ${starSize}`}>
            ★
          </span>
        ))}
        {hasHalfStar && <span className={`text-yellow-400 ${starSize}`}>☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className={`text-gray-300 ${starSize}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const categoryTitles = business.categories.map((cat) => cat.title).join(', ');

  // Google Maps URL - will use actual address when available
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address || `${business.city}, ${business.state}`)}`;

  // Handle actions
  const handleGetDirections = () => {
    window.open(mapsUrl, '_blank');
  };

  const handleCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone}`;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.aiSummary,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Results
        </Link>

        {/* Two-column layout on desktop, single column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Main Image */}
              <div className="relative w-full h-96 bg-gray-200 overflow-hidden">
                {business.photos && business.photos[selectedImageIndex] ? (
                  <Image
                    src={business.photos[selectedImageIndex]}
                    alt={business.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                    <svg
                      className="w-24 h-24 text-gray-300"
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
              </div>

              {/* Thumbnail Grid */}
              {business.photos && business.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                  {business.photos.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={`${business.name} image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 25vw, 16vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <svg
                            className="w-8 h-8 text-gray-400"
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
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Name and Rating */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{business.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {renderStars(business.rating, 'lg')}
                <span className="text-xl text-gray-700">
                  {business.rating.toFixed(1)} ({business.reviewCount} reviews)
                </span>
                {business.price && (
                  <span className="text-xl font-medium text-gray-900">{business.price}</span>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {business.categories.map((category) => (
                  <span
                    key={category.alias}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {category.title}
                  </span>
                ))}
              </div>

              {/* Location */}
              <div className="text-gray-600">
                <span className="inline-flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {business.city}, {business.state}
                </span>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{business.aiSummary}</p>
            </div>

            {/* Reviews Placeholder */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reviews</h2>
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">Reviews Coming Soon</p>
                <p className="text-gray-400 mt-2">Check back later for customer reviews and ratings</p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24 space-y-4">
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGetDirections}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Get Directions
                </button>

                {business.phone && (
                  <button
                    onClick={handleCall}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Call {business.phone}
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Location Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Location</h3>
                {business.address ? (
                  <p className="text-gray-600 text-sm">{business.address}</p>
                ) : (
                  <p className="text-gray-600 text-sm">{business.city}, {business.state}</p>
                )}

                <button
                  onClick={handleGetDirections}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Open in Google Maps
                </button>
              </div>

              {/* Categories */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {business.categories.map((category) => (
                    <span
                      key={category.alias}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {category.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

