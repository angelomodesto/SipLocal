import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const price = searchParams.get('price');
    const rating = searchParams.get('rating');
    const category = searchParams.get('category');
    const limit = Number(searchParams.get('limit') ?? '60');

    const supabase = getSupabaseServerClient();

    let query = supabase
      .from('businesses')
      .select('*')
      .limit(limit);

    if (city) {
      query = query.eq('city', city);
    }
    if (price) {
      query = query.eq('price', price);
    }
    if (rating) {
      const r = Number(rating);
      if (!Number.isNaN(r)) query = query.gte('rating', r);
    }
    if (category) {
      // categories is JSONB array of { alias, title }, match by title
      query = query.contains('categories', [{ title: category }]);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Map DB rows to UI shape expected by BusinessCard/page
    const businesses = (data ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      imageUrl: Array.isArray(b.photos) && b.photos.length > 0 ? b.photos[0] : b.image_url ?? null,
      rating: b.rating ?? 0,
      reviewCount: b.review_count ?? 0,
      price: b.price ?? null,
      categories: b.categories ?? [],
      city: b.city,
      state: b.state,
      aiSummary: b.ai_summary ?? null,
    }));

    return NextResponse.json({ success: true, businesses });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

