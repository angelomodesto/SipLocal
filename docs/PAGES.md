# Page Definitions and Features

This document defines all pages in the SipLocal application, their purpose, layout, and features.

## Core Pages

### 1. Home Page (`/`)
**Purpose:** Main landing page displaying featured coffee shops and cafes in a card-based grid layout.

**Layout:**
- Header with logo, search bar, and navigation
- Main content area with business cards in a responsive grid
- Footer with links and information

**Key Features:**
- **Search Bar:** Prominent search at top (search by name, location, category)
- **Filter Options:** 
  - Filter by city (Brownsville, Harlingen, McAllen, etc.)
  - Filter by price range ($, $$, $$$, $$$$)
  - Filter by rating (4+ stars, 3+ stars, etc.)
  - Filter by categories (coffee, cafes, etc.)
- **Business Cards Grid:**
  - Responsive layout (1 column mobile, 2-3 columns desktop)
  - Each card shows:
    - Business image(s)
    - Business name
    - Star rating with review count
    - Price range ($, $$, etc.)
    - Categories/tags
    - AI-generated summary snippet (first 2-3 sentences)
    - "View Details" button
    - Like/favorite button (future)
- **Sorting Options:** Sort by rating, review count, popularity, newest
- **Pagination or Infinite Scroll:** Load more businesses as user scrolls

**User Actions:**
- Click search bar to search
- Click filter buttons to refine results
- Click business card to view details
- Click "View Details" to go to business detail page
- Scroll to load more businesses

**Visual Style:**
- Clean, modern design inspired by Yelp
- Card-based layout with subtle shadows
- Easy to scan and browse
- Mobile-responsive

---

### 2. Business List / Leaderboard Page (`/businesses`)
**Purpose:** Display all businesses in a ranked/leaderboard format with sorting options.

**Layout:**
- Similar to home page but focused on ranking
- Sort and filter controls at top
- Ranked business cards below

**Key Features:**
- **Sort Options:**
  - By rating (highest first)
  - By review count (most popular)
  - By name (alphabetical)
  - By city (location)
- **Leaderboard Display:**
  - Ranking numbers (1, 2, 3, etc.) on each card
  - Highlight top-rated businesses
- **Business Cards:** Same card format as home page
- **Filter Options:** Same as home page

**User Actions:**
- Select sort option
- Apply filters
- Click card to view details
- Navigate back to home

**Visual Style:**
- Similar to home page
- Emphasis on ranking numbers
- Clear visual hierarchy for top businesses

---

### 3. Business Detail Page (`/businesses/[id]`)
**Purpose:** Show comprehensive information about a single coffee shop or cafe.

**Layout:**
- Full-width layout
- Hero image/slideshow at top
- Business information section
- AI summary section (prominent)
- Map and location section
- Reviews section
- Photo gallery

**Key Features:**
- **Hero Section:**
  - Large business image or slideshow
  - Business name (large, prominent)
  - Star rating with review count
  - Price range
  - Categories/tags
  - "Claim Business" button (if owner)
  - Share button
- **AI Summary Section:**
  - Prominent display of AI-generated business summary
  - 2-3 paragraphs describing the business
  - Highlights key features, atmosphere, specialties
- **Location & Contact:**
  - Full address
  - Phone number (clickable)
  - Map showing location (Google Maps or similar)
  - Directions button
- **Business Information:**
  - Hours of operation (if available)
  - Website link (if available)
  - Social media links (if available)
- **Reviews Section:**
  - List of user reviews
  - Review ratings
  - Review text
  - Reviewer name and avatar
  - "Add Review" button (future)
- **Photo Gallery:**
  - Grid of business photos
  - "Show all photos" link
  - Click to view full-size
- **Related Businesses:**
  - "Similar businesses" suggestions
  - "Nearby businesses" section

**User Actions:**
- Scroll to view all sections
- Click "Claim Business" (if owner)
- Click map for directions
- Click phone number to call
- Click photos to view full-size
- Click "Add Review" (future)
- Navigate to related businesses

**Visual Style:**
- Full-width, immersive layout
- Clear sections with good spacing
- Prominent AI summary
- Easy-to-read information hierarchy

---

### 4. Search Results Page (`/search`)
**Purpose:** Display filtered business results based on user search query.

