# Idea Radar

SaaS idea discovery platform that analyzes pain points from various sources and generates actionable business ideas.

Deployed on Vercel: https://idea-radar-lyart.vercel.app/

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret

   # OpenRouter AI
   OPENROUTER_API_KEY=your_openrouter_key

   # Resend Email
   RESEND_API_KEY=your_resend_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com

   # Application
   NEXT_PUBLIC_WEB_APP_URL=http://localhost:3000/

   # Cron Job Security
   CRON_SECRET=your_secret_token
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Running the Idea Generation Job

The idea generation job can be triggered manually via API:

```bash
curl -X POST http://localhost:3000/api/jobs/ideas/generate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Important:** 
- Replace `YOUR_CRON_SECRET` with the value of `CRON_SECRET` from your `.env` file
- This endpoint is protected and requires the Bearer token for authentication
- In production, this is triggered by Vercel Cron shedule

The job will:
1. Fetch content from configured sources (Reddit, etc.)
2. Analyze pain points using AI
3. Generate or improve SaaS ideas
4. Save results to the database
5. Send email digests to subscribers


## Future development ideas
- Integrate other sources. Like Twitter, Hacker News, etc.
  - Another interesting sources are Apps marketplaces and review platforms (Like G2). Where people might share their pain points and solutions directly
- Combine volume data (like google trends) with detailed explanation of the problem (like youtube video transcriptions). It will allow improve estimate & potential to generate more sophisticated ideas/insides
- Potentialy give ability for customer to personalize their idea generation by allowing define custome themes and sources
    - themes usually too general and might overlap. Maybe custoemr would like to track something in between
    - People ususully have thair heros or resources they trust. Maybe we can use that to generate ideas. Like site RSS, youtube channel, twitter account, etc.
- Allow customer to run related market/compatitors research to fill the gaps in undestanding
    - potential monetization point
- For the idea define potential castomer portrait and integrate with outreach tools/agencies
    - based on customer portrait platform can show amount of potential customers thay can reach right away
    - potential monetization point


