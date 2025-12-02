# Pin Board Feature Setup Guide

This guide will help you set up the Pinterest-like pin board feature for SipLocal.

## Prerequisites

- Supabase project set up
- Database migrations run (see `database/` folder)

## Setup Steps

### 1. Run Database Migrations

Run the following SQL files in your Supabase SQL Editor in order:

1. `database/004_create_user_pins_table.sql` - Creates the user_pins table
2. `database/005_setup_storage_bucket.sql` - Sets up storage bucket for image uploads

### 2. Verify Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Verify that `user-uploads` bucket exists and is **public**
4. If it doesn't exist, run the SQL from `005_setup_storage_bucket.sql`

### 3. Test the Feature

1. **Sign up/Login**: Create an account or log in
2. **Browse Cafés**: Go to `/cafes` and browse coffee shops
3. **Pin a Café**: Click the pin icon (📌) on any café card or detail page
4. **View Your Board**: Click "My Board" in the header to see your pinned cafés
5. **Edit a Pin**: Click the edit icon on any pin to:
   - Change status (Want to Try / Favorite)
   - Upload your own photo
   - Add notes
6. **Filter Pins**: Use the filter tabs to view all pins, favorites, or want-to-try items

## Features

### Pin Board Features
- ✅ Pin/unpin cafés from anywhere in the app
- ✅ Pinterest-like masonry grid layout
- ✅ Filter by status (All, Favorites, Want to Try)
- ✅ Edit pins with custom photos and notes
- ✅ Upload your own photos from phone/computer
- ✅ Remove pins from your board

### User Experience
- Pin button appears on:
  - Business cards (top-right corner)
  - Business detail pages (next to business name)
- User menu in header shows:
  - User email/avatar
  - Link to "My Pin Board"
  - Sign out option

## API Endpoints

- `GET /api/pins?user_id={userId}` - Get user's pins
- `POST /api/pins` - Create/update a pin
- `DELETE /api/pins?pin_id={pinId}&user_id={userId}` - Delete a pin
- `GET /api/pins/check?business_id={id}&user_id={userId}` - Check if business is pinned
- `POST /api/upload` - Upload image to Supabase Storage

## Database Schema

### `user_pins` Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users
- `business_id` (TEXT) - References businesses
- `status` (TEXT) - 'favorite' or 'want_to_try'
- `user_notes` (TEXT) - Optional user notes
- `user_image_url` (TEXT) - URL to user-uploaded image
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Storage Structure

Images are stored in Supabase Storage under:
```
user-uploads/
  {user_id}/
    {business_id}/
      {timestamp}.{ext}
```

## Troubleshooting

### Images not uploading?
- Check that the `user-uploads` bucket exists in Supabase Storage
- Verify the bucket is set to **public**
- Check browser console for errors
- Verify file size is under 5MB

### Pins not showing?
- Ensure user is logged in
- Check that `user_pins` table exists
- Verify RLS policies are set up correctly

### Can't pin businesses?
- Make sure you're logged in
- Check browser console for API errors
- Verify the API routes are accessible

## Future Enhancements

Potential features to add:
- [ ] Share pin boards with friends
- [ ] Create multiple boards (e.g., "Coffee Shops", "Brunch Spots")
- [ ] Add tags to pins
- [ ] Export pin board as PDF
- [ ] Social features (like, comment on pins)

