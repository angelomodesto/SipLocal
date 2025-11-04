import { NextRequest, NextResponse } from 'next/server';
import { fetchAllYelpBusinesses } from '@/lib/yelpClient';
import { getSupabaseServerClient, transformYelpBusinessToDb } from '@/lib/supabaseServer';

// Rio Grande Valley cities
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
    const cities = body.cities || RGV_CITIES;
    const maxResultsPerCity = body.maxResultsPerCity || 50;

    const supabase = getSupabaseServerClient();
    const allResults = {
      total: 0,
      processed: 0,
      errors: [] as string[],
    };

    // Process each city
    for (const city of cities) {
      try {
        console.log(`Fetching businesses for ${city}...`);
        
        const yelpBusinesses = await fetchAllYelpBusinesses(
          city,
          'coffee,cafes',
          maxResultsPerCity
        );

        console.log(`Found ${yelpBusinesses.length} businesses in ${city}`);

        // Upsert each business
        for (const yelpBusiness of yelpBusinesses) {
          const dbRecord = transformYelpBusinessToDb(yelpBusiness);

          const { error } = await supabase
            .from('businesses')
            .upsert(dbRecord, {
              onConflict: 'id',
              ignoreDuplicates: false,
            });

          if (error) {
            allResults.errors.push(`Error upserting ${yelpBusiness.name}: ${error.message}`);
          } else {
            // Upsert succeeded - increment processed count
            allResults.processed++;
          }
        }

        allResults.total += yelpBusinesses.length;

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
    cities: RGV_CITIES,
  });
}

