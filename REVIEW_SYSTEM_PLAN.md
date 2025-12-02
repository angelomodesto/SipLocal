# Review System Implementation Plan

## Overview
This document outlines the plan for implementing a comprehensive review system that allows users to write, read, and manage reviews for businesses in the application.

---

## 1. Database Schema

### Reviews Table
```sql
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for Yelp reviews
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT, -- Optional review title
  content TEXT NOT NULL, -- Review text content
  photos JSONB, -- Array of photo URLs (optional)
  helpful_count INTEGER DEFAULT 0, -- Number of users who found this helpful
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'yelp')), -- Review source
  yelp_review_id TEXT, -- Yelp review ID (for Yelp reviews only)
  yelp_user_name TEXT, -- Yelp reviewer name (for Yelp reviews only)
  yelp_user_avatar_url TEXT, -- Yelp reviewer avatar (for Yelp reviews only)
  yelp_url TEXT, -- Link to original Yelp review (for Yelp reviews only)
  yelp_fetched_at TIMESTAMPTZ, -- When Yelp review was fetched (for cache invalidation)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one review per user per business (only for user reviews)
  -- Yelp reviews can have multiple per business (up to 3)
  UNIQUE(business_id, user_id) WHERE user_id IS NOT NULL,
  UNIQUE(business_id, yelp_review_id) WHERE source = 'yelp'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS reviews_business_id_idx ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating);

-- Add updated_at trigger
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Review Helpful Votes Table (Optional - for "Helpful" feature)
```sql
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One vote per user per review
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS review_helpful_votes_review_id_idx ON public.review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS review_helpful_votes_user_id_idx ON public.review_helpful_votes(user_id);
```

### Row Level Security (RLS) Policies

**Reviews Table:**
- ✅ Anyone can read reviews (public visibility)
- ✅ Authenticated users can create reviews (source = 'user')
- ✅ Users can only update/delete their own reviews (source = 'user')
- ✅ Users can only create one review per business (source = 'user')
- ✅ Yelp reviews (source = 'yelp') are read-only, cannot be modified by users
- ✅ Only system/admin can insert/update/delete Yelp reviews

**Review Helpful Votes:**
- ✅ Anyone can read votes (for counting)
- ✅ Authenticated users can create votes
- ✅ Users can only vote once per review
- ✅ Users can delete their own votes (unvote)

---

## 2. Features to Include

### Core Features
1. **Write Review**
   - Rating (1-5 stars, required)
   - Review title (optional)
   - Review content (required, min length validation)
   - Photo upload (optional, multiple photos)
   - Submit button (only for authenticated users)

2. **Display Reviews**
   - List all reviews for a business (both user and Yelp reviews)
   - Separate sections: "User Reviews" and "Yelp Reviews" (or combined with badges)
   - Sort by: Most recent (default), Highest rated, Lowest rated, Most helpful
   - Show review author:
     - User reviews: name/avatar from profile
     - Yelp reviews: Yelp user name/avatar with "via Yelp" badge
   - Show review date
   - Show rating with stars
   - Show review content
   - Show photos if available
   - Show "Helpful" count and button (only for user reviews)
   - Show "View on Yelp" link for Yelp reviews
   - Display Yelp logo when showing Yelp reviews (compliance requirement)

3. **Review Management**
   - Edit own reviews
   - Delete own reviews
   - Mark reviews as helpful (one vote per user)
   - Report inappropriate reviews (future feature)

4. **Review Statistics**
   - Average rating from user reviews (separate from Yelp rating)
   - Total review count
   - Rating distribution (how many 5-star, 4-star, etc.)
   - Show on business detail page

### Advanced Features (Future)
- Review replies (business owner responses)
- Review reactions (like, love, etc.)
- Review filtering (by rating, date, helpful)
- Review search within business
- Review moderation/admin tools

---

## 3. UI/UX Design

### Business Detail Page - Reviews Section
**Location:** Replace the "Reviews Coming Soon" placeholder on `/businesses/[id]/page.tsx`

**Components:**
1. **Review Summary Card**
   - Average user rating (large, prominent)
   - Total review count
   - Rating breakdown (bar chart or distribution)
   - "Write a Review" button (prominent, only if authenticated)

2. **Review List**
   - Individual review cards showing:
     - User avatar and name
     - Rating stars
     - Review title (if provided)
     - Review content
     - Review date ("2 days ago" format)
     - Photos (if any, in a gallery)
     - "Helpful" button with count
     - Edit/Delete buttons (only for own reviews)
   - Sort dropdown
   - Pagination or "Load More" button

3. **Write Review Modal/Form**
   - Star rating selector
   - Title input (optional)
   - Content textarea (with character count)
   - Photo upload (drag & drop or file picker)
   - Preview uploaded photos
   - Submit button
   - Cancel button

### Review Card Design
- Clean, card-based layout
- User info at top (avatar + name)
- Rating and date
- Review content (with "Read more" for long reviews)
- Photo gallery (if photos exist)
- Action buttons (Helpful, Edit, Delete)

---

## 4. API Endpoints

### GET `/api/reviews?businessId={id}`
- Fetch all reviews for a business
- Query params:
  - `businessId` (required)
  - `sort` (optional: `newest`, `oldest`, `highest`, `lowest`, `helpful`)
  - `limit` (optional, default: 20)
  - `offset` (optional, default: 0)
- Returns: Array of reviews with user info

### GET `/api/reviews/[id]`
- Fetch a single review by ID
- Returns: Review with user info

### POST `/api/reviews`
- Create a new review
- Body: `{ businessId, rating, title?, content, photos? }`
- Requires authentication
- Returns: Created review

### PATCH `/api/reviews/[id]`
- Update own review
- Body: `{ rating?, title?, content?, photos? }`
- Requires authentication (must be review owner)
- Returns: Updated review

### DELETE `/api/reviews/[id]`
- Delete own review
- Requires authentication (must be review owner)
- Returns: Success status

### POST `/api/reviews/[id]/helpful`
- Mark review as helpful
- Requires authentication
- Returns: Updated helpful count

### DELETE `/api/reviews/[id]/helpful`
- Unmark review as helpful
- Requires authentication
- Returns: Updated helpful count

### GET `/api/reviews/stats?businessId={id}`
- Get review statistics for a business
- Query params:
  - `source` (optional: `user`, `yelp`, or `all` - default: `all`)
- Returns: `{ averageRating, totalReviews, ratingDistribution, userReviews, yelpReviews }`

### POST `/api/reviews/yelp/sync?businessId={id}`
- Fetch and sync Yelp reviews for a business
- Requires admin/system authentication (or run as background job)
- Fetches up to 3 reviews from Yelp API
- Updates or inserts Yelp reviews in database
- Returns: `{ synced: number, reviews: Review[] }`

### POST `/api/reviews/yelp/sync-all`
- Sync Yelp reviews for all businesses in database
- Requires admin authentication
- Processes businesses in batches
- Returns: `{ processed: number, synced: number, errors: string[] }`

---

## 5. Components to Create

1. **`ReviewSection.tsx`** - Main reviews section component
   - Review summary
   - Review list
   - Write review button

2. **`ReviewCard.tsx`** - Individual review display
   - Review content
   - User info
   - Rating display
   - Photos
   - Action buttons

3. **`WriteReviewModal.tsx`** - Modal for writing/editing reviews
   - Star rating selector
   - Form inputs
   - Photo upload
   - Submit/cancel buttons

4. **`ReviewStats.tsx`** - Review statistics display
   - Average rating
   - Total count
   - Rating distribution

5. **`StarRating.tsx`** - Reusable star rating component
   - Display mode (read-only)
   - Input mode (selectable)

6. **`PhotoUpload.tsx`** - Photo upload component
   - Drag & drop
   - File picker
   - Preview
   - Remove photos

---

## 6. Yelp Review Integration

### Yelp API Limitations & Compliance

**Important Constraints:**
1. **Limited Reviews**: Yelp Fusion API only returns up to **3 reviews** per business
2. **24-Hour Cache**: Cannot store Yelp content for more than 24 hours (must refresh)
3. **No Modification**: Cannot modify Yelp review content
4. **No Aggregation**: Cannot aggregate Yelp ratings with other sources
5. **Display Requirements**: Must display Yelp logo and link back to Yelp

**Compliance Requirements:**
- Display Yelp logo when showing Yelp reviews
- Provide link to original Yelp review page
- Refresh Yelp reviews at least every 24 hours
- Do not mix Yelp ratings with user ratings in statistics
- Clearly label Yelp reviews vs. user reviews

### Yelp Review Data Structure
```typescript
interface YelpReview {
  id: string; // Yelp review ID
  rating: number; // 1-5
  text: string; // Review content
  time_created: string; // ISO timestamp
  user: {
    id: string;
    profile_url: string;
    image_url: string | null;
    name: string;
  };
  url: string; // Link to review on Yelp
}
```

### Implementation Strategy

1. **Separate Display Sections**
   - Show Yelp reviews in a separate section or with clear badges
   - Display Yelp logo prominently
   - Link each review to Yelp

2. **Separate Statistics**
   - User reviews: Calculate average from user-generated reviews only
   - Yelp reviews: Show separately (or use Yelp's rating from business table)
   - Do not combine ratings

3. **Sync Process**
   - Background job or manual sync endpoint
   - Fetch reviews via Yelp API: `GET /v3/businesses/{id}/reviews`
   - Store with `source = 'yelp'` and `yelp_fetched_at` timestamp
   - Delete Yelp reviews older than 24 hours before fetching new ones
   - Upsert based on `yelp_review_id`

4. **UI Components**
   - `YelpReviewCard.tsx` - Special card for Yelp reviews with logo
   - `YelpReviewSection.tsx` - Section showing Yelp reviews with compliance elements
   - Badge component to distinguish review sources

### Yelp API Client Function
```typescript
// Add to yelpClient.ts
export async function getYelpBusinessReviews(businessId: string): Promise<YelpReview[]> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    throw new Error('YELP_API_KEY environment variable is not set');
  }

  const response = await fetch(`${YELP_API_BASE}/businesses/${businessId}/reviews`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yelp API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.reviews || [];
}
```

### Sync Endpoint Implementation
- Fetch Yelp reviews for a business
- Delete existing Yelp reviews for that business (older than 24 hours)
- Insert new Yelp reviews
- Return synced reviews

### Display Strategy
**Option 1: Separate Sections**
- "User Reviews" section (with write review button)
- "Yelp Reviews" section (read-only, with Yelp branding)

**Option 2: Combined with Badges**
- Single review list
- Badge on each review: "User Review" or "Yelp Review"
- Filter/sort options to show one or both

**Recommended: Option 1** (separate sections) for better compliance and clarity.

---

## 7. Implementation Steps

### Phase 1: Database Setup
1. ✅ Create reviews table migration
2. ✅ Create review_helpful_votes table migration
3. ✅ Set up RLS policies
4. ✅ Create indexes
5. ✅ Test database structure

### Phase 2: API Development
1. ✅ Create review API routes
2. ✅ Implement authentication checks
3. ✅ Add validation
4. ✅ Test all endpoints

### Phase 3: UI Components
1. ✅ Create reusable components (StarRating, etc.)
2. ✅ Create ReviewCard component
3. ✅ Create WriteReviewModal component
4. ✅ Create ReviewSection component
5. ✅ Create ReviewStats component

### Phase 4: Integration
1. ✅ Integrate reviews into business detail page
2. ✅ Replace "Reviews Coming Soon" placeholder
3. ✅ Add review form submission
4. ✅ Add review display and sorting
5. ✅ Add helpful voting

### Phase 5: Polish & Testing
1. ✅ Add loading states
2. ✅ Add error handling
3. ✅ Add empty states
4. ✅ Test edge cases
5. ✅ Optimize performance
6. ✅ Add photo upload to storage bucket

---

## 8. Security Considerations

1. **Authentication Required**
   - Only authenticated users can create/edit/delete reviews
   - Only authenticated users can vote helpful

2. **Authorization**
   - Users can only edit/delete their own reviews
   - Users can only vote once per review

3. **Input Validation**
   - Rating: 1-5 integer
   - Content: Required, min length (e.g., 10 characters), max length (e.g., 5000 characters)
   - Title: Optional, max length (e.g., 100 characters)
   - Photos: Max count (e.g., 5), max file size, allowed types

4. **RLS Policies**
   - Enforce at database level
   - Prevent unauthorized access

5. **Rate Limiting** (Future)
   - Prevent spam reviews
   - Limit reviews per user per day

---

## 9. Data Flow

### Creating a Review
1. User clicks "Write a Review" button
2. Modal opens with review form
3. User fills in rating, content, optional title/photos
4. Form submits to `POST /api/reviews`
5. API validates input and checks authentication
6. API inserts review into database
7. UI updates to show new review
8. Review statistics update

### Displaying Reviews
1. Business detail page loads
2. Fetches reviews via `GET /api/reviews?businessId={id}`
3. Fetches review stats via `GET /api/reviews/stats?businessId={id}`
4. Displays review summary and list
5. User can sort, vote helpful, edit/delete own reviews

---

## 10. Storage Considerations

### Photo Storage
- Store review photos in Supabase Storage
- Create `review-photos` bucket
- Store with path: `{review_id}/{photo_filename}`
- Set up RLS policies for bucket
- Generate public URLs for display

---

## 11. Future Enhancements

1. **Review Replies**
   - Business owners can reply to reviews
   - Add `replies` table

2. **Review Moderation**
   - Flag inappropriate reviews
   - Admin moderation queue

3. **Review Analytics**
   - Track review trends
   - Business insights dashboard

4. **Review Notifications**
   - Notify business owners of new reviews
   - Notify users of replies

5. **Review Verification**
   - Verify user visited business (check-in system)
   - Show "Verified Visit" badge

---

## 12. Testing Checklist

- [ ] Create review (authenticated)
- [ ] Create review (unauthenticated) - should fail
- [ ] Create duplicate review - should fail
- [ ] Edit own review
- [ ] Edit someone else's review - should fail
- [ ] Delete own review
- [ ] Delete someone else's review - should fail
- [ ] Vote helpful
- [ ] Unvote helpful
- [ ] Display reviews with sorting
- [ ] Display review statistics
- [ ] Upload review photos
- [ ] Validate review content length
- [ ] Validate rating range
- [ ] Handle empty review list
- [ ] Handle business with no reviews
- [ ] Sync Yelp reviews for a business
- [ ] Sync Yelp reviews for all businesses
- [ ] Yelp reviews expire after 24 hours
- [ ] Yelp reviews display with logo and link
- [ ] Yelp reviews are read-only
- [ ] User reviews and Yelp reviews are displayed separately
- [ ] Statistics are calculated separately for user vs Yelp reviews

---

## Next Steps

1. Review this plan and make adjustments
2. Start with Phase 1: Database Setup
3. Create migration files
4. Test database structure
5. Proceed with API and UI implementation

