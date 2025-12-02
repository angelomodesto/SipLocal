'use client';

import Image from 'next/image';
import Link from 'next/link';

interface YelpReviewCardProps {
  review: {
    id: string;
    rating: number;
    content: string;
    yelp_user_name: string;
    yelp_user_avatar_url: string | null;
    yelp_url: string;
    created_at: string;
  };
}

export default function YelpReviewCard({ review }: YelpReviewCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className="text-yellow-500 text-lg">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500 text-lg">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-gray-300 text-lg">★</span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] p-6 shadow-md">
      {/* Header with Yelp branding */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.yelp_user_avatar_url ? (
            <Image
              src={review.yelp_user_avatar_url}
              alt={review.yelp_user_name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg font-medium">
                {review.yelp_user_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {review.yelp_user_name}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-muted)' }}>
              via Yelp
            </div>
          </div>
        </div>
        {/* Yelp Logo - Link to Yelp */}
        <Link
          href={review.yelp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          aria-label="View on Yelp"
        >
          <svg
            className="w-16 h-6"
            viewBox="0 0 100 20"
            fill="#D32323"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.5 2.5h-2.5v15h2.5V2.5zm5 0h-2.5v15h2.5V2.5zm5 0h-2.5v15h2.5V2.5zm5 0h-2.5v15h2.5V2.5zm5 0h-2.5v15h2.5V2.5zm5 0h-2.5v15h2.5V2.5zm5 0h-2.5v15h2.5V2.5z"/>
          </svg>
        </Link>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        {renderStars(review.rating)}
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {formatDate(review.created_at)}
        </span>
      </div>

      {/* Review Content */}
      <p className="mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {review.content}
      </p>

      {/* Link to Yelp */}
      <Link
        href={review.yelp_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium inline-flex items-center gap-1 hover:underline transition-[var(--transition-base)]"
        style={{ color: 'var(--color-primary)' }}
      >
        Read full review on Yelp
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </Link>
    </div>
  );
}

