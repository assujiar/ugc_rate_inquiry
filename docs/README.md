# UGC Dashboard

`ugc_dashboard` is a unified web application built with **Next.js 16** (App Router) and **Supabase** that serves as a centralized dashboard for multiple business domains, including sales, marketing, operations, finance, and master data. The project follows a modular architecture with strong emphasis on type safety, role‑based access control (RBAC), and responsive user experience.

## Features

- **Authentication & Authorization** – Uses Supabase Auth with JWT stored in secure cookies. Role‑based permissions are enforced both client‑side and server‑side.
- **Modular Dashboards** – Separate dashboards for each domain (sales, marketing, operations, finance) with domain‑specific KPIs, charts and tables.
- **Marketing v2** – Enhanced marketing analytics including offline events, SEO/SEM campaigns, website analytics, digital channels, content pieces, attribution, and KPI panels.
- **Reusable Components** – A design system of UI primitives (buttons, inputs, modals, tables, etc.) implemented with Tailwind CSS and React.
- **Filters & Presets** – URL‑synchronized filters with support for local presets (planned).
- **Supabase Migrations** – Database schema, policies, and seed data are stored as versioned SQL scripts under `supabase/migrations`, `supabase/policies` and `supabase/seed`.
- **Deployment Ready** – The repository includes configuration files and documentation for running locally and deploying to Vercel.

## Getting Started

1. **Prerequisites:** Ensure you have Node.js 18+, the Supabase CLI, and Docker installed. See `docs/setup-local.md` for details.
2. **Install Dependencies:** Run `npm install` to install Node.js packages (internet access required). If network access is restricted, you may need to provide your own `node_modules` or use an alternative installation method.
3. **Configure Environment:** Copy `.env.example` to `.env.local` and fill in Supabase credentials.
4. **Run Supabase:** Initialize and start Supabase locally using `supabase init` and `supabase start`. Apply migrations and seed data as needed.
5. **Run the App:** Start the development server with `npm run dev` and visit [http://localhost:3000](http://localhost:3000).

For more detailed instructions see the `docs` directory:

- `docs/setup-local.md` – Step‑by‑step guide for local development.
- `docs/deploy-vercel.md` – How to deploy the app to Vercel.
- `docs/web-architecture-blueprint.md` – Architectural overview and design decisions.
- `docs/traceability-matrix.md` – Mapping between documentation requirements and code implementation.

## Caveats

Due to the absence of the original project specifications, many assumptions have been made during the implementation. Placeholder SQL files and stubbed API responses are provided as scaffolding; they must be replaced with real schema definitions and business logic once the authoritative documentation becomes available. See `docs/gaps-and-assumptions.md` for details.

## License

This project is provided as is for demonstration purposes and may require additional licensing considerations for production use.