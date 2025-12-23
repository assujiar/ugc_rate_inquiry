# Marketing v2 Delivery Checklist

This checklist ensures that all deliverables associated with the marketing v2 module are complete and meet quality standards. Use this document to verify your work before marking the project ready for review.

## ✅ Features

- [ ] **Overview Dashboard:** Implement KPI cards and charts summarizing overall marketing performance.
- [ ] **Offline Events:** CRUD forms, table view, filtering by date/campaign/location, and charts displaying event attendance and lead generation.
- [ ] **SEO/SEM Campaigns:** CRUD forms for keyword campaigns, tables and charts showing impressions, clicks, conversions, cost, and cost per conversion.
- [ ] **Website Analytics:** Display metrics such as pageviews, sessions, users, bounce rate, and average session duration with date range comparison.
- [ ] **Digital Channels:** Aggregate data for each channel with conversions, leads, cost per lead, and ROI metrics.
- [ ] **Content Pieces:** CRUD forms for content assets with performance tracking (impressions, leads). Link content to campaigns.
- [ ] **Attribution Models:** Implement first‑touch, last‑touch, and assisted conversion calculations. Visualize conversion shares by channel.
- [ ] **KPI Management:** Allow users to define, edit, and delete custom marketing KPIs.

## ✅ API & Backend

- [ ] **API Endpoints:** Create API route handlers under `/app/api/marketing` for each sub‑module (overview, offline events, seo/sem campaigns, website analytics, digital channels, content pieces, attribution, kpi).
- [ ] **RBAC Checks:** Enforce permission checks in API routes to prevent unauthorized access.
- [ ] **RLS Policies:** Define row‑level security policies for all marketing tables. Ensure they are enabled and tested.
- [ ] **Migrations:** Write SQL migrations for marketing tables, views, indexes, and policies. Ensure migrations are idempotent and well‑ordered.
- [ ] **Seed Data:** Provide seed scripts for marketing roles, permissions, and sample records across all tables.
- [ ] **Edge Functions (optional):** If required, implement Supabase Edge Functions for external marketing data synchronization.

## ✅ Frontend & UX

- [ ] **Responsive Design:** Ensure the marketing dashboard adapts to desktop, tablet, and mobile devices. Use Tailwind CSS breakpoints and appropriate UI patterns.
- [ ] **Navigation:** Use the `MarketingTabs` component for tabbed navigation and ensure an accessible accordion fallback on small screens.
- [ ] **Forms & Validation:** Implement forms with client‑side validation and error handling. Provide success feedback via toasts.
- [ ] **Filters & Presets:** Integrate filter components (date range, multi‑select, search) and support saving/loading presets. Sync filter state with URL query parameters.
- [ ] **Charts & Tables:** Use reusable chart and table components (`TrendChart`, `DataTable`). Provide empty and error states.
- [ ] **Accessibility:** Ensure components have proper ARIA attributes, focus management, and keyboard navigation.

## ✅ Documentation

- [ ] **Complete Guide:** Provide an implementation guide describing database schema, API routes, React components, RBAC, filtering logic, and extension points.
- [ ] **Complete Summary:** Summarize the features delivered and their usage.
- [ ] **Final Summary:** Outline testing instructions, known limitations, and next steps.
- [ ] **Delivery Checklist:** Include this checklist to assist reviewers.

## ✅ Testing

- [ ] **Unit Tests:** Cover utility functions and API handlers with unit tests.
- [ ] **Integration Tests:** Verify RLS policies and RBAC checks by interacting with the database using test users and roles.
- [ ] **End‑to‑End Tests:** Use Cypress or Playwright to automate user flows such as filtering, creating events, and managing KPIs.

## ✅ Quality

- [ ] **Lint & Typecheck:** Run `npm run lint` and `npm run typecheck` with no errors.
- [ ] **Build:** Confirm that `npm run build` completes without errors.
- [ ] **Performance:** Ensure API responses are performant by adding appropriate indexes and minimizing network calls.
- [ ] **Security:** Sanitize inputs, handle errors gracefully, and never expose secrets in client code or repository.

---

Use this checklist as a reference to ensure all marketing v2 tasks are completed. Check each box as you verify the corresponding item.