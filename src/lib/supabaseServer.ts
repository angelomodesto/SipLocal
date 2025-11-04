import { createClient } from '@supabase/supabase-js';
import type { YelpBusiness } from './yelpClient';

// Server-side Supabase client with service role key for admin operations
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Transform Yelp business to database format
export function transformYelpBusinessToDb(yelpBusiness: YelpBusiness) {
  return {
    id: yelpBusiness.id,
    name: yelpBusiness.name,
    image_url: yelpBusiness.image_url,
    yelp_url: yelpBusiness.url,
    price: yelpBusiness.price,
    rating: yelpBusiness.rating,
    review_count: yelpBusiness.review_count,
    categories: yelpBusiness.categories, // Store as JSONB
    latitude: yelpBusiness.coordinates.latitude,
    longitude: yelpBusiness.coordinates.longitude,
    address_line1: yelpBusiness.location.address1,
    address_line2: yelpBusiness.location.address2,
    address_line3: yelpBusiness.location.address3,
    city: yelpBusiness.location.city,
    state: yelpBusiness.location.state,
    zip_code: yelpBusiness.location.zip_code,
    country: yelpBusiness.location.country,
    display_address: yelpBusiness.location.display_address.join(', '),
    phone: yelpBusiness.phone,
    display_phone: yelpBusiness.display_phone,
  };
}

