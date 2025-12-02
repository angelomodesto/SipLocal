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
    let yelpReviews;
    try {
      yelpReviews = await getYelpBusinessReviews(businessId);
    } catch (error) {
      console.error('Error fetching Yelp reviews:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch Yelp reviews',
        },
        { status: 500 }
      );
    }

    // 2. Delete expired Yelp reviews for this business (older than 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('business_id', businessId)
      .eq('source', 'yelp')
      .lt('yelp_fetched_at', twentyFourHoursAgo);

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

    // Delete existing Yelp reviews for this business first (to handle updates)
    await supabase
      .from('reviews')
      .delete()
      .eq('business_id', businessId)
      .eq('source', 'yelp');

    // Insert new Yelp reviews
    const { data: insertedReviews, error: insertError } = await supabase
      .from('reviews')
      .insert(reviewsToInsert)
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

