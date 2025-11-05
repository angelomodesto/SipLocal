# SipLocal

A coffee shop and cafe discovery platform for the Rio Grande Valley, South Texas. SipLocal helps users find and explore the best coffee shops and cafes in the region with a clean, Yelp-inspired interface featuring AI-generated summaries, ratings, and detailed business information.

## Project Overview

SipLocal is a Next.js web application that aggregates coffee shop and cafe data from the Yelp Fusion API, stores it in Supabase, and presents it through an intuitive, card-based interface. The platform features:

- **Business Discovery**: Browse coffee shops and cafes in Rio Grande Valley cities
- **AI Summaries**: AI-generated business summaries for quick insights
- **Leaderboard**: Ranked businesses by rating and popularity
- **Search & Filter**: Find businesses by name, location, price, and rating
- **Business Details**: Comprehensive business profiles with maps, reviews, and photos
- **User Profiles**: Mock user accounts with review history (for class project)
- **Business Owner Dashboard**: Mock dashboard for business owners (for class project)

## Tech Stack

- **Framework**: Next.js 15.5.5 (React 19)
- **Database**: Supabase (PostgreSQL)
- **API**: Yelp Fusion API
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Linting**: Biome

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Supabase account and project
- Yelp Fusion API key
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd siplocal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Yelp Fusion API
   YELP_API_KEY=your_yelp_api_key
   ```

4. **Set up the database**
   
   - Open your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Run the SQL script to create the `businesses` table

5. **Populate the database**
   
   Start the development server:
   ```bash
   npm run dev
   ```
   
   Then trigger the ingestion endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/yelp/ingest \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
siplocal/
├── database/
│   ├── schema.sql          # Database schema
│   └── README.md           # Database documentation
├── docs/
│   ├── USER_TYPES.md       # User type definitions
│   ├── PAGES.md            # Page definitions and features
│   ├── GIT_WORKFLOW.md     # Git workflow guide
│   └── wireframes/
│       └── WIREFRAMES.md   # Wireframe descriptions
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── yelp/
│   │   │       └── ingest/ # Yelp data ingestion endpoint
│   │   ├── supabase-test/  # Test page for database
│   │   └── ...
│   └── lib/
│       ├── supabaseClient.ts    # Client-side Supabase client
│       ├── supabaseServer.ts    # Server-side Supabase client
│       └── yelpClient.ts        # Yelp API client
├── public/                  # Static assets
└── ...
```

## Features

### Current Features
- ✅ Database schema for businesses
- ✅ Yelp Fusion API integration
- ✅ Data ingestion from Yelp API
- ✅ Supabase database storage
- ✅ Test page for viewing businesses

### Planned Features (In Progress)
- 🔄 Home page with business cards
- 🔄 Business detail pages
- 🔄 Search functionality
- 🔄 Filtering and sorting
- 🔄 Leaderboard view
- 🔄 AI summary integration
- 🔄 User profiles (mock)
- 🔄 Business owner dashboard (mock)

## Documentation

- **[User Types](docs/USER_TYPES.md)** - User roles and capabilities
- **[Pages](docs/PAGES.md)** - Page definitions and features
- **[Wireframes](docs/wireframes/WIREFRAMES.md)** - Visual layout descriptions
- **[Git Workflow](docs/GIT_WORKFLOW.md)** - Branch management and merging guide
- **[Database Schema](database/README.md)** - Database setup and migrations

## Branch Strategy

This project uses a feature branch workflow:

- **`main`**: Production-ready, stable code
- **`database_test_setup`**: Database schema and Yelp integration
- **`landing_page`**: UI/landing page work
- **Feature branches**: One branch per feature, merge when MVP ready

See [Git Workflow Guide](docs/GIT_WORKFLOW.md) for detailed branch management instructions.

## API Endpoints

### Yelp Ingestion
- **POST** `/api/yelp/ingest` - Ingest businesses from Yelp API
  - Body: `{ "cities": ["McAllen, TX"], "maxResultsPerCity": 50 }`
  - Default: Processes all Rio Grande Valley cities

### Test Pages
- **GET** `/supabase-test` - Test page to view businesses from database

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

## Contributing

This is a class project. For development workflow, see [Git Workflow Guide](docs/GIT_WORKFLOW.md).

## License

This project is for educational purposes.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Yelp Fusion API Documentation](https://www.yelp.com/developers/documentation/v3)
