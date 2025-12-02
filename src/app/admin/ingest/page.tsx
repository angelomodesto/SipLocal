'use client';

import { useState } from 'react';
import Header from '@/components/Header';

interface IngestionResult {
  success: boolean;
  results?: {
    total: number;
    processed: number;
    skipped: number;
    filtered?: number;
    errors: string[];
    cities: Array<{ city: string; count: number; processed: number; filtered?: number }>;
  };
  error?: string;
}

export default function IngestionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);

  const handleIngest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/yelp/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cities: ['Brownsville, TX', 'Harlingen, TX', 'Edinburg, TX'],
          maxResultsPerCity: 20,
          fetchPhotos: true,
          minRating: 3.0,
          excludeChains: true,
          requirePhotos: true,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Ingestion</h1>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingest Yelp Data</h2>
            <p className="text-gray-600 mb-4">
              This will fetch businesses from Yelp API and store them in Supabase.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              <strong>Cities:</strong> Brownsville, Harlingen, Edinburg<br />
              <strong>Max per city:</strong> 20 businesses<br />
              <strong>Categories:</strong> Coffee & Cafes<br />
              <strong>Exclude closed:</strong> Yes<br />
              <strong>Exclude chains:</strong> Yes (Starbucks, 7brew, Dunkin, etc.)<br />
              <strong>Minimum rating:</strong> 3.0+<br />
              <strong>Require photos:</strong> Yes<br />
              <strong>Max photos per business:</strong> 10
            </p>

            <button
              onClick={handleIngest}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Ingesting...' : 'Start Ingestion'}
            </button>
          </div>

          {result && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>

              {result.success && result.results ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-green-600 font-medium">Total Found</div>
                      <div className="text-2xl font-bold text-green-900">{result.results.total}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-blue-600 font-medium">Processed</div>
                      <div className="text-2xl font-bold text-blue-900">{result.results.processed}</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="text-sm text-orange-600 font-medium">Filtered</div>
                      <div className="text-2xl font-bold text-orange-900">{result.results.filtered || 0}</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="text-sm text-yellow-600 font-medium">Skipped</div>
                      <div className="text-2xl font-bold text-yellow-900">{result.results.skipped}</div>
                    </div>
                  </div>

                  {result.results.cities.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">By City</h3>
                      <div className="space-y-2">
                        {result.results.cities.map((city) => (
                          <div
                            key={city.city}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">{city.city}</span>
                            <div className="text-sm text-gray-600">
                              <div>{city.processed}/{city.count} processed</div>
                              {city.filtered !== undefined && city.filtered > 0 && (
                                <div className="text-xs text-orange-600">
                                  {city.filtered} filtered (chains, etc.)
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.results.errors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Errors</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                          {result.results.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-900 font-medium">Error</p>
                  <p className="text-red-700 mt-2">{result.error || 'Unknown error occurred'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

