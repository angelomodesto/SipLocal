import { NextRequest, NextResponse } from 'next/server';
import { fetchAllYelpBusinesses, getYelpBusinessDetails } from '@/lib/yelpClient';
import { getSupabaseServerClient, transformYelpBusinessToDb } from '@/lib/supabaseServer';

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
    const maxResultsPerCity = body.maxResultsPerCity || 10;
    const fetchPhotos = body.fetchPhotos !== false; // Default to true, can be disabled

    const supabase = getSupabaseServerClient();
    const allResults = {
      total: 0,
      processed: 0,
      skipped: 0,
      errors: [] as string[],
      cities: [] as Array<{ city: string; count: number; processed: number }>,
    };

    // Process each city
    for (const city of cities) {
      try {
        console.log(`Fetching businesses for ${city}...`);
        
        // Fetch businesses, excluding permanently closed ones
        const yelpBusinesses = await fetchAllYelpBusinesses(
          city,
          'coffee,cafes',
          maxResultsPerCity,
          true // excludeClosed = true
        );

        console.log(`Found ${yelpBusinesses.length} businesses in ${city} (excluding closed)`);

        let cityProcessed = 0;
        let citySkipped = 0;

        // Upsert each business
        for (const yelpBusiness of yelpBusinesses) {
          try {
            // If we need photos, fetch business details
            let businessWithPhotos = yelpBusiness;
            if (fetchPhotos) {
              try {
                const details = await getYelpBusinessDetails(yelpBusiness.id);
                businessWithPhotos = details;
                // Small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
              } catch (error) {
                console.warn(`Could not fetch details for ${yelpBusiness.name}:`, error);
                // Continue with basic data if details fetch fails
              }
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

        allResults.total += yelpBusinesses.length;
        allResults.skipped += citySkipped;
        allResults.cities.push({
          city,
          count: yelpBusinesses.length,
          processed: cityProcessed,
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
      maxResultsPerCity: 10,
      fetchPhotos: true,
      excludeClosed: true,
    },
  });
}

