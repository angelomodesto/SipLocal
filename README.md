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
1. **Data Collection**
   - Collect café information from official websites and public Google results  
   - Includes details like name, hours of operation, about text, and review snippets  

2. **AI Summarization**
   - AI or text analysis tools create short summaries from review text  
   - Example: “Cozy vibe, great espresso, space for studying.”

3. **Ranking System**
   - Rank cafés by rating, sentiment from reviews, and popularity (views)  
   - Produces a “SipLocal Score” showing top cafés nearby  

---

## Why It’s Different
Unlike Google or Yelp, SipLocal:
- Focuses on *independent cafés* only  
- Summarizes reviews instead of showing long text  
- Removes ads and clutter  
- Highlights the overall *vibe* of each place  

---

## Main Features
- Café list view (with distance, photo, and rating)  
- Café detail view (about, hours, highlights, summary)  
- Location detection and radius search  
- Popularity display (ratings and views)  

---

## Agile Plan
*(Tentative)*

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
**TBD (to be decided by the team)**  
Possible options: React, Next.js, Node.js, Express, PostgreSQL, Supabase, Tailwind, etc.

---

## Setup
```bash
# Clone the repo
git clone https://github.com/<your-org>/SipLocal.git
cd SipLocal

# Install dependencies (once chosen)
npm install

# Run the project
npm run dev
