# User Types and Roles

This document defines the different types of users in the SipLocal application and their capabilities.

## User Types

### 1. Regular Users (Visitors)
**Who they are:** People browsing for coffee shops and cafes in the Rio Grande Valley

**What they can do:**
- Browse and search for businesses
- View business details (ratings, hours, location, photos)
- See AI-generated summaries of businesses
- View user reviews and ratings
- Filter businesses by city, price, rating, categories
- See leaderboard/ranked businesses
- (Future) Add reviews and ratings
- (Future) Save favorite businesses

**What they can't do:**
- Edit business information
- Claim businesses
- Access admin features

**Mock data for class:**
- User profiles with names, avatars, review counts
- Sample reviews and ratings
- User activity history

---

### 2. Business Owners
**Who they are:** Owners or managers of coffee shops and cafes who want to claim and manage their business listing

**What they can do:**
- Claim their business (mock verification process)
- View their business dashboard
- See analytics (mock data for class):
  - View counts
  - Review counts
  - Average rating
  - Popular times
- View customer reviews
- (Future) Respond to reviews
- (Future) Update business information (hours, photos, menu)

**What they can't do:**
- Delete their listing
- Manipulate ratings
- Access other businesses' dashboards
- Admin functions

**Mock data for class:**
- Business owner accounts linked to specific businesses
- Mock claim verification process
- Sample analytics dashboard data

---

### 3. Administrators
**Who they are:** System administrators who manage the platform

**What they can do:**
- Manage all business listings
- Moderate content (reviews, photos)
- Verify business owner claims
- View system-wide analytics
- Manage user accounts
- Edit business information directly

**What they can't do:**
- (N/A - Admins have full access)

**Mock data for class:**
- Admin dashboard with mock statistics
- Sample moderation queue
- System-wide analytics

---

## User Flow Examples

### Regular User Flow:
1. Land on home page
2. Browse business cards or search
3. Click on a business card
4. View business details (AI summary, ratings, reviews)
5. See location on map
6. View photos

### Business Owner Flow:
1. Search for their business
2. Click "Claim Business" button
3. Fill out claim form (mock)
4. Access business dashboard
5. View analytics and reviews

### Admin Flow:
1. Access admin dashboard
2. View all businesses
3. Moderate reviews
4. Verify business claims
5. Manage system settings

---

## Authentication (Mock for Class)

Since this is for a class project and not a live application, we'll use mock authentication:

- **Mock users:** Pre-defined user accounts in the database
- **Mock login:** Simple selection interface (no real authentication)
- **Mock sessions:** Browser-based session storage
- **Mock claims:** Simulated business claim process

This allows demonstration of all user types without implementing full authentication infrastructure.

---

## Future Enhancements (Post-Class)

If this project becomes a real application:
- Real authentication (email/password, OAuth)
- Email verification for business claims
- Payment processing for business features
- Real-time notifications
- Advanced analytics for business owners

