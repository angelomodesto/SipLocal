import Image from 'next/image';
import Link from 'next/link';

interface BusinessCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
  price: string | null;
  categories: Array<{ alias: string; title: string }>;
  city: string;
  state: string;
  aiSummary?: string;
}

export default function BusinessCard({
  id,
  name,
  imageUrl,
  rating,
  reviewCount,
  price,
  categories,
  city,
  state,
  aiSummary,
}: BusinessCardProps) {
  // Generate star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} style={{ color: 'var(--color-primary)' }}>
            ★
          </span>
        ))}
        {hasHalfStar && <span style={{ color: 'var(--color-primary)' }}>☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} style={{ color: 'var(--color-border)' }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  // Format categories
  const categoryTitles = categories.map((cat) => cat.title).join(', ');

  return (
    <Link href={`/businesses/${encodeURIComponent(id)}`} className="block">
      <div className="group bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-[var(--transition-smooth)] cursor-pointer" style={{ boxShadow: 'var(--shadow-md)' }}>
        {/* Image Section with Warm Overlay on Hover */}
        <div className="relative w-full h-48 bg-[var(--color-surface)] overflow-hidden">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover transition-[var(--transition-smooth)] group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Subtle warm overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-dark)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-[var(--transition-smooth)] pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--color-muted)' }}>
              <svg
                className="w-16 h-16 opacity-40"
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

        {/* Business Info */}
        <div className="p-5">
          {/* Business Name */}
          <h3 className="text-xl font-semibold mb-2 line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>
            {name}
          </h3>

          {/* Rating and Review Count */}
          <div className="flex items-center gap-2 mb-2">
            {renderStars(rating)}
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>

          {/* Price and Categories */}
          <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {price && <span className="font-medium">{price}</span>}
            {price && categoryTitles && <span>•</span>}
            <span className="line-clamp-1">{categoryTitles}</span>
          </div>

          {/* Location */}
          <div className="text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
            {city}, {state}
          </div>

          {/* AI Summary Snippet */}
          {aiSummary && (
            <p className="text-sm line-clamp-2 mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              {aiSummary}
            </p>
          )}

          {/* View Details CTA - Styled as button but not actually a button to avoid blocking link */}
          <div className="mt-4">
            <div className="w-full px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl transition-[var(--transition-base)] font-medium shadow-sm text-center group-hover:bg-[var(--color-primary-dark)] group-hover:shadow-md">
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

