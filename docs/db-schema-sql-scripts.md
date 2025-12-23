# Database Schema & SQL Scripts

> **Note:** The official database schema was unavailable at the time of implementation. The following schema reflects a reasonable design for a multi‑domain dashboard based on standard practices for sales, marketing, operations, and finance modules. Each domain’s tables live in the public schema of Supabase (PostgreSQL) and have [row‑level security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) enabled. Scripts are stored in versioned migration files under `supabase/migrations`, with separate directories for policies (`supabase/policies`) and seed data (`supabase/seed`).

## Migration Structure

The migration files use a numeric prefix to determine execution order. Groupings by domain help keep related migrations together. For example:

```
supabase/migrations/
  0001_core_extensions.sql
  0002_auth_profile.sql
  0003_rbac_roles_permissions.sql
  ...
  0101_sales_core.sql
  0102_sales_reasons_taxonomy.sql
  0201_marketing_core.sql
  ...
  0301_ops_core.sql
  ...
  0501_kpi_framework.sql
```

## Core & RBAC

### `0001_core_extensions.sql`
Installs commonly used Postgres extensions such as `pgcrypto` (for generating UUIDs) and `btree_gin` (for indexing JSONB fields).

### `0002_auth_profile.sql`
Defines a `profiles` table with a one‑to‑one relationship to `auth.users` (the Supabase managed auth table). The table includes fields for `full_name`, `avatar_url`, `role_id`, `created_at`, and `updated_at`.

### `0003_rbac_roles_permissions.sql`
Creates tables for RBAC:

* `roles (id UUID PRIMARY KEY, name TEXT UNIQUE, description TEXT)` – Stores role definitions (e.g., director, admin, sales, marketing, ops, finance).
* `permissions (id UUID PRIMARY KEY, name TEXT UNIQUE, description TEXT)` – Defines granular privileges (e.g., `read_sales_leads`, `edit_offline_event`).
* `role_permissions (role_id UUID REFERENCES roles(id) ON DELETE CASCADE, permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE, PRIMARY KEY (role_id, permission_id))` – Links roles to permissions.

### `0004_audit_logs.sql`
Adds an `audit_logs` table to record user actions. Fields include `id`, `actor_id`, `action`, `table_name`, `record_id`, `changes` (JSONB), and timestamp columns (`created_at`, `updated_at`). Triggers can be added later to automatically log changes.

### `0005_master_data.sql`
Introduces general reference tables used across domains. Examples include `countries`, `currencies`, `sales_stages`, and `expense_categories`. Each table has an `id`, `code`, `name`, and `is_active` flag.

## Sales Domain

### `0101_sales_core.sql`
Defines the core sales tables:

* `sales_leads (id UUID PRIMARY KEY, owner_id UUID REFERENCES profiles(id), company TEXT, contact_name TEXT, stage_id UUID REFERENCES sales_stages(id), expected_value NUMERIC, status TEXT, created_at TIMESTAMP, updated_at TIMESTAMP)` – Captures individual leads.
* `sales_pipeline_stages (id UUID PRIMARY KEY, name TEXT, sequence INTEGER, is_active BOOLEAN)` – Defines the pipeline stages (e.g., prospecting, qualified, negotiation, won, lost).
* `sales_activities (id UUID PRIMARY KEY, lead_id UUID REFERENCES sales_leads(id), type TEXT, note TEXT, activity_date DATE, created_at TIMESTAMP)` – Records interactions with leads.

### `0102_sales_reasons_taxonomy.sql`
Creates a `sales_reasons` taxonomy table with `id`, `name`, `category`, and `is_active` columns to categorize reasons for lost deals or pipeline movement.

### `0103_sales_views.sql`
Defines view(s) to aggregate sales metrics, such as:

* `v_sales_pipeline_overview` – Summarizes the count and value of leads per pipeline stage.
* `v_sales_activity_summary` – Aggregates activities per lead owner.

### `0104_sales_indexes.sql`
Adds indexes to improve query performance, e.g., a B‑tree index on `sales_leads.owner_id` and a GIN index on JSON fields if required.

## Marketing Domain (v2)

### `0201_marketing_core.sql`
Defines a base `marketing_campaigns` table with fields like `id`, `name`, `campaign_type` (offline/online), `budget`, `start_date`, `end_date`, and `status`.

### `0202_marketing_offline_events.sql`
Creates an `offline_events` table: `id`, `campaign_id` (FK), `event_name`, `location`, `event_date`, `attendees`, `leads_generated`, `notes`, `created_at`, `updated_at`.

