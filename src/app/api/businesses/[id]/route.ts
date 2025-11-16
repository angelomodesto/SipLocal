import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
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

