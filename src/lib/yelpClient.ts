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

// Helper to fetch all businesses (handles pagination)
export async function fetchAllYelpBusinesses(
  location: string,
  categories: string = 'coffee,cafes',
  maxResults: number = 200
): Promise<YelpBusiness[]> {
  const allBusinesses: YelpBusiness[] = [];
  let offset = 0;
  const limit = 50; // Yelp max per request

  while (allBusinesses.length < maxResults) {
    const response = await searchYelpBusinesses(location, categories, limit, offset);
    
    if (response.businesses.length === 0) {
      break;
    }

    allBusinesses.push(...response.businesses);

    // If we got fewer results than requested, we've reached the end
    if (response.businesses.length < limit) {
      break;
    }

    offset += limit;

    // Rate limiting: Yelp allows 5000 requests/day, but be respectful
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }

  return allBusinesses.slice(0, maxResults);
}

