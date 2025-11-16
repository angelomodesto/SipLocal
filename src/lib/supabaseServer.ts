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
  // Build photos array: include main image_url if exists, then add photos array
  // Limit to max 10 photos total
  const photos: string[] = [];
  if (yelpBusiness.image_url) {
    photos.push(yelpBusiness.image_url);
  }
  if (yelpBusiness.photos && yelpBusiness.photos.length > 0) {
    // Add additional photos, avoiding duplicates
    for (const photo of yelpBusiness.photos) {
      if (photo && !photos.includes(photo) && photos.length < 10) {
        photos.push(photo);
      }
    }
  }

  // Ensure we don't exceed 10 photos
  const finalPhotos = photos.slice(0, 10);

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
    photos: finalPhotos.length > 0 ? finalPhotos : null, // Store as JSONB array, null if empty, max 10
    ai_summary: null, // Placeholder for future AI-generated summaries
  };
}

