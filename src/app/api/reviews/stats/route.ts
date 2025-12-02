import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * GET /api/reviews/stats?businessId={id}
 * Get review statistics for a business
 */
export async function GET(request: NextRequest) {
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

    // Get user reviews statistics
    const { data: userReviews, error: userError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId)
      .eq('source', 'user');

    if (userError) {
      console.error('Error fetching user reviews:', userError);
    }

    // Get Yelp reviews statistics
    const { data: yelpReviews, error: yelpError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId)
      .eq('source', 'yelp');

    if (yelpError) {
      console.error('Error fetching Yelp reviews:', yelpError);
    }

    // Calculate user review statistics
    const userRatings = userReviews?.map((r) => r.rating) || [];
    const userAverageRating =
      userRatings.length > 0
        ? userRatings.reduce((sum, rating) => sum + rating, 0) / userRatings.length
        : 0;

    // Calculate rating distribution for user reviews
    const userRatingDistribution = {
      5: userRatings.filter((r) => r === 5).length,
      4: userRatings.filter((r) => r === 4).length,
      3: userRatings.filter((r) => r === 3).length,
      2: userRatings.filter((r) => r === 2).length,
      1: userRatings.filter((r) => r === 1).length,
    };

    // Calculate Yelp review statistics
    const yelpRatings = yelpReviews?.map((r) => r.rating) || [];
    const yelpAverageRating =
      yelpRatings.length > 0
        ? yelpRatings.reduce((sum, rating) => sum + rating, 0) / yelpRatings.length
        : 0;

    // Calculate rating distribution for Yelp reviews
    const yelpRatingDistribution = {
      5: yelpRatings.filter((r) => r === 5).length,
      4: yelpRatings.filter((r) => r === 4).length,
      3: yelpRatings.filter((r) => r === 3).length,
      2: yelpRatings.filter((r) => r === 2).length,
      1: yelpRatings.filter((r) => r === 1).length,
    };

    return NextResponse.json({
      success: true,
      userReviews: {
        averageRating: userAverageRating,
        totalReviews: userRatings.length,
        ratingDistribution: userRatingDistribution,
      },
      yelpReviews: {
        averageRating: yelpAverageRating,
        totalReviews: yelpRatings.length,
        ratingDistribution: yelpRatingDistribution,
      },
      allReviews: {
        totalReviews: userRatings.length + yelpRatings.length,
      },
    });
  } catch (error) {
    console.error('Review stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

