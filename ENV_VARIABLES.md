# Environment Variables

This file lists all environment variables needed for the application.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Yelp Fusion API
YELP_API_KEY=your_yelp_api_key_here
```

## Getting Your Yelp API Key

1. Go to [Yelp Developers](https://www.yelp.com/developers)
2. Sign in or create an account
3. Navigate to "Manage App" or "Create App"
4. Create a new app or use an existing one
5. Copy your API Key (it will look like: `Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
6. Add it to `.env.local` as `YELP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Note:** The Yelp API key should be kept secret and only used server-side. Never expose it in client-side code.

## Environment Variable Usage

- `NEXT_PUBLIC_*` variables are exposed to the browser (client-side)
- Variables without `NEXT_PUBLIC_` prefix are server-side only
- `YELP_API_KEY` is server-side only (used in API routes and server components)

