# Supabase Setup Instructions

This project is now configured to work with Supabase. Follow these steps to complete the setup:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization and enter project details:
   - Name: `siplocal` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest region to your users

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Note:** The service role key is found in the same API settings page. Keep this secret and never commit it to version control.

## 4. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)
3. You should see a "Supabase Connection Status" section that shows whether the connection is working

## 5. Next Steps

Now you can:
- Create database tables in the Supabase dashboard
- Update the TypeScript types in `types/supabase.ts`
- Use the Supabase client in your components:
  ```typescript
  import { supabase } from '@/lib/supabase'
  
  // Example: Fetch data
  const { data, error } = await supabase.from('your_table').select('*')
  ```

## Security Notes

- Never commit your `.env.local` file to version control
- The `NEXT_PUBLIC_` prefixed variables are safe to use in client-side code
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used in server-side code and API routes
