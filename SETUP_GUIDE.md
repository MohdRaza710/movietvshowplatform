# CineVault - Setup & Deployment Guide

## 🎬 Welcome to CineVault

A premium **Movie & TV Show Platform** with social features, reviews, watchlists, and activity feeds. Built with Next.js 15, Supabase, and beautiful animations.

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
npm install date-fns
```

### Step 2: Get API Keys

1. **TMDB API Key**:
   - Go to https://www.themoviedb.org/settings/api
   - Create a free account
   - Generate API key

2. **Supabase Project**:
   - Go to https://supabase.com
   - Create a new project
   - Copy `Project URL` and `Anon Key`

### Step 3: Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-key
NEXT_PUBLIC_TMDB_IMAGE_URL=https://image.tmdb.org/t/p/
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Database Setup

In **Supabase SQL Editor**:

1. Create new query
2. Copy entire content of `supabase/migrations/001_init.sql`
3. Click "Run"

This creates:
- ✅ users table
- ✅ watchlist table
- ✅ reviews table
- ✅ review_likes table
- ✅ follows table
- ✅ Row Level Security policies
- ✅ Indexes for performance

### Step 5: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 🎉

## 📱 Using the App

### 1. **Sign Up / Log In**
   - Click "Sign In" in header
   - Email, Google, or GitHub
   - Profile created automatically

### 2. **Browse Movies**
   - Home page shows trending/popular
   - Search bar for specific titles
   - Click any card to see details

### 3. **Review & Rate**
   - Open movie/TV detail page
   - Scroll to "Reviews & Ratings"
   - Write review (1-10 star rating)
   - Like other reviews

### 4. **Watchlist ("My Vault")**
   - Add items with "+" button on cards
   - Organize by status: Plan to Watch, Watching, Completed, Dropped
   - Add personal ratings & notes
   - View statistics

### 5. **Social Features**
   - Visit user profiles
   - Follow other users
   - Activity feed shows what friends reviewed
   - Share movies on Twitter/Facebook

## 🎨 File Structure Explained

```
CineVault/
│
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home with carousels
│   │   ├── movie/[id]/page.tsx      # Movie detail
│   │   ├── tv/[id]/page.tsx         # TV show detail
│   │   ├── watchlist/page.tsx       # My Vault
│   │   ├── profile/[id]/page.tsx    # User profile
│   │   ├── search/page.tsx          # Search results
│   │   ├── feed/page.tsx            # Activity feed
│   │   ├── layout.tsx               # App layout
│   │   └── globals.css              # Theme & animations
│   │
│   ├── components/
│   │   ├── Header.tsx               # Navigation
│   │   ├── MediaCard.tsx            # Movie/TV card
│   │   ├── MediaCarousel.tsx        # Scrollable list
│   │   ├── ReviewForm.tsx           # Write review
│   │   ├── ReviewCard.tsx           # Display review
│   │   ├── ActivityFeed.tsx         # Social feed
│   │   ├── HeroSection.tsx          # Banner
│   │   ├── Providers.tsx            # Auth setup
│   │   └── ui/                      # shadcn components
│   │
│   ├── actions/index.ts             # Server functions
│   │                                 # (auth, database ops)
│   ├── store/index.ts               # State management (Zustand)
│   ├── types/
│   │   ├── index.ts                 # Domain types
│   │   └── database.ts              # Supabase types
│   │
│   └── lib/
│       ├── supabase.ts              # Supabase client
│       └── tmdb.ts                  # Movie API
│
├── supabase/
│   └── migrations/
│       └── 001_init.sql             # Database setup
│
├── .env.local                       # Your secrets (DO NOT COMMIT)
└── package.json                     # Dependencies
```

## 🔧 How Features Work

### Authentication Flow
1. User clicks "Sign In"
2. Supabase Auth handles login
3. User profile auto-created in `users` table
4. `useAuthStore` tracks session globally

### Watchlist Logic
1. Click "+" on movie card → `addToWatchlist()` action
2. Creates entry in `watchlist` table with status
3. `useWatchlistStore` updates UI instantly (optimistic)
4. Next page load syncs from database

### Review System
1. Fill form with rating (1-10) and text
2. `createReview()` saves to `reviews` table
3. Average rating calculated on detail page
4. Other users can like your review
5. You can edit/delete your own reviews

### Social Following
1. Visit user profile
2. Click "Follow" button
3. Creates entry in `follows` table
4. Activity feed shows their reviews

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Supabase environment variables missing" | Check `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| "Can't sign in" | Verify Supabase project is active and Auth enabled |
| "No movies showing" | Check TMDB API key is valid and enabled |
| "Watchlist not saving" | Check RLS policies: Run `001_init.sql` again |
| "404 on movie page" | Movie ID might be invalid or TMDB API down |

## 📦 Production Deployment

### Deploy to Vercel (Easiest)

```bash
git push origin main
```

Then on Vercel dashboard:
1. Click "New Project"
2. Select GitHub repo
3. Set Environment Variables
4. Click Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
NEXT_PUBLIC_TMDB_API_KEY=prod-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run (`001_init.sql`)
- [ ] Supabase Auth configured (Email, Google, GitHub)
- [ ] TMDB API key active
- [ ] `.env.local` is in `.gitignore`
- [ ] Run `npm run build` locally (no errors)
- [ ] Test login/reviews/watchlist

## 🚀 Advanced Configuration

### Custom Domain
1. In Vercel: Settings → Domains
2. Add custom domain
3. Update DNS records
4. Update `NEXT_PUBLIC_APP_URL` in env vars

### Enable OAuth Providers (Google/GitHub)

In Supabase:
1. Authentication → Providers
2. Enable "Google" or "GitHub"
3. Add OAuth credentials
4. Users can now sign in with those methods

### Database Backups

Supabase automatically backs up daily. To export:
1. Dashboard → Database → Backups
2. Click "Create backup"
3. Download SQL when ready

## 📊 Database Performance

The app includes indexes on:
- `watchlist.user_id`
- `reviews.user_id`
- `reviews.media_type, media_id`
- `follows.follower_id, following_id`

This ensures fast queries for:
- Loading user's watchlist
- Fetching reviews for a movie
- Finding followers/following

## 🎯 Next Steps

1. **Customize Theme**:
   - Edit `src/app/globals.css`
   - Change colors in `tailwind.config.ts`

2. **Add Features**:
   - Lists (create custom lists)
   - Notifications (email alerts)
   - Recommendations (ML-based)

3. **Monitor Performance**:
   - Use Vercel Analytics
   - Check Supabase metrics
   - Monitor API rate limits

## 📞 Need Help?

- Check Supabase docs: https://supabase.com/docs
- TMDB API docs: https://developer.themoviedb.org
- Next.js docs: https://nextjs.org/docs
- Create GitHub issue for bugs

---

**Happy coding! 🚀 Build something amazing with CineVault!**
