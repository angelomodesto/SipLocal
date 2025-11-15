# User Storage with Supabase Auth

## Overview

Supabase provides built-in authentication that automatically stores users in the `auth.users` table. You don't need to manually create this table - it's managed by Supabase.

## How It Works

### 1. Built-in `auth.users` Table
When a user signs up with Supabase Auth:
- User is automatically stored in `auth.users` table
- Password is automatically hashed with bcrypt
- User ID (UUID) is automatically generated
- Email, password hash, and metadata are stored securely

### 2. Profiles Table (Optional)
For additional user data (name, avatar, preferences), create a `profiles` table that references `auth.users`:

```sql
-- Run: database/002_create_profiles_table.sql
```

This provides:
- Additional user fields (full_name, avatar_url, etc.)
- Row Level Security (RLS) policies
- Automatic profile creation when user signs up
- User-specific data separate from auth data

## Authentication Flow

### Sign Up Flow
1. User fills out signup form (email, password)
2. Call `supabase.auth.signUp({ email, password })`
3. Supabase:
   - Creates user in `auth.users` table
   - Triggers profile creation (if set up)
   - Sends confirmation email (if enabled)
   - Returns session with JWT token

### Sign In Flow
1. User fills out login form (email, password)
2. Call `supabase.auth.signInWithPassword({ email, password })`
3. Supabase:
   - Validates credentials
   - Returns session with JWT token
   - Token is stored in browser (cookie/localStorage)

## Database Tables

### `auth.users` (Built-in by Supabase)
- `id` (UUID) - Primary key
- `email` - User email
- `encrypted_password` - Hashed password
- `email_confirmed_at` - Email verification timestamp
- `created_at` - Account creation time
- `updated_at` - Last update time
- `raw_user_meta_data` (JSONB) - Additional metadata

### `public.profiles` (Optional - created by migration)
- `id` (UUID) - References `auth.users(id)`
- `email` - Email (synced from auth.users)
- `full_name` - User's full name
- `avatar_url` - Profile picture URL
- `created_at` - Profile creation time
- `updated_at` - Last update time

## Row Level Security (RLS)

The profiles table includes RLS policies:
- Users can only view/update their own profile
- Users can insert their own profile
- All queries are automatically filtered by `auth.uid()`

## Usage in Code

### Client-side (Browser)
```typescript
import { getSupabaseClient } from '@/lib/supabaseClient';

// Sign up
const { data, error } = await getSupabaseClient().auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await getSupabaseClient().auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Get current user
const { data: { user } } = await getSupabaseClient().auth.getUser();

// Sign out
await getSupabaseClient().auth.signOut();
```

### Server-side
```typescript
import { getSupabaseServerClient } from '@/lib/supabaseServer';

// Use service role key for admin operations
const supabase = getSupabaseServerClient();
```

## Security Best Practices

1. **Never expose service role key** - Only use in server-side code
2. **Use RLS policies** - Protect user data at database level
3. **Validate on server** - Always validate auth state server-side
4. **Use HTTPS** - Required for secure authentication
5. **Password requirements** - Enforce strong passwords (Supabase does this by default)

## Migration Steps

1. Run `database/schema_safe.sql` (if not already done)
2. Run `database/002_create_profiles_table.sql` for profiles table
3. Update auth pages to use Supabase Auth
4. Test signup/login flow

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (server-side only)
```

