import { getSupabaseClient } from './supabaseClient';

/**
 * Helper function to make authenticated API requests
 * Automatically includes the auth token in the Authorization header
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = new Headers(options.headers);
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

