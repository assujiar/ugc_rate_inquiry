# Rate Request App

This repository contains a lightweight internal ticketing web application for requesting logistics rates. It is designed for B2B scenarios where Sales/Marketing teams request quotes from various Operations teams. The app uses **Next.js (App Router)** with **TypeScript**, **TailwindCSS** and **Supabase** (PostgreSQL, Auth, Storage) with row-level security (RLS).

## Features (MVP)

### Auth & RBAC

- Email/password authentication via Supabase Auth.
- Profiles table stores user roles (`sales`, `marketing`, `domestics_ops`, `exim_ops`, `import_dtd_ops`, `admin`).
- Row level security policies enforce access:
  - Requesters can only see and create their own tickets.
  - Ops roles can see/modify tickets routed to their scope.
  - Admin can access everything and manage roles/SLA.

### Ticketing

- Mobile‐first wizard to create a ticket: choose scope, service type, origin/destination, shipment summary, notes.
- Automatic routing based on scope → `ops_owner` column.
- Ticket status lifecycle: draft, submitted, assigned, in progress, quoted, closed, etc.
- Ticket events log records status changes and actions.
- Quotes with optional line items.

### SLA & Analytics

- Admin page to manage SLA profiles per scope/service type (target first response time, quote time, at–risk ratio).
- Business hours profiles and escalation rules (placeholders).
- Simple analytics page (admin) showing totals and SLA breach count.

### Settings

- User management (admin): view all users and change their roles.

## Project Structure

```
rate-request-app/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with Supabase provider
│   ├── page.tsx          # Dashboard/home
│   ├── login/page.tsx    # Login form
│   ├── tickets/
│   │   ├── new/page.tsx  # New ticket wizard
│   │   └── [id]/page.tsx # Ticket detail
│   ├── ops/queue/page.tsx        # Ops queue list
│   ├── analytics/page.tsx        # Analytics dashboard (admin)
│   └── settings/
│       ├── sla/page.tsx   # Manage SLA profiles (admin)
│       └── users/page.tsx # Manage user roles (admin)
├── components/           # Reusable UI components (navbar, button, glass card)
├── lib/                  # Supabase clients and types
├── styles/
│   └── globals.css       # CSS variables & Tailwind imports
├── supabase/
│   ├── config.toml       # Supabase local dev config
│   └── migrations/
│       ├── 001_init.sql  # Schema definitions & RLS policies
│       └── 002_seed.sql  # Seed data
├── .env.example          # Example environment variables
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind config with custom tokens
├── tsconfig.json         # TypeScript config
└── README.md             # This file
```

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher.
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional but recommended for local Postgres).

### 1. Setup Supabase

1. Create a new Supabase project at https://app.supabase.com/. Note the project URL and anon key.
2. In the Supabase dashboard, go to **SQL Editor** and run the migration files in order:
   1. Upload `supabase/migrations/001_init.sql` and execute it.
   2. Upload `supabase/migrations/002_seed.sql` and execute it.
3. Create a **private storage bucket** named **`attachments`** for uploading ticket attachments.
4. Configure storage policies (via the dashboard) to restrict upload/download based on ticket access. A typical policy looks like:
   ```sql
   -- Allow authenticated users with access to a ticket (object metadata contains ticket_id) to read
   (auth.role() = 'authenticated') AND (
     exists(
       select 1 from public.tickets t
       where t.id = (storage.metadata ->> 'ticket_id')::uuid
       and (
         t.created_by = auth.uid() or t.assigned_to = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
       )
     )
   )
   ```

5. In the **Authentication** settings, enable email/password login. Optionally set up SMTP to send magic links.

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** `SUPABASE_SERVICE_ROLE_KEY` is **sensitive** and should only be used in server-side code (never exposed to the browser). In this template it is not used directly in client components.

### 3. Install & Run

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. Deploy to Vercel

1. Push this repository to GitHub.
2. Import the project into Vercel and set the environment variables in the Vercel dashboard (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`).
3. Choose the **Next.js** framework preset. Vercel will build and deploy automatically.

## Assumptions & Notes

- This project focuses on demonstrating the core structure and RLS policies. Further refinement (e.g. file uploads, notifications, advanced analytics) can be built on top.
- Ticket status transitions and SLA evaluation logic are simplified; for production use you may want database functions to update `ticket_events` automatically on status changes.
- To generate updated TypeScript types from your Supabase schema run:
  ```bash
  supabase gen types typescript --local > lib/types.ts
  ```
- Use the **Settings > Users** page to promote a user to `admin` so they can access the admin pages. New users default to the `sales` role via trigger.

---

Happy shipping! 🚢