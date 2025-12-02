import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { createServerClient } from '@/lib/supabaseAuth';

/**
 * PATCH /api/reviews/[id]
 * Update own review
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const reviewId = resolvedParams.id;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, title, content, photos } = body;

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

    // Get the review to verify ownership
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('user_id, source')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify ownership and that it's a user review
    if (existingReview.source !== 'user' || existingReview.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Validation
    if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    if (content !== undefined) {
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
    }

    if (title !== undefined && title.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title must be less than 100 characters' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (content !== undefined) updateData.content = content.trim();
    if (photos !== undefined) updateData.photos = photos;

    // Update review
    const { data: review, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating review:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
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
    console.error('Update review error:', error);
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
 * DELETE /api/reviews/[id]
 * Delete own review
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const reviewId = resolvedParams.id;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
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

    // Get the review to verify ownership
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('user_id, source')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify ownership and that it's a user review
    if (existingReview.source !== 'user' || existingReview.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Delete review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

