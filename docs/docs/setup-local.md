# Setup Local Development Environment

This guide walks you through setting up the `ugc_dashboard` project on your local machine. Follow each step to install dependencies, configure environment variables, initialize the database, and run the application.

## 1. Prerequisites

* **Node.js 18 or higher** – Install via [Node.js official website](https://nodejs.org/en/) or your preferred version manager (e.g., `nvm`).
* **Supabase CLI** – Install by running:
  ```sh
  npm install -g supabase
  ```
* **Docker** – Required for the local Supabase database. Download from [Docker](https://www.docker.com/get-started) and ensure the daemon is running.

## 2. Clone the Repository

```sh
git clone <your-repo-url> ugc_dashboard
cd ugc_dashboard
```

## 3. Install Dependencies

Use `npm` to install Node.js dependencies:

```sh
npm install
```

## 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```sh
   cp .env.example .env.local
   ```
2. Open `.env.local` and fill in the following variables:
   * `SUPABASE_URL` – The URL of your Supabase project. For local development, this is usually `http://localhost:54321` after running `supabase start`.
   * `SUPABASE_ANON_KEY` – The anonymous key for client‑side calls. For local development, you can find this in the generated `supabase` configuration or by using the Supabase dashboard for a remote project.
   * `SUPABASE_SERVICE_ROLE_KEY` – The service role key used by API routes on the server. Keep this secret and never expose it to the client.
   * Any other variables required by your environment (e.g., external API keys).

## 5. Initialize Supabase

Initialize the Supabase project and start the local Postgres instance:

```sh
supabase init
supabase start
```

This will download and run a local Postgres database, apply migrations from the `supabase/migrations` directory, and start Supabase’s authentication and storage services. If migrations or seed data change, you can reset the database with `supabase db reset` (note: this will delete all local data).

## 6. Seed Data

To populate the database with initial data (roles, permissions, users, and sample domain data), run:

```sh
supabase db seed --file supabase/seed/2001_seed_roles.sql
supabase db seed --file supabase/seed/2002_seed_permissions.sql
supabase db seed --file supabase/seed/2003_seed_role_permissions.sql
supabase db seed --file supabase/seed/2004_seed_users.sql
# ...and so on for other seed files
```

Alternatively, you can load all seed files manually via a SQL client or script. Make sure to update user email addresses and passwords as needed for your local environment.

## 7. Run the Application

Start the Next.js development server:

```sh
npm run dev
```

The application will be available at `http://localhost:3000`. When you first open the site, you’ll see the landing page, which redirects to `/login` if you’re not authenticated. After signing in, you will be redirected to `/app`.

## 8. Linting & Type Checking

To verify code quality, run:

```sh
npm run lint      # Checks for ESLint issues
npm run typecheck # Runs TypeScript in no‑emit mode
```

Fix any reported issues before committing your code.

## 9. Building for Production

To create a production build of the application:

```sh
npm run build
```

This command compiles the project, outputs the build artifacts in the `.next` directory, and prepares the code for deployment.

## 10. Useful Commands

* **Start Dev Server:** `npm run dev`
* **Run Lint:** `npm run lint`
* **Run Type Check:** `npm run typecheck`
* **Run Test:** `npm run test` (if you add tests)
* **Build:** `npm run build`
* **Reset Database:** `supabase db reset`

---

Follow these steps to get up and running quickly with the `ugc_dashboard`. Refer to other documentation files (e.g., `implementation-ops-manual.md`, `deploy-vercel.md`) for more details on deployment and operations.