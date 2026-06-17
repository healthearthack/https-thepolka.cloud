# The Back Room

A members-only, Twitter-style feed ("Classic") living at
**twitter-classic.thepolka.cloud**, with a toggle to "X" that opens x.com in
a new tab. Built as a real, working full-stack app:

- **Frontend**: React + Vite
- **Auth & Database**: Supabase (free tier) — real email verification
- **Hosting**: Vercel (free tier)

Accounts require a username, a real email (verified via link), and a
password. After first login, users see a one-time survey asking where they
get their news from, for lightweight aggregate market-research data.

---

## 1. Create your Supabase project

1. Go to https://supabase.com and create a free account / project.
2. Open **SQL Editor** in the left sidebar.
3. Open `supabase_schema.sql` from this repo, copy its full contents, paste
   into the SQL Editor, and click **Run**. This creates:
   - `profiles` (username + email per user)
   - `posts` (the feed)
   - `survey_responses` (the one-time news-source answer)
   - A trigger that auto-creates a profile row when someone signs up
   - Row-level security policies for all of the above
4. Go to **Authentication -> Providers -> Email** and confirm **"Confirm
   email" is ON** (this is the default — leave it on for real verification).
5. Go to **Authentication -> URL Configuration** and set:
   - **Site URL**: `https://twitter-classic.thepolka.cloud`
   - **Redirect URLs**: add `https://twitter-classic.thepolka.cloud/**`
   (this makes the verification email link send users back to your live
   site instead of localhost)
6. (Optional, recommended) Go to **Authentication -> Email Templates** and
   customize the "Confirm signup" template — at minimum, update the sender
   name so it doesn't look like generic Supabase.
7. Go to **Project Settings -> API**. Copy:
   - **Project URL**
   - **anon public** key

---

## 2. Configure the app

1. In the project folder, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Paste your Supabase URL and anon key into `.env`:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Install dependencies and run locally:
   ```
   npm install
   npm run dev
   ```
4. Open the printed local URL. Create an account — you'll get a "check your
   email" screen. Click the link in the email, then come back and sign in.
   You'll see the one-time news-source survey, then the feed.

   Note: while testing locally, the email link will point to
   `https://twitter-classic.thepolka.cloud` (per the Site URL setting above)
   rather than localhost. Either temporarily set the Site URL to your local
   dev URL while testing, or just test the full flow after deploying.

---

## 3. Deploy to Vercel (free)

1. Push this project to a GitHub repository.
2. Go to https://vercel.com, sign in with GitHub, and click **Add New ->
   Project**. Select your repo.
3. Vercel auto-detects Vite. Before deploying, add your environment
   variables under **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. You'll get a temporary URL like
   `https://the-back-room.vercel.app` — confirm it works end to end
   (sign up, verify email, survey, post).

---

## 4. Point twitter-classic.thepolka.cloud at it

Since `thepolka.cloud` already exists, the cleanest setup is a **subdomain**:

1. In your Vercel project, go to **Settings -> Domains** and add
   `twitter-classic.thepolka.cloud`.
2. Vercel will give you a DNS record to add — typically a **CNAME** record:
   ```
   Type:  CNAME
   Name:  twitter-classic
   Value: cname.vercel-dns.com
   ```
3. Add that record at wherever `thepolka.cloud`'s DNS is managed (your
   domain registrar or DNS host).
4. Wait for DNS to propagate (usually minutes, sometimes up to an hour).
   Vercel will show the domain as "Valid" once it's live and auto-issues
   HTTPS.
5. Update Supabase's **Site URL** and **Redirect URLs** (step 1.5 above) to
   match the final domain if you used a placeholder.

### Linking it from your homepage

Add a nav link on thepolka.cloud's existing nav (alongside Home / Projects /
About / Contact):

```html
<a href="https://twitter-classic.thepolka.cloud">Twitter Classic ☁</a>
```

The Back Room's footer links back to thepolka.cloud, so visitors can move
between the two easily in either direction.

---

## How the "X" toggle works

Clicking the **X** tab in the nav opens a modal explaining that X is a
separate destination, with a button that opens **x.com in a new tab**. The
Back Room itself never redirects away — it's the home base; X is presented
as "stepping outside."

---

## The news-source survey

After a user's first successful login, they're shown a one-time modal:
"Where do you usually get your news from?" with options Online, TV, Print,
and Word of mouth. Their answer is stored in `survey_responses`, tied to
their user id but not shown publicly. To view aggregate results, run this in
the Supabase SQL Editor:

```sql
select news_source, count(*) as responses
from survey_responses
group by news_source
order by responses desc;
```

---

## Moderation notes

Email verification cuts down on throwaway/bot signups significantly, but for
a public-facing site you may still want, eventually:
- Rate limiting on posts (e.g. via a Supabase Edge Function)
- A report/block mechanism
- Manual moderation via the Supabase table editor — you can delete any row
  (post, profile, or auth user) directly from the dashboard