**Layout:**
- Similar to home page
- Search query displayed at top
- Active filters shown
- Results grid below

**Key Features:**
- **Search Query Display:**
  - Shows current search term
  - "X results found" count
  - Option to clear search
- **Active Filters:**
  - Shows applied filters as tags/chips
  - Can remove individual filters
  - "Clear all filters" option
- **Results Grid:**
  - Same card layout as home page
  - Filtered businesses only
- **No Results State:**
  - Friendly message when no results
  - Suggestions to try different search
  - Link back to home

**User Actions:**
- View search results
- Apply additional filters
- Remove filters
- Click card to view details
- Clear search to start over

**Visual Style:**
- Similar to home page
- Clear indication of active search
- Filter chips/tags for easy removal

---

### 5. User Profile Page (`/profile/[id]`) - Mock
**Purpose:** Display user profile with their activity, reviews, and favorites. (Mock for class)

**Layout:**
- User header with avatar and name
- Tabs for different sections
- Content sections below

**Key Features:**
- **Profile Header:**
  - User avatar (circular)
  - User name
  - Join date
  - Review count
  - Favorite businesses count
- **Tabs:**
  - Reviews (user's reviews)
  - Favorites (saved businesses)
  - Activity (recent actions)
- **Reviews Section:**
  - List of businesses user reviewed
  - Ratings given
  - Review text
- **Favorites Section:**
  - Grid of favorite businesses
  - Business cards (smaller)
- **Activity Section:**
  - Recent actions (added photos, reviews, etc.)
  - Timeline view

**User Actions:**
- View profile information
- Switch between tabs
- Click businesses to view details
- Edit profile (future)

**Visual Style:**
- Clean profile layout
- Card-based content sections
- Easy navigation between sections

---

### 6. Business Owner Dashboard (`/dashboard/business`) - Mock
**Purpose:** Allow business owners to view analytics and manage their business. (Mock for class)

**Layout:**
- Dashboard header
- Analytics cards/sections
- Business management section

**Key Features:**
- **Dashboard Header:**
  - Business name
  - Claim status ("Claimed" badge)
  - Quick stats summary
- **Analytics Section (Mock Data):**
  - Total views
  - Review count
  - Average rating
  - Rating breakdown (5 stars, 4 stars, etc.)
  - Popular times (visits by time of day)
  - Views over time (graph/chart)
- **Reviews Section:**
  - List of all reviews
  - Filter by rating
  - Response option (future)
- **Business Info Section:**
  - Current business information
  - Edit button (future)
- **Claim Status:**
  - If not claimed: "Claim Business" button
  - If claimed: "Manage Business" options

**User Actions:**
- View analytics
- Scroll through reviews
- Click "Claim Business" (if not claimed)
- Edit business info (future)
- Respond to reviews (future)

**Visual Style:**
- Dashboard-style layout
- Cards with statistics
- Charts/graphs for analytics
- Professional, data-focused design

---

## Optional Pages (Future)

### About Page (`/about`)
- Information about SipLocal
- Mission and vision
- Team information

### Contact Page (`/contact`)
- Contact form
- Support information
- Social media links

### Privacy Policy (`/privacy`)
- Privacy policy document
- Terms of service
- Data usage information

---

## Navigation Structure

### Main Navigation (Header):
- **Logo** → Home page
- **Browse** → Business list page
- **Leaderboard** → Leaderboard page
- **Search Bar** → Search results page
- **User Menu** → Profile / Dashboard / Logout

### Footer:
- Links to About, Contact, Privacy
- Social media links
- Copyright information

---

## Mobile Considerations

All pages should be:
- **Responsive:** Adapt to mobile screen sizes
- **Touch-friendly:** Large buttons and clickable areas
- **Fast-loading:** Optimized images and lazy loading
- **Easy navigation:** Hamburger menu for mobile
- **Thumb-friendly:** Important actions within thumb reach

---

## Page Flow Diagram

```
Home Page (/)
    ├── Search Results (/search)
    │   └── Business Detail (/businesses/[id])
    ├── Business List (/businesses)
    │   └── Business Detail (/businesses/[id])
    └── Business Detail (/businesses/[id])
        ├── User Profile (/profile/[id])
        └── Owner Dashboard (/dashboard/business)
```

