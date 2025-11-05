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
          <span key={i} className="text-yellow-400">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-gray-300">
            ★
          </span>
        ))}
      </div>
    );
  };

  // Format categories
  const categoryTitles = categories.map((cat) => cat.title).join(', ');

  return (
    <Link href={`/businesses/${id}`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Image Section */}
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
              <svg
                className="w-16 h-16 text-gray-300"
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
        <div className="p-4">
          {/* Business Name */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
            {name}
          </h3>

          {/* Rating and Review Count */}
          <div className="flex items-center gap-2 mb-2">
            {renderStars(rating)}
            <span className="text-sm text-gray-600">
              {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>

          {/* Price and Categories */}
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
            {price && <span className="font-medium">{price}</span>}
            {price && categoryTitles && <span>•</span>}
            <span className="line-clamp-1">{categoryTitles}</span>
          </div>

          {/* Location */}
          <div className="text-sm text-gray-500 mb-2">
            {city}, {state}
          </div>

          {/* AI Summary Snippet */}
          {aiSummary && (
            <p className="text-sm text-gray-700 line-clamp-2 mt-2">
              {aiSummary}
            </p>
          )}

          {/* View Details Button */}
          <div className="mt-4">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

