'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { authenticatedFetch } from '@/lib/apiClient';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string | null;
    content: string;
    photos: string[] | null;
  } | null;
  onSuccess: () => void;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  existingReview,
  onSuccess,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;
  const minContentLength = 10;
  const maxContentLength = 5000;
  const maxTitleLength = 100;

  useEffect(() => {
    if (isOpen && existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title || '');
      setContent(existingReview.content);
    } else if (isOpen && !existingReview) {
      // Reset form for new review
      setRating(0);
      setTitle('');
      setContent('');
    }
    setError(null);
  }, [isOpen, existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (content.length < minContentLength) {
      setError(`Review content must be at least ${minContentLength} characters`);
      return;
    }

    if (content.length > maxContentLength) {
      setError(`Review content must be less than ${maxContentLength} characters`);
      return;
    }

    if (title.length > maxTitleLength) {
      setError(`Title must be less than ${maxTitleLength} characters`);
      return;
    }

    setSubmitting(true);

    try {
      const url = isEditing
        ? `/api/reviews/${existingReview.id}`
        : '/api/reviews';

      const method = isEditing ? 'PATCH' : 'POST';

      const body = {
        ...(isEditing ? {} : { businessId }),
        rating,
        title: title.trim() || null,
        content: content.trim(),
        photos: null, // TODO: Add photo upload later
      };

      const res = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to submit review');
        setSubmitting(false);
        return;
      }

      // Success - refresh reviews first, then close modal
      try {
        await onSuccess();
        // Small delay to ensure database commit is complete
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (refreshError) {
        console.error('Error refreshing reviews:', refreshError);
        // Still close modal even if refresh fails - the review was created
      } finally {
        setSubmitting(false);
        onClose();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An error occurred while submitting your review');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid var(--color-border-warm)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[var(--color-border-warm)] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-2xl leading-none hover:opacity-70 transition-opacity disabled:opacity-50"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Business Name */}
          <div>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Reviewing
            </p>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {businessName}
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block mb-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Rating <span className="text-red-500">*</span>
            </label>
            <StarRating rating={rating} onRatingChange={setRating} readonly={false} size="lg" />
            {rating === 0 && (
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                Please select a rating
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block mb-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={maxTitleLength}
              placeholder="Give your review a title"
              className="w-full px-4 py-2 rounded-xl border transition-[var(--transition-base)]"
              style={{
                borderColor: 'var(--color-border-warm)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-surface)',
              }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-muted)' }}>
              {title.length}/{maxTitleLength}
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block mb-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minLength={minContentLength}
              maxLength={maxContentLength}
              rows={6}
              placeholder="Share your experience with this business..."
              required
              className="w-full px-4 py-2 rounded-xl border transition-[var(--transition-base)] resize-none"
              style={{
                borderColor: 'var(--color-border-warm)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-surface)',
              }}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Minimum {minContentLength} characters
              </p>
              <p
                className={`text-xs ${
                  content.length < minContentLength || content.length > maxContentLength
                    ? 'text-red-500'
                    : ''
                }`}
                style={{
                  color:
                    content.length < minContentLength || content.length > maxContentLength
                      ? 'var(--color-error)'
                      : 'var(--color-muted)',
                }}
              >
                {content.length}/{maxContentLength}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-xl"
              style={{ background: 'var(--color-error)', color: 'white' }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-[var(--transition-base)] disabled:opacity-50"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0 || content.length < minContentLength}
              className="flex-1 px-6 py-3 rounded-xl font-medium text-white transition-[var(--transition-base)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: submitting ? 'var(--color-muted)' : 'var(--color-primary)',
              }}
            >
              {submitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

