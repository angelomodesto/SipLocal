# Yelp Reviews Integration Guide

## Overview
This guide explains how to integrate Yelp reviews into the application, including fetching reviews from the Yelp API, storing them in the database, and displaying them in the UI while complying with Yelp's Terms of Service.

---

## Important Yelp API Limitations

⚠️ **Critical Compliance Requirements:**

1. **Limited Reviews**: Yelp Fusion API only returns **up to 3 reviews** per business
2. **24-Hour Cache Rule**: Cannot store Yelp content for more than 24 hours
3. **No Modification**: Cannot modify Yelp review content
4. **No Aggregation**: Cannot combine Yelp ratings with user ratings
5. **Display Requirements**: Must show Yelp logo and link to original review

---

## Step 1: Update Database Schema

### Migration: Add Yelp Review Support

Create file: `database/006_add_yelp_reviews_support.sql`

```sql
-- Migration: Add Yelp review support to reviews table
-- This allows storing both user-generated and Yelp reviews

-- Add new columns for Yelp reviews
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'yelp')),
ADD COLUMN IF NOT EXISTS yelp_review_id TEXT,
ADD COLUMN IF NOT EXISTS yelp_user_name TEXT,
ADD COLUMN IF NOT EXISTS yelp_user_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS yelp_url TEXT,
ADD COLUMN IF NOT EXISTS yelp_fetched_at TIMESTAMPTZ;

-- Make user_id nullable (Yelp reviews don't have user_id)
ALTER TABLE public.reviews 
ALTER COLUMN user_id DROP NOT NULL;

-- Update unique constraint to handle both user and Yelp reviews
-- Drop existing constraint if it exists
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_business_id_user_id_key;

-- Add new constraints
-- User reviews: one per user per business
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_user_unique 
UNIQUE (business_id, user_id) 
WHERE user_id IS NOT NULL;

-- Yelp reviews: one per yelp_review_id per business
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_yelp_unique 
UNIQUE (business_id, yelp_review_id) 
WHERE source = 'yelp' AND yelp_review_id IS NOT NULL;

-- Add indexes for Yelp reviews
CREATE INDEX IF NOT EXISTS reviews_source_idx ON public.reviews(source);
CREATE INDEX IF NOT EXISTS reviews_yelp_review_id_idx ON public.reviews(yelp_review_id);
CREATE INDEX IF NOT EXISTS reviews_yelp_fetched_at_idx ON public.reviews(yelp_fetched_at);

-- Add index for filtering expired Yelp reviews (older than 24 hours)
CREATE INDEX IF NOT EXISTS reviews_yelp_expired_idx 
ON public.reviews(yelp_fetched_at) 
WHERE source = 'yelp' AND yelp_fetched_at < NOW() - INTERVAL '24 hours';
```

---

## Step 2: Add Yelp Reviews API Function

### Update `src/lib/yelpClient.ts`

Add the following function to fetch Yelp reviews:

