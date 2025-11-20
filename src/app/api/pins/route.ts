import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

// GET - Fetch user's pins
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const cookieStore = await cookies();
    
    // Get auth token from cookies
    const token = cookieStore.get('sb-access-token')?.value;
    
    // For client-side requests, we'll need to pass the session
    // This is a simplified version - in production, use proper session handling
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 401 });
    }

    // Fetch pins with business details
    const { data: pins, error } = await supabase
      .from('user_pins')
      .select(`
        *,
        businesses (
          id,
          name,
          image_url,
          photos,
          rating,
          review_count,
          price,
          categories,
          city,
          state
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Transform the data to a flatter structure
    const transformedPins = (pins || []).map((pin: any) => ({
      id: pin.id,
      businessId: pin.business_id,
      status: pin.status,
      userNotes: pin.user_notes,
      userImageUrl: pin.user_image_url,
      createdAt: pin.created_at,
      updatedAt: pin.updated_at,
      business: pin.businesses ? {
        id: pin.businesses.id,
        name: pin.businesses.name,
        imageUrl: Array.isArray(pin.businesses.photos) && pin.businesses.photos.length > 0 
          ? pin.businesses.photos[0] 
          : pin.businesses.image_url ?? null,
        rating: pin.businesses.rating ?? 0,
        reviewCount: pin.businesses.review_count ?? 0,
        price: pin.businesses.price ?? null,
        categories: pin.businesses.categories ?? [],
        city: pin.businesses.city,
        state: pin.businesses.state,
      } : null,
    }));

    return NextResponse.json({ success: true, pins: transformedPins });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new pin
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { business_id, status, user_notes, user_image_url, user_id } = body;

    if (!user_id || !business_id) {
      return NextResponse.json(
        { success: false, error: 'user_id and business_id are required' },
        { status: 400 }
      );
    }

    // Check if pin already exists
    const { data: existingPin } = await supabase
      .from('user_pins')
      .select('id')
      .eq('user_id', user_id)
      .eq('business_id', business_id)
      .single();

    if (existingPin) {
      // Update existing pin
      const { data, error } = await supabase
        .from('user_pins')
        .update({
          status: status || 'want_to_try',
          user_notes: user_notes || null,
          user_image_url: user_image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPin.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, pin: data });
    }

    // Create new pin
    const { data, error } = await supabase
      .from('user_pins')
      .insert({
        user_id,
        business_id,
        status: status || 'want_to_try',
        user_notes: user_notes || null,
        user_image_url: user_image_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pin: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a pin
export async function DELETE(request: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const pinId = searchParams.get('pin_id');
    const userId = searchParams.get('user_id');

    if (!pinId || !userId) {
      return NextResponse.json(
        { success: false, error: 'pin_id and user_id are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_pins')
      .delete()
      .eq('id', pinId)
      .eq('user_id', userId); // Ensure user can only delete their own pins

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

