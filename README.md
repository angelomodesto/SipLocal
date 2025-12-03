# SipLocal

SipLocal offers a user-friendly and community-driven way to discover coffee shops and cafés that reflect the culture in your local area.  
The goal is to give users an easily accessible and aesthetic way to explore local cafés without the clutter.

---

## Project Overview
This project is for the **CSCI 3340 Final Project**.
We are building it using Agile methods and following the full software development process.

---

## Goals
- Show cafés based on user location within a certain radius  
- Display photos, hours, ratings, and short summaries  
- Keep the interface simple and mobile friendly  
- Use CRUD operations for café data (create, read, update, delete)  
- Build a working prototype by the second project deadline

---

## AI & Data Summary
SipLocal uses simple AI tools to summarize and rank local cafés based on real data.

### How It Works
1. **Data Collection (via Yelp API)**
   - The app uses Yelp’s public Fusion API to gather local café data, including name,       rating, category, address, and images.  
   - This data is collected once through a setup script and stored locally as seed          data for development — ensuring the prototype works offline and without live API       calls.  

2. **AI Summarization**
   - AI or text analysis tools create short summaries from review text  
   - Example: “Cozy vibe, great espresso, space for studying.”
   - (llm model is tentative)

3. **Ranking System**
   - Cafés are ranked using a custom “SipLocal Score” that combines Yelp ratings,           review sentiment, and local popularity metrics (like views or favorites). 
   - The ranking updates dynamically within the app as users interact — helping             surface the most loved local spots for students and coffee lovers alike.

---

## Why It’s Different
Unlike Google or Yelp, SipLocal:
- Focuses on *independent cafés* only  
- Summarizes reviews instead of showing long text  
- Highlights the overall *vibe* of each place  

---

## Main Features
- ✅ Café list view with filtering (city, price, rating, category)
- ✅ Café detail view with photos, ratings, and AI summaries
- ✅ User authentication (sign up, login, password reset)
- ✅ User reviews and ratings system
- ✅ Yelp reviews integration
- ✅ Pin board for saving favorite cafés
- ✅ User profiles
- ✅ Search functionality
- ✅ Responsive, mobile-friendly design  

---

## Agile Plan
*(Tentative)*
*(Features still need to be finalized and divided into sprints)*

| Sprint | Dates | Focus |
|--------|--------|--------|
| Sprint 0 | Oct 1 – Oct 17 | Setup repo, README, basic design, database idea |
| Sprint 1 | Oct 18 – Nov 14 | Basic working prototype with data and simple UI |
| Sprint 2 | After Nov 14 | Add polish, filters, summaries, and testing |

---

## Team Roles
| Name | Role |
|------|------|
| Bethany Tijerina | TBD |
| Angelo Modesto | TBD |
| Tamara Pena | TBD |

---

## Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **External APIs:** Yelp Fusion API
- **Deployment:** Vercel

---

## Important Links
- **GitHub Repository:** [https://github.com/angelomodesto/SipLocal](https://github.com/angelomodesto/SipLocal)
- **Local Development URL (for running the app):** `http://localhost:3000/`

> Note: The app runs locally on this URL after running `npm run dev` in a Next.js environment.  
> This link will not work for others unless deployed online.

---

## Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Yelp Fusion API key (optional, for data ingestion)

### Installation

```bash
# Clone the repo
git clone https://github.com/angelomodesto/SipLocal.git
cd SipLocal

# Install dependencies
npm install

# Set up environment variables
# Copy .env.local.example to .env.local and fill in your values
cp .env.local.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
YELP_API_KEY=your_yelp_api_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup

See `database/` folder for SQL migration files. Run them in your Supabase SQL editor in order.

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
