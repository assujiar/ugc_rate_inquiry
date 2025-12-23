# Implementation & Operations Manual

## Introduction

This manual describes the processes and procedures required to implement, deploy, and operate the `ugc_dashboard` application. The original operations manual was not available; therefore, this guide is based on standard practices for Next.js and Supabase deployments. It is intended for developers, DevOps engineers, and administrators responsible for maintaining the system.

## Local Development

### Prerequisites

* **Node.js 18+** – Install the LTS version of Node.js along with `npm`.
* **Supabase CLI** – Install the [Supabase CLI](https://supabase.com/docs/guides/cli) to manage migrations, policies, and local database.
* **Docker** – Required to run a local Postgres database via Supabase.

### Setup Steps

1. Clone the repository:
   ```sh
   git clone <repo-url> ugc_dashboard
   cd ugc_dashboard
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables by copying `.env.example` to `.env.local` and filling in values (Supabase project URL, anon key, service role key, etc.).
4. Initialize the Supabase project locally:
   ```sh
   supabase init
   supabase start
   ```
   This starts a local Postgres instance and applies migrations and seed data. If you make changes to SQL scripts, run `supabase db reset` to reapply migrations and seeds.
5. Run the development server:
   ```sh
   npm run dev
   ```
   The application will be available at `http://localhost:3000`. Hot module replacement is enabled for TypeScript and React components.

## Migrations & Database Operations

All SQL scripts are stored under the `supabase` directory:

* **Migrations** (`supabase/migrations`) – Ordered scripts that create tables, views, indexes, and functions.
* **Policies** (`supabase/policies`) – Scripts enabling RLS and defining policies per table.
* **Seed** (`supabase/seed`) – Inserts initial data such as roles, permissions, users, and sample domain data.

To apply migrations and seeds to a remote Supabase project:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
supabase db seed --file supabase/seed/2001_seed_roles.sql # seed files can be applied individually
```

## Continuous Integration

The project can be integrated into a CI pipeline (e.g., GitHub Actions) to run linting, type checking, unit tests, and database migrations. A typical workflow might include:

1. `npm ci` – Install dependencies using package lock.
2. `npm run lint` – Run ESLint with the configured rules.
3. `npm run typecheck` – Run TypeScript compiler in `--noEmit` mode.
4. `npm run test` – Execute unit and integration tests (if provided).
5. `supabase db push` – Apply migrations to a staging environment (requires Supabase credentials).
6. `npm run build` – Build the Next.js application.

## Deployment

The recommended deployment target is [Vercel](https://vercel.com/) due to its tight integration with Next.js. See `docs/deploy-vercel.md` for a step‑by‑step deployment guide. The following are high‑level considerations:

* Use environment variables (`VERCEL_ENV` or `NEXT_PUBLIC_*`) to connect to Supabase. **Do not** commit secrets to the repository.
* Enable [Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions) if you implement custom serverless functions. Otherwise, Next.js API routes suffice.
* Set up a custom domain and configure SSL via Vercel.
* Configure Supabase webhook endpoints (if used) by adding the appropriate URL in the Supabase dashboard.

## Monitoring & Logging

* **Application Logs** – Vercel and Supabase provide logs for API calls, database queries, and serverless functions. Use these to diagnose issues.
* **Audit Logs** – The `audit_logs` table records user actions. Build dashboards or alerts on top of this table to monitor suspicious activity.
* **Error Handling** – Components like `ErrorState` display friendly messages to users. Ensure that unhandled exceptions are captured and reported via a logging service such as Sentry (not included by default).

## Backup & Recovery

Supabase provides automated backups for the database. For additional redundancy:

1. Regularly export the schema and data using `pg_dump` or Supabase’s backups.
2. Store backups in a secure location (e.g., cloud storage with versioning).
3. Test restoring from backups to a staging environment periodically.

## Maintenance

* **Database Migrations:** Maintain forward‑only migrations. Never modify past migration files once applied to a production environment. Instead, create new migrations to alter schema or policies.
* **Dependencies:** Keep dependencies up to date using tools like Dependabot. Major version upgrades should be tested on staging before production rollout.
* **Security:** Regularly review RLS policies, RBAC assignments, and application dependencies for vulnerabilities. Rotate service role keys and update environment variables as needed.

## Incident Response

In case of an incident (e.g., data breach, service outage):

1. Identify and isolate the affected components (e.g., disable compromised API routes, revoke tokens).
2. Notify stakeholders and follow your organization’s incident response plan.
3. Analyze logs and audit trails to determine the root cause.
4. Apply patches or configuration changes to resolve the issue.
5. Document the incident and update this manual if necessary.

---

This manual will be refined as operational insights are gained and when the official documentation becomes available.