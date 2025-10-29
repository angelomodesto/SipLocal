'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function SupabaseTestPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Change 'your_table' to an actual table name in your Supabase project
    supabase
      .from('test')
      .select('*')
      .limit(10)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          return;
        }
        setRows(data ?? []);
      });
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase Test</h1>
      <p>Querying first 10 rows from <code>your_table</code>.</p>
      {error ? (
        <pre style={{ color: 'crimson' }}>{error}</pre>
      ) : (
        <pre>{JSON.stringify(rows, null, 2)}</pre>
      )}
    </main>
  );
}
