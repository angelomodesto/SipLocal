// Yelp Fusion API client for server-side use only
const YELP_API_BASE = 'https://api.yelp.com/v3';

export interface YelpBusiness {
  id: string;
  name: string;
  image_url: string | null;
  url: string;
  price: string | null;
  rating: number;
  review_count: number;
  categories: Array<{ alias: string; title: string }>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location: {
    address1: string | null;
    address2: string | null;
    address3: string | null;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  is_closed?: boolean; // Permanently closed flag
  photos?: string[]; // Array of photo URLs (from Business Details API)
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region?: {
    center: {
      latitude: number;
      longitude: number;
    };
  };
}

export async function searchYelpBusinesses(
  location: string,
  categories: string = 'coffee,cafes',
  limit: number = 50,
  offset: number = 0
): Promise<YelpSearchResponse> {
  const apiKey = process.env.YELP_API_KEY;
  
  if (!apiKey) {
    throw new Error('YELP_API_KEY environment variable is not set');
  }

  const params = new URLSearchParams({
    location,
    categories,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(`${YELP_API_BASE}/businesses/search?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yelp API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Helper to fetch all businesses (handles pagination and filters closed businesses)
export async function fetchAllYelpBusinesses(
  location: string,
  categories: string = 'coffee,cafes',
  maxResults: number = 200,
  excludeClosed: boolean = true
): Promise<YelpBusiness[]> {
  const allBusinesses: YelpBusiness[] = [];
  let offset = 0;
  const limit = 50; // Yelp max per request

  while (allBusinesses.length < maxResults) {
    const response = await searchYelpBusinesses(location, categories, limit, offset);
    
    if (response.businesses.length === 0) {
      break;
    }

    // Filter out permanently closed businesses if requested
    const businesses = excludeClosed
      ? response.businesses.filter((b) => !b.is_closed)
      : response.businesses;

    allBusinesses.push(...businesses);

    // If we got fewer results than requested, we've reached the end
    if (response.businesses.length < limit || allBusinesses.length >= maxResults) {
      break;
    }

    offset += limit;

    // Rate limiting: Yelp allows 5000 requests/day, but be respectful
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }

  return allBusinesses.slice(0, maxResults);
}

// Fetch business details including photos
export async function getYelpBusinessDetails(businessId: string): Promise<YelpBusiness & { photos: string[] }> {
  const apiKey = process.env.YELP_API_KEY;
  
  if (!apiKey) {
    throw new Error('YELP_API_KEY environment variable is not set');
  }

  const response = await fetch(`${YELP_API_BASE}/businesses/${businessId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yelp API error: ${response.status} - ${errorText}`);
  }

  const business = await response.json();
  
  return {
    id: business.id,
    name: business.name,
    image_url: business.image_url || null,
    url: business.url,
    price: business.price || null,
    rating: business.rating || 0,
    review_count: business.review_count || 0,
    categories: business.categories || [],
    coordinates: business.coordinates || { latitude: 0, longitude: 0 },
    location: business.location || {
      address1: null,
      address2: null,
      address3: null,
      city: '',
      state: '',
      zip_code: '',
      country: '',
      display_address: [],
    },
    phone: business.phone || '',
    display_phone: business.display_phone || '',
    is_closed: business.is_closed || false,
    photos: business.photos || [],
  };
}

