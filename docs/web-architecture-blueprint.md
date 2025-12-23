# Web Architecture Blueprint

> **Note:** The original documentation referenced by the project brief was not available in the provided workspace. This document represents a reasonable architectural blueprint based on common patterns for building a multi‑tenant dashboard application using **Next.js 16** with the **App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase**. It serves as a living document and may require updates once the official documentation becomes available.

## Overview

The `ugc_dashboard` is a web application designed to provide a unified interface for multiple business domains: sales, marketing, operations, finance, and master data. The system is built on a modern, serverless architecture that leverages [Next.js 16](https://nextjs.org/docs) for the frontend and API layer, with [Supabase](https://supabase.com/) acting as the backend database, authentication provider, and storage layer.

### Key Architectural Principles

1. **App Router with Server Components:** The application uses Next.js 16’s App Router to organize pages and API routes. Server Components are leveraged for data‑fetching and rendering where appropriate to reduce client‑side overhead.
2. **Type‑Safe API and Data Models:** All interfaces, API responses, and database interactions are strictly typed using TypeScript and Zod for runtime validation where needed.
3. **Role‑Based Access Control (RBAC):** Permissions are enforced both in the frontend (to hide or disable UI elements) and on the server (via API route handlers and row‑level security in Supabase).
4. **Row‑Level Security (RLS):** All domain tables in Supabase have RLS enabled. Policies ensure users only read or mutate rows they are authorized to access.
5. **Modular Design:** Each domain (sales, marketing, ops, finance, master data) is encapsulated in its own module with clear boundaries. Shared components (e.g., UI primitives, layout, filters) are extracted into reusable pieces.
6. **Progressive Enhancement:** Although many views require JS for interactivity, the core pages render meaningful markup without JS to improve performance and accessibility.
7. **Responsive and Accessible UI:** Tailwind CSS is used to implement a light‑themed UI with an accent color of `#ff4600`. The layout adapts fluidly across desktop, tablet, and mobile breakpoints.

## High‑Level Architecture

```
                       ┌─────────────────────────┐
                       │       Browser           │
                       └──────────────┬──────────┘
                                      │
                                      ▼
                     ┌──────────────────────────────────┐
                     │       Next.js 16 (App Router)    │
                     │  - React/TypeScript Frontend     │
                     │  - API Route Handlers (Server)   │
                     │  - proxy (Auth, RBAC)       │
                     └──────────────┬───────────────────┘
                                      │
                                      ▼
                  ┌─────────────────────────────────────────┐
                  │              Supabase                   │
                  │  - PostgreSQL Database with RLS        │
                  │  - Auth (JWT based)                    │
                  │  - Storage (object storage)            │
                  │  - Realtime (optional)                 │
                  └─────────────────────────────────────────┘
```

## Application Modules

Each module corresponds to a business domain. Pages and API routes are grouped under `/app/(protected)/dashboard/<domain>` and `/app/api/<domain>` respectively.

| Module       | Purpose                                                      | Key Features                                                                 |
|--------------|--------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Sales**    | Manage leads, pipeline, activities, and reasons taxonomy.    | Overview metrics, pipeline funnel, activity timeline, and reason taxonomy.    |
| **Marketing**| Provide detailed marketing analytics across channels.        | Offline events, SEO/SEM campaigns, website analytics, digital channels, content pieces, attribution, and KPI dashboards. |
| **Operations**| Monitor service tickets, SLAs, and operational KPIs.        | Ticket queues, SLA compliance, workflow stages, and aggregated ops metrics.    |
| **Finance**  | Track financial health through margins and AR aging.         | Overview of key metrics, accounts receivable aging buckets, margin analysis.   |
| **Master Data**| Maintain reference data used across other modules.         | CRUD interfaces for taxonomy tables (e.g., sales stages, expense categories).  |
| **RBAC & Audit**| Define roles/permissions and capture user actions.         | Role and permission management, audit log viewer.                              |

## Routing Structure

The App Router organizes pages as follows:

* **Public Routes**
  * `/` – Landing page; redirects users to `/app` if authenticated or to `/login` otherwise.
  * `/login` – Sign‑in page using Supabase auth.
  * `/logout` – Server route; signs the user out and redirects to `/login`.

* **Protected Routes (require authentication and appropriate role)**
  * `/app` – Default dashboard after login.
  * `/app/dashboard/<domain>` – Domain‑specific dashboards for director, admin, sales, marketing, operations, and finance.
  * `/app/modules/<module>` – CRUD or configuration pages (e.g., master data, users, roles, audit logs, approvals, evidence, KPI definitions).

* **API Routes**
  * `/api/health` – Liveness probe.
  * `/api/me` – Return current user profile and permissions.
  * `/api/<domain>/...` – Domain‑specific endpoints for retrieving data and performing mutations. Each handler enforces RBAC rules and uses Supabase with service‑role privileges for data access.

## Authentication & Authorization

The application integrates **Supabase Auth** using JWTs stored in HTTP‐only cookies. On the frontend, the `useMe` hook fetches the current user session and caches it. Server routes use the `supabase.auth.getUser()` helper to retrieve the session for the incoming request.

* **Roles:** Users have a single primary role (e.g., director, admin, sales, marketing, ops, finance). Roles map to a set of permissions defined in the database and exposed via `/api/permissions`.
* **Permissions:** Fine‑grained actions (e.g., `read_sales_pipeline`, `create_offline_event`) are defined and stored in the `permissions` table. A join table `role_permissions` assigns permissions to roles. The `authorize` helper checks whether the user’s role includes a required permission.
* **Row‑Level Security:** All domain tables have RLS enabled. Policies call functions like `current_user_has_access()` to validate that the authenticated user may access or modify a given row (e.g., only owners may see their own sales leads, unless they are in a managerial role).

## Deployment

The repository includes scripts and configuration files to run the application locally and deploy it to Vercel. See `docs/setup-local.md` for instructions on local development and `docs/deploy-vercel.md` for deployment steps. Supabase migrations and seed data are version‑controlled under the `supabase/migrations`, `supabase/policies`, and `supabase/seed` directories and are applied using the `supabase` CLI.

## Next Steps

This document is a starting point based on the absence of the official blueprint. When the original documentation becomes available, please review and update this blueprint accordingly. All implementation details should reflect the authoritative source.