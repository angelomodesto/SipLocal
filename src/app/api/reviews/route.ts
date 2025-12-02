import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { createServerClient } from '@/lib/supabaseAuth';

/**
 * GET /api/reviews?businessId={id}&source={user|yelp|all}&sort={newest|oldest|highest|lowest|helpful}&limit={n}&offset={n}
 * Fetch reviews for a business
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const source = searchParams.get('source') || 'all'; // 'user', 'yelp', or 'all'
    const sort = searchParams.get('sort') || 'newest'; // 'newest', 'oldest', 'highest', 'lowest', 'helpful'
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'businessId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Build query - fetch reviews first
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId);

    // Filter by source
    if (source === 'user') {
      query = query.eq('source', 'user');
    } else if (source === 'yelp') {
      query = query.eq('source', 'yelp');
    }
    // If 'all', get both user and Yelp reviews

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'highest':
        query = query.order('rating', { ascending: false });
        break;
      case 'lowest':
        query = query.order('rating', { ascending: true });
        break;
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Fetch profiles for user reviews only
    const userReviewIds = reviews?.filter((r) => r.source === 'user' && r.user_id).map((r) => r.user_id) || [];
    let profilesMap: Record<string, any> = {};

    if (userReviewIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', userReviewIds);

      if (profiles) {
        profilesMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Combine reviews with profiles
    const reviewsWithProfiles = (reviews || []).map((review) => ({
      ...review,
      profiles: review.user_id ? profilesMap[review.user_id] || null : null,
    }));

    return NextResponse.json({
      success: true,
      reviews: reviewsWithProfiles,
      count: reviewsWithProfiles.length,
    });
  } catch (error) {
    console.error('Reviews API error:', error);
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
 * POST /api/reviews
 * Create a new user review
 * Body: { businessId, rating, title?, content, photos? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, rating, title, content, photos } = body;

    // Validation
    if (!businessId || !rating || !content) {
      return NextResponse.json(
        { success: false, error: 'businessId, rating, and content are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Review content must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Review content must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Use createServerClient which reads auth from request headers/cookies
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user already has a review for this business
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .eq('source', 'user')
      .single();

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this business' },
        { status: 400 }
      );
    }

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        business_id: businessId,
        user_id: user.id,
        source: 'user',
        rating,
        title: title || null,
        content,
        photos: photos || null,
        helpful_count: 0,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    // Fetch profile for the review
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        profiles: profile || null,
      },
    });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