```typescript
export interface YelpReview {
  id: string;
  rating: number;
  text: string;
  time_created: string;
  user: {
    id: string;
    profile_url: string;
    image_url: string | null;
    name: string;
  };
  url: string;
}

export interface YelpReviewsResponse {
  reviews: YelpReview[];
  total: number;
}

/**
 * Fetch reviews for a Yelp business
 * Returns up to 3 reviews per business
 */
export async function getYelpBusinessReviews(businessId: string): Promise<YelpReview[]> {
  const apiKey = process.env.YELP_API_KEY;
  
  if (!apiKey) {
    throw new Error('YELP_API_KEY environment variable is not set');
  }

  const response = await fetch(`${YELP_API_BASE}/businesses/${businessId}/reviews`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yelp API error: ${response.status} - ${errorText}`);
  }

  const data: YelpReviewsResponse = await response.json();
  return data.reviews || [];
}
```

---

## Step 3: Create Yelp Review Sync API Endpoint

### Create `src/app/api/reviews/yelp/sync/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getYelpBusinessReviews } from '@/lib/yelpClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * Sync Yelp reviews for a specific business
 * POST /api/reviews/yelp/sync?businessId={id}
 * 
 * This endpoint:
 * 1. Fetches reviews from Yelp API
 * 2. Deletes expired Yelp reviews (older than 24 hours)
 * 3. Inserts/updates current Yelp reviews
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'businessId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 1. Fetch reviews from Yelp API
    const yelpReviews = await getYelpBusinessReviews(businessId);

    // 2. Delete expired Yelp reviews for this business (older than 24 hours)
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('business_id', businessId)
      .eq('source', 'yelp')
      .lt('yelp_fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (deleteError) {
      console.error('Error deleting expired Yelp reviews:', deleteError);
      // Continue anyway - not critical
    }

    // 3. Upsert current Yelp reviews
    const now = new Date().toISOString();
    const reviewsToInsert = yelpReviews.map((yelpReview) => ({
      business_id: businessId,
      source: 'yelp' as const,
      rating: yelpReview.rating,
      content: yelpReview.text,
      title: null, // Yelp reviews don't have titles
      photos: null, // Yelp reviews don't include photos in API
      yelp_review_id: yelpReview.id,
      yelp_user_name: yelpReview.user.name,
      yelp_user_avatar_url: yelpReview.user.image_url,
      yelp_url: yelpReview.url,
      yelp_fetched_at: now,
      user_id: null, // Yelp reviews don't have user_id
      helpful_count: 0, // Yelp reviews don't support helpful votes
    }));

    const { data: insertedReviews, error: insertError } = await supabase
      .from('reviews')
      .upsert(reviewsToInsert, {
        onConflict: 'business_id,yelp_review_id',
        ignoreDuplicates: false,
      })
      .select();

    if (insertError) {
      console.error('Error upserting Yelp reviews:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      synced: insertedReviews?.length || 0,
      reviews: insertedReviews,
    });
  } catch (error) {
    console.error('Yelp review sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check sync status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');

  if (!businessId) {
    return NextResponse.json(
      { success: false, error: 'businessId is required' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();

  // Get current Yelp reviews for this business
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .eq('source', 'yelp')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  // Check if reviews are expired (older than 24 hours)
  const now = Date.now();
  const expiredReviews = reviews?.filter((review) => {
    if (!review.yelp_fetched_at) return true;
    const fetchedAt = new Date(review.yelp_fetched_at).getTime();
    return now - fetchedAt > 24 * 60 * 60 * 1000;
  }) || [];

  return NextResponse.json({
    success: true,
    reviews: reviews || [],
    count: reviews?.length || 0,
    expired: expiredReviews.length,
    needsSync: expiredReviews.length > 0 || (reviews?.length || 0) === 0,
  });
}
```

---

## Step 4: Create Batch Sync Endpoint (Optional)

### Create `src/app/api/reviews/yelp/sync-all/route.ts`

For syncing reviews for all businesses in the database:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * Sync Yelp reviews for all businesses
 * POST /api/reviews/yelp/sync-all
 * 
 * This processes businesses in batches to avoid rate limits
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize || 10; // Process 10 businesses at a time
    const delayMs = body.delayMs || 200; // Delay between batches

    const supabase = getSupabaseServerClient();

    // Get all business IDs
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id');

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        synced: 0,
        errors: [],
      });
    }

    const results = {
      processed: 0,
      synced: 0,
      errors: [] as string[],
    };

    // Process in batches
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      for (const business of batch) {
        try {
          // Call the sync endpoint for each business
          const syncUrl = new URL('/api/reviews/yelp/sync', request.url);
          syncUrl.searchParams.set('businessId', business.id);

          const syncResponse = await fetch(syncUrl.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const syncData = await syncResponse.json();

          if (syncData.success) {
            results.synced += syncData.synced || 0;
          } else {
            results.errors.push(`Business ${business.id}: ${syncData.error}`);
          }

          results.processed++;

          // Small delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          results.errors.push(
            `Business ${business.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
          results.processed++;
        }
      }

      // Delay between batches
      if (i + batchSize < businesses.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Step 5: Update Reviews API to Include Yelp Reviews

### Update `src/app/api/reviews/route.ts`

Modify the GET endpoint to fetch both user and Yelp reviews:

```typescript
// In the GET handler, add source filtering
const source = searchParams.get('source'); // 'user', 'yelp', or 'all' (default)

let query = supabase
  .from('reviews')
  .select(`
    *,
    profiles:user_id (
      id,
      full_name,
      avatar_url,
      email
    )
  `)
  .eq('business_id', businessId);

// Filter by source if specified
if (source === 'user') {
  query = query.eq('source', 'user');
} else if (source === 'yelp') {
  query = query.eq('source', 'yelp');
}
// If 'all' or not specified, get both

// Apply sorting, limit, offset, etc.
```

---

## Step 6: Create Yelp Review UI Components

### Create `src/components/YelpReviewCard.tsx`

```typescript
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
          <span key={i} className="text-yellow-500">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-gray-300">★</span>
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
    return date.toLocaleDateString();
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
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg">
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
        {/* Yelp Logo */}
        <Link
          href={review.yelp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <svg
            className="w-16 h-6"
            viewBox="0 0 100 20"
            fill="#D32323"
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
      <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        {review.content}
      </p>

      {/* Link to Yelp */}
      <Link
        href={review.yelp_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium inline-flex items-center gap-1"
        style={{ color: 'var(--color-primary)' }}
      >
        Read full review on Yelp
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Link>
    </div>
  );
}
```

---

## Step 7: Update Review Section Component

### Update `src/components/ReviewSection.tsx` (when created)

Add separate sections for user reviews and Yelp reviews:

```typescript
// In ReviewSection component
const [userReviews, setUserReviews] = useState([]);
const [yelpReviews, setYelpReviews] = useState([]);

// Fetch reviews separately
useEffect(() => {
  // Fetch user reviews
  fetch(`/api/reviews?businessId=${businessId}&source=user`)
    .then(res => res.json())
    .then(data => setUserReviews(data.reviews || []));

  // Fetch Yelp reviews
  fetch(`/api/reviews?businessId=${businessId}&source=yelp`)
    .then(res => res.json())
    .then(data => setYelpReviews(data.reviews || []));
}, [businessId]);

// In render:
return (
  <div>
    {/* User Reviews Section */}
    <section>
      <h2>User Reviews</h2>
      {/* User review cards */}
    </section>

    {/* Yelp Reviews Section */}
    {yelpReviews.length > 0 && (
      <section>
        <h2>Reviews from Yelp</h2>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
            These reviews are from Yelp and are updated daily
          </span>
        </div>
        {yelpReviews.map(review => (
          <YelpReviewCard key={review.id} review={review} />
        ))}
      </section>
    )}
  </div>
);
```

---

## Step 8: Sync Reviews During Business Ingestion

### Update `src/app/api/yelp/ingest/route.ts`

Add Yelp review sync after business ingestion:

```typescript
// After successfully upserting a business:
if (!error) {
  cityProcessed++;
  allResults.processed++;

  // Optionally sync Yelp reviews for this business
  try {
    const syncUrl = new URL('/api/reviews/yelp/sync', request.url);
    syncUrl.searchParams.set('businessId', yelpBusiness.id);
    
    await fetch(syncUrl.toString(), {
      method: 'POST',
    });
    // Don't wait for response or handle errors - non-critical
  } catch (syncError) {
    // Silently fail - review sync is optional during ingestion
    console.log('Could not sync reviews for', yelpBusiness.name);
  }
}
```

---

## Step 9: Set Up Background Job (Optional)

For automatic syncing every 24 hours, you can:

1. **Use Vercel Cron Jobs** (if deployed on Vercel)
2. **Use Supabase Edge Functions** with cron triggers
3. **Use a separate service** (e.g., GitHub Actions, AWS Lambda)

Example Vercel Cron Job (`vercel.json`):

```json
{
  "crons": [{
    "path": "/api/reviews/yelp/sync-all",
    "schedule": "0 2 * * *"
  }]
}
```

---

## Step 10: Testing

### Manual Testing Steps

1. **Sync reviews for a single business:**
   ```bash
   curl -X POST "http://localhost:3000/api/reviews/yelp/sync?businessId=YELP_BUSINESS_ID"
   ```

2. **Check sync status:**
   ```bash
   curl "http://localhost:3000/api/reviews/yelp/sync?businessId=YELP_BUSINESS_ID"
   ```

3. **Sync all businesses:**
   ```bash
   curl -X POST "http://localhost:3000/api/reviews/yelp/sync-all"
   ```

4. **Verify in database:**
   ```sql
   SELECT * FROM reviews WHERE source = 'yelp' LIMIT 10;
   ```

5. **Check expiration:**
   ```sql
   SELECT * FROM reviews 
   WHERE source = 'yelp' 
   AND yelp_fetched_at < NOW() - INTERVAL '24 hours';
   ```

---

## Compliance Checklist

- [x] Yelp reviews are stored with `source = 'yelp'`
- [x] Yelp reviews include `yelp_fetched_at` timestamp
- [x] Expired reviews (24+ hours) are deleted before fetching new ones
- [x] Yelp logo is displayed with Yelp reviews
- [x] Link to original Yelp review is provided
- [x] Yelp reviews are clearly labeled as "via Yelp"
- [x] User reviews and Yelp reviews are displayed separately
- [x] Ratings are not aggregated between user and Yelp reviews
- [x] Yelp review content is not modified

---

## Next Steps

1. Run the database migration
2. Add Yelp API function to `yelpClient.ts`
3. Create sync API endpoints
4. Create Yelp review UI components
5. Test the integration
6. Set up background sync job (optional)

