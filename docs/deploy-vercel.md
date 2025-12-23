# Deploying `ugc_dashboard` on Vercel

This guide explains how to deploy the `ugc_dashboard` application to [Vercel](https://vercel.com/), a serverless hosting platform optimized for Next.js. Deploying to Vercel allows you to leverage automatic scaling, preview deployments, and seamless integration with Git providers.

## 1. Pre‑requisites

* A Vercel account (sign up at https://vercel.com/signup if you don’t have one).
* A Git repository for `ugc_dashboard` hosted on GitHub, GitLab, or Bitbucket.
* Access to the Supabase project’s environment variables (URL, anon key, service role key).

## 2. Connect Your Repository

1. Log in to your Vercel dashboard.
2. Click **“New Project”** and choose your Git provider.
3. Select the `ugc_dashboard` repository from the list.
4. Vercel will detect that the project uses Next.js and pre‑configure build settings.

## 3. Configure Environment Variables

Vercel requires environment variables to be set for both build and runtime:

1. In the project setup step, click **“Environment Variables”**.
2. Add the following variables:
   * `SUPABASE_URL` – Your Supabase project URL (e.g., `https://xyzcompany.supabase.co`).
   * `SUPABASE_ANON_KEY` – The anonymous API key from Supabase (client‑side use).
   * `SUPABASE_SERVICE_ROLE_KEY` – The service role key used by API routes on the server. **Mark this as “Secret” and “Server Only”.**
   * Any additional variables required by your application (e.g., `NEXT_PUBLIC_ANALYTICS_ID`).
3. Set the variables for all environments (`Production`, `Preview`, `Development`) as appropriate. In local development, variables in `.env.local` take precedence.

## 4. Build & Output Settings

Vercel automatically runs `npm install` and `npm run build`. Ensure that your `package.json` defines:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

The default build command should suffice. The output directory is the `.next` folder, which Vercel handles internally.

## 5. Configure proxy (Optional)

If your application uses custom `proxy.ts` (e.g., for authentication or redirects), Vercel will automatically deploy it as an Edge Function. Ensure that proxy is non‑blocking and handles requests appropriately.

## 6. Add `vercel.json` (Optional)

If you need to override default behavior (e.g., rewrites, redirects, caching), create a `vercel.json` file at the project root. An example configuration might look like:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/app/api/$1" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/app/$1" }
  ]
}
```

Refer to the [Vercel documentation](https://vercel.com/docs/configuration) for more options.

## 7. Deploy

Once the project is configured, click **“Deploy”**. Vercel will:

1. Clone your repository.
2. Install dependencies.
3. Run the build script.
4. Deploy your application to a preview URL (e.g., `https://ugc-dashboard-git-feature-branch.vercel.app`).
5. Promote the preview deployment to production when ready.

## 8. Post‑Deployment Checks

After the deployment completes:

* Visit the production URL and verify that the landing page redirects to `/login` when not authenticated.
* Sign in with valid credentials and ensure that protected pages work correctly.
* Confirm that API routes return data from Supabase and enforce permissions.
* Test filters and navigation on the marketing dashboard and other modules.

## 9. Custom Domain (Optional)

To use a custom domain:

1. In the Vercel dashboard, select your project.
2. Go to the **Domains** tab and click **“Add Domain”**.
3. Enter your domain and follow the instructions to update DNS records with your domain provider.
4. Once DNS propagation is complete, Vercel will issue an SSL certificate automatically.

## 10. Continuous Deployment

By default, Vercel enables preview deployments for every push. Merging to the main branch triggers a production deployment. You can configure branch protections and deployment settings within Vercel or your Git provider.

---

This guide covers the essentials for deploying `ugc_dashboard` on Vercel. Refer to Vercel’s documentation for advanced configurations like serverless functions, image optimization, or custom caching rules.