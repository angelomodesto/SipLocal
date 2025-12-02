import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 params are always a Promise
    const resolvedParams = await params;
    const businessId = resolvedParams.id;

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) {
      console.error('Database error fetching business:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      console.error(`Business not found with ID: ${businessId}`);
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const business = {
      id: data.id,
      name: data.name,
      photos: Array.isArray(data.photos) ? data.photos : (data.image_url ? [data.image_url] : []),
      rating: data.rating ?? 0,
      reviewCount: data.review_count ?? 0,
      price: data.price ?? null,
      categories: data.categories ?? [],
      city: data.city,
      state: data.state,
      address: data.display_address || [data.address_line1, data.city, data.state].filter(Boolean).join(', '),
      phone: data.display_phone || data.phone || '',
      aiSummary: data.ai_summary ?? null,
    };

    return NextResponse.json({ success: true, business });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

