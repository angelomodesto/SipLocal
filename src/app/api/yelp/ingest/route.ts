import { NextRequest, NextResponse } from 'next/server';
import { fetchAllYelpBusinesses, getYelpBusinessDetails } from '@/lib/yelpClient';
import { getSupabaseServerClient, transformYelpBusinessToDb } from '@/lib/supabaseServer';
import { filterChains } from '@/lib/chainFilter';

// Initial test cities - Brownsville, Harlingen, Edinburg
const TEST_CITIES = [
  'Brownsville, TX',
  'Harlingen, TX',
  'Edinburg, TX',
];

// All Rio Grande Valley cities (for future expansion)
const RGV_CITIES = [
  'Brownsville, TX',
  'Harlingen, TX',
  'McAllen, TX',
  'Edinburg, TX',
  'Weslaco, TX',
  'Mission, TX',
  'San Benito, TX',
  'Pharr, TX',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cities = body.cities || TEST_CITIES;
    const maxResultsPerCity = body.maxResultsPerCity || 20;
    const fetchPhotos = body.fetchPhotos !== false; // Default to true, can be disabled
    const minRating = body.minRating ?? 3.0; // Minimum rating 3.0
    const excludeChains = body.excludeChains !== false; // Default to true

    const supabase = getSupabaseServerClient();
    const allResults = {
      total: 0,
      processed: 0,
      skipped: 0,
      filtered: 0, // Track filtered businesses (chains, no photos, etc.)
      errors: [] as string[],
      cities: [] as Array<{ city: string; count: number; processed: number; filtered: number }>,
    };

    // Process each city
    for (const city of cities) {
      try {
        console.log(`Fetching businesses for ${city}...`);
        
        // Fetch businesses with filters:
        // - Exclude permanently closed
        // - Minimum rating 3.0
        // - Require photos
        const yelpBusinesses = await fetchAllYelpBusinesses(
          city,
          'coffee,cafes',
          maxResultsPerCity * 2, // Fetch more to account for filtering
          true, // excludeClosed = true
          minRating, // minRating = 3.0
          true // requirePhotos = true
        );

        // Filter out chains if requested
        const filteredBusinesses = excludeChains
          ? filterChains(yelpBusinesses)
          : yelpBusinesses;

        // Limit to maxResultsPerCity after filtering
        const businesses = filteredBusinesses.slice(0, maxResultsPerCity);
        const filteredCount = filteredBusinesses.length - businesses.length;

        console.log(
          `Found ${yelpBusinesses.length} businesses in ${city}, ` +
          `filtered to ${businesses.length} (removed ${yelpBusinesses.length - businesses.length})`
        );

        let cityProcessed = 0;
        let citySkipped = 0;

        // Upsert each business
        for (const yelpBusiness of businesses) {
          try {
            // Always fetch business details for photos (max 10 photos)
            let businessWithPhotos = yelpBusiness;
            if (fetchPhotos) {
              try {
                const details = await getYelpBusinessDetails(yelpBusiness.id);
                businessWithPhotos = details;
                // Small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
              } catch (error) {
                console.warn(`Could not fetch details for ${yelpBusiness.name}:`, error);
                // Skip businesses where we can't get photos (since we require photos)
                citySkipped++;
                continue;
              }
            }

            // Final check: ensure business has photos before storing
            if (!businessWithPhotos.image_url && (!businessWithPhotos.photos || businessWithPhotos.photos.length === 0)) {
              console.log(`Skipping ${yelpBusiness.name} - no photos available`);
              citySkipped++;
              continue;
            }

            const dbRecord = transformYelpBusinessToDb(businessWithPhotos);

            const { error } = await supabase
              .from('businesses')
              .upsert(dbRecord, {
                onConflict: 'id',
                ignoreDuplicates: false,
              });

            if (error) {
              allResults.errors.push(`Error upserting ${yelpBusiness.name}: ${error.message}`);
              citySkipped++;
            } else {
              cityProcessed++;
              allResults.processed++;
            }
          } catch (error) {
            const errorMsg = `Error processing ${yelpBusiness.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            allResults.errors.push(errorMsg);
            citySkipped++;
            console.error(errorMsg, error);
          }
        }

        allResults.total += businesses.length;
        allResults.skipped += citySkipped;
        allResults.filtered += filteredCount;
        allResults.cities.push({
          city,
          count: businesses.length,
          processed: cityProcessed,
          filtered: filteredCount,
        });

        // Small delay between cities to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        const errorMsg = `Error processing ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        allResults.errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    return NextResponse.json({
      success: true,
      results: allResults,
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Yelp ingestion endpoint. Use POST to start ingestion.',
    testCities: TEST_CITIES,
    allCities: RGV_CITIES,
    defaults: {
      cities: TEST_CITIES,
      maxResultsPerCity: 20,
      fetchPhotos: true,
      excludeClosed: true,
      minRating: 3.0,
      excludeChains: true,
      requirePhotos: true,
    },
  });
}

