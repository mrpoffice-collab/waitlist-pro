# WaitlistPro - Viral Waitlist Builder

## Overview
WaitlistPro is a waitlist tool that shows founders their viral coefficient (K-factor) in real-time. The key differentiator is answering "Is my waitlist growing itself?"

## Key Features
1. **Viral Coefficient Tracking** - K-factor display (THE differentiator)
2. **Super-Advocate Identification** - Find top referrers
3. **Fraud Detection** - Block disposable emails, detect self-referrals
4. **Referral Rewards** - Tiered reward system
5. **Batch Invites** - Launch day automation

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Neon PostgreSQL (via Prisma)
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## Project Structure
```
waitlist-pro/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── w/[slug]/               # Public waitlist pages
│   │   │   ├── page.tsx            # Signup widget
│   │   │   ├── [code]/page.tsx     # Position check
│   │   │   └── verify/page.tsx     # Email verification
│   │   ├── dashboard/[id]/         # Creator dashboard
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   └── launch/page.tsx     # Launch day tools
│   │   └── api/
│   │       ├── waitlist/[slug]/    # Signup, verify APIs
│   │       └── dashboard/[id]/     # Dashboard data, invites
│   ├── components/
│   │   ├── widget/                 # Signup widget components
│   │   └── dashboard/              # Dashboard components
│   └── lib/
│       ├── db.ts                   # Prisma client
│       ├── viral-metrics.ts        # K-factor calculation
│       ├── fraud-detection.ts      # Email/IP validation
│       ├── disposable-domains.ts   # 500+ blocked domains
│       └── email.ts                # Resend integration
└── prisma/
    └── schema.prisma               # Database schema
```

## Database Models
- **User** - Creator accounts
- **Waitlist** - Campaigns with settings
- **Signup** - People on waitlists with referral tracking
- **Reward** - Tiered referral rewards
- **AnalyticsEvent** - Event tracking

## API Endpoints

### Public
- `GET /api/waitlist/[slug]` - Get waitlist info
- `POST /api/waitlist/[slug]/signup` - New signup
- `POST /api/waitlist/[slug]/verify` - Verify email

### Dashboard (auth required)
- `GET /api/dashboard/[id]` - Get metrics
- `POST /api/dashboard/[id]` - Export CSV
- `GET /api/dashboard/[id]/invite` - Invite status
- `POST /api/dashboard/[id]/invite` - Send batch invites

## Environment Variables
```env
DATABASE_URL="postgresql://..."
RESEND_API_KEY="re_..."
NEXT_PUBLIC_APP_URL="https://..."
```

## Key Metrics
- **K-Factor** = Total Referrals / Total Signups
  - K > 1.0 = viral growth
  - K > 1.5 = exceptional
- **Super-Advocates** = Top referrers by contribution %
- **Clean Rate** = % of signups without fraud flags

## Development
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Deployment
1. Create Neon database
2. Add DATABASE_URL to Vercel
3. Add RESEND_API_KEY
4. Add NEXT_PUBLIC_APP_URL
5. Deploy via Vercel CLI or Git