### `0203_marketing_seo_sem_campaigns.sql`
Creates `seo_sem_campaigns` with fields: `id`, `campaign_id` (FK), `keyword`, `impressions`, `clicks`, `conversions`, `cost`, `start_date`, `end_date`.

### `0204_marketing_website_analytics.sql`
Creates `website_analytics` with: `id`, `date`, `pageviews`, `sessions`, `users`, `bounce_rate`, `avg_session_duration`.

### `0205_marketing_digital_channels.sql`
Creates `digital_channels` with: `id`, `channel_name`, `visits`, `leads`, `conversions`, `cost`, `report_date`.

### `0206_marketing_content_pieces.sql`
Creates `content_pieces` with: `id`, `campaign_id` (FK), `title`, `content_type` (blog, video, infographic, etc.), `publish_date`, `impressions`, `leads_generated`.

### `0207_marketing_attribution.sql`
Creates `marketing_attribution` with: `id`, `channel`, `first_touch_conversions`, `last_touch_conversions`, `assisted_conversions`, `report_date`.

### `0208_marketing_views_kpi.sql`
Defines views aggregating marketing KPIs across the above tables, e.g., `v_marketing_overview` summarizing total leads, total cost, cost per lead, and ROI.

### `0209_marketing_indexes.sql`
Adds indexes on frequently filtered fields (e.g., `campaign_id` foreign keys, `report_date`).

## Operations Domain

### `0301_ops_core.sql`
Creates tables such as `ops_tickets`, `ops_sla`, `ops_ticket_statuses`, and `ops_ticket_assignees`. The `ops_tickets` table includes fields: `id`, `reporter_id`, `assignee_id`, `status_id`, `priority`, `subject`, `description`, `sla_id`, `created_at`, `updated_at`, `closed_at`.

### `0302_ops_sla.sql`
Defines the `ops_sla` table with `id`, `name`, `resolution_target_hours`, and `priority_level`.

### `0303_ops_tickets_workflow.sql`
Adds supporting tables for workflow transitions (e.g., `ops_ticket_statuses`, `ops_ticket_transitions`) and triggers for automatically setting `closed_at` when status becomes closed.

### `0304_ops_views.sql`
Creates views summarizing operations KPIs, such as `v_ops_overview` (open vs. closed tickets per SLA) and `v_ops_average_resolution_time`.

### `0305_ops_indexes.sql`
Adds indexes on `ops_tickets.status_id`, `ops_tickets.assignee_id`, and other frequently filtered columns.

## Finance Domain

### `0401_finance_core.sql`
Defines `accounts`, `finance_transactions`, and `customers` tables. `finance_transactions` includes `id`, `account_id`, `customer_id`, `amount`, `transaction_date`, `transaction_type` (invoice, payment, refund), and `description`.

### `0402_finance_ar_aging.sql`
Creates a `ar_aging` table or view grouping outstanding invoices into aging buckets (current, 30d, 60d, 90d+). Fields include `id`, `customer_id`, `invoice_id`, `due_date`, `amount_due`, and `bucket`.

### `0403_finance_margin.sql`
Creates a `finance_margin` table capturing revenue, cost of goods sold, and gross margin per period (e.g., by month or quarter).

### `0404_finance_views.sql`
Aggregates finance data into views such as `v_finance_overview` (summary of revenues, expenses, profit) and `v_finance_ar_summary`.

### `0405_finance_indexes.sql`
Adds indexes on `finance_transactions.transaction_date`, `ar_aging.due_date`, and other key fields.

## Shared KPI Framework

### `0501_kpi_framework.sql`
Defines a `kpi_metrics` table where each record represents a KPI definition with `id`, `domain`, `name`, `description`, `calculation` (SQL snippet or identifier), and `target_value`.

### `0502_kpi_views.sql`
Creates unified views or functions that compute KPI values across domains. For example, `v_all_kpis` may union multiple domain views into a single list of KPI names, values, and targets.

## Policy Scripts

Policy scripts in the `supabase/policies` directory enable RLS on all tables and define functions and policies for each domain. See `docs/rls-security-config.md` for details.

## Seed Data

Seed scripts under `supabase/seed` insert initial data for roles, permissions, role‑permissions, users, master data, and sample domain records. This makes it easy to bootstrap the application for development and staging environments.

## Extensions & Functions

Additional SQL functions (e.g., for marketing synchronization) may be placed under `supabase/functions`. In this implementation, no external functions are required, but the directory structure is created to allow for future extensibility.

---

This document will be refined once the official database schema becomes available. All fields and relations here are subject to change based on definitive requirements.