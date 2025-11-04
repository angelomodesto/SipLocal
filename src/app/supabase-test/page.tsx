'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function SupabaseTestPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase
      .from('businesses')
      .select('*')
      .order('name', { ascending: true })
      .limit(20)
      .then(({ data, error }) => {
        setLoading(false);
        if (error) {
          setError(error.message);
          return;
        }
        setRows(data ?? []);
      });
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase Businesses Test</h1>
      <p>Querying businesses from the <code>businesses</code> table.</p>
      {loading && <p>Loading...</p>}
      {error ? (
        <pre style={{ color: 'crimson' }}>{error}</pre>
      ) : (
        <div>
          <p style={{ marginBottom: 16 }}>
            Found <strong>{rows.length}</strong> businesses
          </p>
          <div style={{ display: 'grid', gap: 16 }}>
            {rows.map((business) => (
              <div
                key={business.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  backgroundColor: '#f9f9f9',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0' }}>{business.name}</h3>
                <p style={{ margin: '4px 0', color: '#666' }}>
                  {business.city}, {business.state}
                </p>
                {business.rating && (
                  <p style={{ margin: '4px 0' }}>
                    ⭐ {business.rating} ({business.review_count} reviews)
                  </p>
                )}
                {business.display_address && (
                  <p style={{ margin: '4px 0', fontSize: '0.9em' }}>
                    📍 {business.display_address}
                  </p>
                )}
                {business.phone && (
                  <p style={{ margin: '4px 0', fontSize: '0.9em' }}>
                    📞 {business.display_phone || business.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
          {rows.length === 0 && !loading && (
            <p style={{ color: '#666' }}>
              No businesses found. Make sure you've run the ingestion endpoint.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
