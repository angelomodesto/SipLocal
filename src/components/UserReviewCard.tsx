'use client';

import Image from 'next/image';
import StarRating from './StarRating';

interface UserReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string | null;
    content: string;
    created_at: string;
    updated_at?: string;
    helpful_count: number;
    profiles: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      email: string | null;
    } | null;
  };
  currentUserId?: string | null;
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
  onHelpful?: (reviewId: string) => void;
  hasVotedHelpful?: boolean;
}

export default function UserReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onHelpful,
  hasVotedHelpful = false,
}: UserReviewCardProps) {
  const isOwnReview = currentUserId && review.profiles?.id === currentUserId;
  const isEdited = review.updated_at && review.updated_at !== review.created_at;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const displayName = review.profiles?.full_name || review.profiles?.email?.split('@')[0] || 'Anonymous';

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] p-6 shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.profiles?.avatar_url ? (
            <Image
              src={review.profiles.avatar_url}
              alt={displayName}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg font-medium">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {displayName}
            </div>
            <div className="text-sm flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
              <span>{formatDate(review.created_at)}</span>
              {isEdited && <span>• Edited</span>}
            </div>
          </div>
        </div>

        {/* Actions for own review */}
        {isOwnReview && (onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="text-sm px-3 py-1.5 rounded-lg transition-[var(--transition-base)] hover:opacity-80"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this review?')) {
                    onDelete(review.id);
                  }
                }}
                className="text-sm px-3 py-1.5 rounded-lg transition-[var(--transition-base)] hover:opacity-80"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-error)',
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} readonly={true} size="md" />
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {review.title}
        </h4>
      )}

      {/* Content */}
      <p className="mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {review.content}
      </p>

      {/* Helpful Button */}
      {onHelpful && !isOwnReview && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onHelpful(review.id)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-[var(--transition-base)] ${
              hasVotedHelpful ? 'opacity-100' : 'hover:opacity-80'
            }`}
            style={{
              background: hasVotedHelpful ? 'var(--color-primary)' : 'var(--color-surface)',
              color: hasVotedHelpful ? 'white' : 'var(--color-text-primary)',
            }}
          >
            {hasVotedHelpful ? '✓ Helpful' : 'Helpful'}
          </button>
          {review.helpful_count > 0 && (
            <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
              ({review.helpful_count})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

