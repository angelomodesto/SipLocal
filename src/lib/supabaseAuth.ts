import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for server-side use that can read auth from cookies/headers
 * This is used in API routes and server components to get the authenticated user
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  // Try to get access token from Authorization header first (most reliable)
  const authHeader = headersList.get('authorization');
  let accessToken = authHeader?.replace('Bearer ', '');

  // If no header, try to get from cookies
  // Supabase stores tokens in cookies with format: sb-<project-ref>-auth-token
  if (!accessToken) {
    const supabaseUrl = new URL(url);
    const projectRef = supabaseUrl.hostname.split('.')[0];
    const cookieName = `sb-${projectRef}-auth-token`;
    const authCookie = cookieStore.get(cookieName)?.value;
    
    if (authCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(authCookie));
        accessToken = parsed.access_token;
      } catch {
        // Cookie might be in different format, try direct value
        accessToken = authCookie;
      }
    }
  }

  // Create client with token if available
  const supabase = createClient(url, anonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

/**
 * Gets the authenticated user from the request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Gets the authenticated user from a NextRequest
 * Useful for middleware
 */
export async function getAuthenticatedUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return null;
    }

    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    let accessToken = authHeader?.replace('Bearer ', '');

    // If no header, try cookies
    if (!accessToken) {
      const supabaseUrl = new URL(url);
      const projectRef = supabaseUrl.hostname.split('.')[0];
      const cookieName = `sb-${projectRef}-auth-token`;
      const authCookie = request.cookies.get(cookieName)?.value;
      
      if (authCookie) {
        try {
          const parsed = JSON.parse(authCookie);
          accessToken = parsed.access_token;
        } catch {
          // Cookie might be in different format
        }
      }
    }

    if (!accessToken) {
      return null;
    }

    // Create a client with the token
    const supabase = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting authenticated user from request:', error);
    return null;
  }
}

