-- ugc_dashboard Supabase SQL
-- Source-of-truth references:
-- - docs/db-schema-sql-scripts.md
-- - docs/rls-security-config.md
-- - repo types/* (sales, marketing, ops, finance, rbac, auth)
-- This script is intended to be run by an admin (SQL Editor) or via Supabase migrations.

begin;

------------------------------------------------------------
-- 0001_core_extensions
------------------------------------------------------------
create extension if not exists pgcrypto;

------------------------------------------------------------
-- 0002_utilities: timestamps
------------------------------------------------------------
create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

------------------------------------------------------------
-- 0003_rbac_roles_permissions + profiles
------------------------------------------------------------

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_manager boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_roles_updated_at
before update on public.roles
for each row execute function public.fn_set_updated_at();

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_permissions_updated_at
before update on public.permissions
for each row execute function public.fn_set_updated_at();

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

-- profiles: 1:1 with auth.users
-- NOTE: role_id is nullable to avoid assuming default role assignment for new users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid generated always as (id) stored,
  full_name text,
  avatar_url text,
  role_id uuid references public.roles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.fn_set_updated_at();

------------------------------------------------------------
-- 0004_audit_logs
------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  changes jsonb,
  created_at timestamptz not null default now()
);

------------------------------------------------------------
-- 0005_master_data (minimal set referenced by docs)
------------------------------------------------------------
create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_countries_updated_at
before update on public.countries
for each row execute function public.fn_set_updated_at();

create table if not exists public.currencies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  symbol text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_currencies_updated_at
before update on public.currencies
for each row execute function public.fn_set_updated_at();

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_expense_categories_updated_at
before update on public.expense_categories
for each row execute function public.fn_set_updated_at();

------------------------------------------------------------
-- 0100_sales domain
------------------------------------------------------------

create table if not exists public.sales_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sequence int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);
create trigger trg_sales_pipeline_stages_updated_at
before update on public.sales_pipeline_stages
for each row execute function public.fn_set_updated_at();

create table if not exists public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  company text not null,
  contact_name text,
  stage_id uuid not null references public.sales_pipeline_stages(id),
  expected_value numeric(14,2),
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_sales_leads_updated_at
before update on public.sales_leads
for each row execute function public.fn_set_updated_at();

create index if not exists idx_sales_leads_owner on public.sales_leads(owner_id);
create index if not exists idx_sales_leads_stage on public.sales_leads(stage_id);
create index if not exists idx_sales_leads_created_at on public.sales_leads(created_at);

create table if not exists public.sales_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sales_leads(id) on delete cascade,
  type text not null,
  note text,
  activity_date date not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_sales_activities_lead on public.sales_activities(lead_id);
create index if not exists idx_sales_activities_date on public.sales_activities(activity_date);

create table if not exists public.sales_reasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_sales_reasons_updated_at
before update on public.sales_reasons
for each row execute function public.fn_set_updated_at();

create index if not exists idx_sales_reasons_category on public.sales_reasons(category);

-- Views (optional, used for dashboards/analytics)
create or replace view public.v_sales_pipeline_overview as
select
  s.id as stage_id,
  s.name as stage_name,
  s.sequence,
  count(l.id) as lead_count,
  coalesce(sum(l.expected_value), 0)::numeric(14,2) as total_expected_value
from public.sales_pipeline_stages s
left join public.sales_leads l on l.stage_id = s.id
group by s.id, s.name, s.sequence
order by s.sequence;

create or replace view public.v_sales_activity_summary as
select
  l.owner_id,
  count(a.id) as activity_count,
  max(a.activity_date) as last_activity_date
from public.sales_leads l
left join public.sales_activities a on a.lead_id = l.id
group by l.owner_id;

------------------------------------------------------------
-- 0200_marketing domain (v2)
------------------------------------------------------------

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  campaign_type text not null check (campaign_type in ('offline','online','mixed')),
  budget numeric(14,2),
  start_date date not null,
  end_date date,
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_marketing_campaigns_updated_at
before update on public.marketing_campaigns
for each row execute function public.fn_set_updated_at();

create index if not exists idx_marketing_campaigns_dates on public.marketing_campaigns(start_date, end_date);

create table if not exists public.offline_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  event_name text not null,
  location text not null,
  event_date date not null,
  attendees int,
  leads_generated int,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_offline_events_updated_at
before update on public.offline_events
for each row execute function public.fn_set_updated_at();
create index if not exists idx_offline_events_date on public.offline_events(event_date);
create index if not exists idx_offline_events_campaign on public.offline_events(campaign_id);

create table if not exists public.seo_sem_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  keyword text not null,
  impressions int not null default 0,
  clicks int not null default 0,
  conversions int not null default 0,
  cost numeric(14,2) not null default 0,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_seo_sem_campaigns_updated_at
before update on public.seo_sem_campaigns
for each row execute function public.fn_set_updated_at();
create index if not exists idx_seo_sem_campaigns_campaign on public.seo_sem_campaigns(campaign_id);
create index if not exists idx_seo_sem_campaigns_dates on public.seo_sem_campaigns(start_date, end_date);

create table if not exists public.website_analytics (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  pageviews int not null default 0,
  sessions int not null default 0,
  users int not null default 0,
  bounce_rate numeric(6,3) not null default 0,
  avg_session_duration numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_website_analytics_updated_at
before update on public.website_analytics
for each row execute function public.fn_set_updated_at();

create table if not exists public.digital_channels (
  id uuid primary key default gen_random_uuid(),
  channel_name text not null,
  visits int not null default 0,
  leads int not null default 0,
  conversions int not null default 0,
  cost numeric(14,2) not null default 0,
  report_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel_name, report_date)
);
create trigger trg_digital_channels_updated_at
before update on public.digital_channels
for each row execute function public.fn_set_updated_at();
create index if not exists idx_digital_channels_report_date on public.digital_channels(report_date);

create table if not exists public.content_pieces (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  title text not null,
  content_type text not null,
  publish_date date not null,
  impressions int not null default 0,
  leads_generated int not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_content_pieces_updated_at
before update on public.content_pieces
for each row execute function public.fn_set_updated_at();
create index if not exists idx_content_pieces_publish_date on public.content_pieces(publish_date);

create table if not exists public.marketing_attribution (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  first_touch_conversions int not null default 0,
  last_touch_conversions int not null default 0,
  assisted_conversions int not null default 0,
  report_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel, report_date)
);
create trigger trg_marketing_attribution_updated_at
before update on public.marketing_attribution
for each row execute function public.fn_set_updated_at();

-- Marketing Views (optional)
create or replace view public.v_marketing_overview as
select
  (select count(*) from public.marketing_campaigns) as campaigns,
  (select coalesce(sum(budget),0)::numeric(14,2) from public.marketing_campaigns) as total_budget,
  (select coalesce(sum(leads_generated),0)::bigint from public.offline_events) as offline_leads,
  (select coalesce(sum(conversions),0)::bigint from public.seo_sem_campaigns) as seo_sem_conversions;

create or replace view public.v_content_performance as
select
  content_type,
  count(*) as pieces,
  sum(impressions) as impressions,
  sum(leads_generated) as leads_generated
from public.content_pieces
group by content_type
order by leads_generated desc;

------------------------------------------------------------
-- 0300_operations domain
------------------------------------------------------------

create table if not exists public.ops_sla (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  resolution_target_hours int not null,
  priority_level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);
create trigger trg_ops_sla_updated_at
before update on public.ops_sla
for each row execute function public.fn_set_updated_at();

create table if not exists public.ops_ticket_statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  "order" int not null,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ops_ticket_statuses_updated_at
before update on public.ops_ticket_statuses
for each row execute function public.fn_set_updated_at();

create table if not exists public.ops_tickets (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete restrict,
  assignee_id uuid references public.profiles(id) on delete set null,
  status_id uuid not null references public.ops_ticket_statuses(id),
  priority text not null default 'normal',
  subject text not null,
  description text not null,
  sla_id uuid references public.ops_sla(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);
create trigger trg_ops_tickets_updated_at
before update on public.ops_tickets
for each row execute function public.fn_set_updated_at();

create index if not exists idx_ops_tickets_status on public.ops_tickets(status_id);
create index if not exists idx_ops_tickets_assignee on public.ops_tickets(assignee_id);
create index if not exists idx_ops_tickets_reporter on public.ops_tickets(reporter_id);
create index if not exists idx_ops_tickets_created_at on public.ops_tickets(created_at);

-- auto set closed_at when final status
create or replace function public.fn_ops_ticket_set_closed_at()
returns trigger
language plpgsql
as $$
declare
  v_is_final boolean;
begin
  select is_final into v_is_final from public.ops_ticket_statuses where id = new.status_id;
  if v_is_final then
    new.closed_at = coalesce(new.closed_at, now());
  else
    new.closed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ops_tickets_closed_at on public.ops_tickets;
create trigger trg_ops_tickets_closed_at
before insert or update of status_id on public.ops_tickets
for each row execute function public.fn_ops_ticket_set_closed_at();

create or replace view public.v_ops_overview as
select
  s.name as status,
  count(t.id) as ticket_count
from public.ops_ticket_statuses s
left join public.ops_tickets t on t.status_id = s.id
group by s.name
order by min(s."order");

------------------------------------------------------------
-- 0400_finance domain
------------------------------------------------------------

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tax_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);
create trigger trg_customers_updated_at
before update on public.customers
for each row execute function public.fn_set_updated_at();

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  balance numeric(16,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);
create trigger trg_accounts_updated_at
before update on public.accounts
for each row execute function public.fn_set_updated_at();

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  amount numeric(16,2) not null,
  transaction_date date not null,
  transaction_type text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_finance_transactions_updated_at
before update on public.finance_transactions
for each row execute function public.fn_set_updated_at();
create index if not exists idx_finance_transactions_date on public.finance_transactions(transaction_date);
create index if not exists idx_finance_transactions_customer on public.finance_transactions(customer_id);

create table if not exists public.ar_aging (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  invoice_id uuid not null,
  due_date date not null,
  amount_due numeric(16,2) not null,
  bucket text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ar_aging_updated_at
before update on public.ar_aging
for each row execute function public.fn_set_updated_at();
create index if not exists idx_ar_aging_due on public.ar_aging(due_date);
create index if not exists idx_ar_aging_customer on public.ar_aging(customer_id);

create table if not exists public.finance_margin (
  id uuid primary key default gen_random_uuid(),
  period text not null, -- e.g. '2025-12'
  revenue numeric(16,2) not null default 0,
  cogs numeric(16,2) not null default 0,
  margin numeric(16,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period)
);
create trigger trg_finance_margin_updated_at
before update on public.finance_margin
for each row execute function public.fn_set_updated_at();

create or replace view public.v_finance_overview as
select
  (select coalesce(sum(revenue),0)::numeric(16,2) from public.finance_margin) as total_revenue,
  (select coalesce(sum(cogs),0)::numeric(16,2) from public.finance_margin) as total_cogs,
  (select coalesce(sum(margin),0)::numeric(16,2) from public.finance_margin) as total_margin;

------------------------------------------------------------
-- 0500_shared KPI framework
------------------------------------------------------------

create table if not exists public.kpi_metrics (
  id uuid primary key default gen_random_uuid(),
  domain text not null check (domain in ('sales','marketing','ops','finance','director','admin')),
  name text not null,
  description text,
  calculation text not null,
  target_value numeric(16,2),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (domain, name)
);
create trigger trg_kpi_metrics_updated_at
before update on public.kpi_metrics
for each row execute function public.fn_set_updated_at();

------------------------------------------------------------
-- 1000_RLS helpers + policies
------------------------------------------------------------

-- Helper functions (aligned to docs/rls-security-config.md)
create or replace function public.fn_current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.fn_current_role_id()
returns uuid
language sql
stable
as $$
  select role_id from public.profiles where id = auth.uid();
$$;

create or replace function public.fn_has_permission(permission_name text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.role_permissions rp
    join public.permissions p on p.id = rp.permission_id
    where rp.role_id = public.fn_current_role_id()
      and p.name = permission_name
  );
$$;

create or replace function public.fn_has_any_permission(permission_names text[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.role_permissions rp
    join public.permissions p on p.id = rp.permission_id
    where rp.role_id = public.fn_current_role_id()
      and p.name = any(permission_names)
  );
$$;

create or replace function public.fn_is_manager()
returns boolean
language sql
stable
as $$
  select coalesce(r.is_manager, false)
  from public.roles r
  where r.id = public.fn_current_role_id();
$$;

-- Enable + force RLS on all tables in scope
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'roles','permissions','role_permissions','profiles','audit_logs',
        'countries','currencies','expense_categories',
        'sales_pipeline_stages','sales_leads','sales_activities','sales_reasons',
        'marketing_campaigns','offline_events','seo_sem_campaigns','website_analytics','digital_channels','content_pieces','marketing_attribution',
        'ops_sla','ops_ticket_statuses','ops_tickets',
        'customers','accounts','finance_transactions','ar_aging','finance_margin',
        'kpi_metrics'
      )
  LOOP
    EXECUTE format('alter table %I.%I enable row level security;', t.schemaname, t.tablename);
    EXECUTE format('alter table %I.%I force row level security;', t.schemaname, t.tablename);
  END LOOP;
END $$;

------------------------------------------------------------
-- RLS: profiles (self-service)
------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  id = public.fn_current_user_id()
  or public.fn_is_manager()
);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  id = public.fn_current_user_id()
  or public.fn_is_manager()
)
with check (
  id = public.fn_current_user_id()
  or public.fn_is_manager()
);

-- Typically profiles are created via admin tooling; allow insert only to managers.
drop policy if exists "profiles_insert_manager" on public.profiles;
create policy "profiles_insert_manager"
on public.profiles
for insert
to authenticated
with check (
  public.fn_is_manager()
);

------------------------------------------------------------
-- RLS: RBAC tables
-- Allow authenticated users to read role/permission metadata (needed for UI + /api/permissions implementation).
-- Restrict mutations to managers.
------------------------------------------------------------
drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated"
on public.roles
for select
to authenticated
using (true);

drop policy if exists "roles_manage_manager" on public.roles;
create policy "roles_manage_manager"
on public.roles
for all
to authenticated
using (public.fn_is_manager())
with check (public.fn_is_manager());

drop policy if exists "permissions_select_authenticated" on public.permissions;
create policy "permissions_select_authenticated"
on public.permissions
for select
to authenticated
using (true);

drop policy if exists "permissions_manage_manager" on public.permissions;
create policy "permissions_manage_manager"
on public.permissions
for all
to authenticated
using (public.fn_is_manager())
with check (public.fn_is_manager());

-- role_permissions: user can read mappings only for their role (or manager)
drop policy if exists "role_permissions_select_own_role" on public.role_permissions;
create policy "role_permissions_select_own_role"
on public.role_permissions
for select
to authenticated
using (
  role_id = public.fn_current_role_id()
  or public.fn_is_manager()
);

drop policy if exists "role_permissions_manage_manager" on public.role_permissions;
create policy "role_permissions_manage_manager"
on public.role_permissions
for all
to authenticated
using (public.fn_is_manager())
with check (public.fn_is_manager());

------------------------------------------------------------
-- RLS: audit_logs
------------------------------------------------------------
drop policy if exists "audit_logs_select_manager" on public.audit_logs;
create policy "audit_logs_select_manager"
on public.audit_logs
for select
to authenticated
using (public.fn_is_manager());

drop policy if exists "audit_logs_insert_manager" on public.audit_logs;
create policy "audit_logs_insert_manager"
on public.audit_logs
for insert
to authenticated
with check (public.fn_is_manager());

------------------------------------------------------------
-- RLS: master data (read for authenticated, write for manager)
------------------------------------------------------------
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['countries','currencies','expense_categories'] LOOP
    EXECUTE format('drop policy if exists "%s_select_authenticated" on public.%I;', tbl, tbl);
    EXECUTE format('create policy "%s_select_authenticated" on public.%I for select to authenticated using (true);', tbl, tbl);

    EXECUTE format('drop policy if exists "%s_manage_manager" on public.%I;', tbl, tbl);
    EXECUTE format('create policy "%s_manage_manager" on public.%I for all to authenticated using (public.fn_is_manager()) with check (public.fn_is_manager());', tbl, tbl);
  END LOOP;
END $$;

------------------------------------------------------------
-- RLS: sales domain
------------------------------------------------------------

-- stages: read for authenticated, manage for manager
drop policy if exists "sales_pipeline_stages_select_authenticated" on public.sales_pipeline_stages;
create policy "sales_pipeline_stages_select_authenticated"
on public.sales_pipeline_stages for select to authenticated
using (true);

drop policy if exists "sales_pipeline_stages_manage_manager" on public.sales_pipeline_stages;
create policy "sales_pipeline_stages_manage_manager"
on public.sales_pipeline_stages for all to authenticated
using (public.fn_is_manager())
with check (public.fn_is_manager());

-- leads: owner can access; others need read sales permissions
drop policy if exists "sales_leads_select_owner_or_sales_read" on public.sales_leads;
create policy "sales_leads_select_owner_or_sales_read"
on public.sales_leads for select to authenticated
using (
  owner_id = public.fn_current_user_id()
  or public.fn_has_any_permission(array['read_sales_overview','read_sales_pipeline','manage_sales_leads'])
  or public.fn_is_manager()
);

drop policy if exists "sales_leads_insert_sales_manage" on public.sales_leads;
create policy "sales_leads_insert_sales_manage"
on public.sales_leads for insert to authenticated
with check (
  public.fn_has_permission('manage_sales_leads')
  or public.fn_is_manager()
);

drop policy if exists "sales_leads_update_owner_or_manage" on public.sales_leads;
create policy "sales_leads_update_owner_or_manage"
on public.sales_leads for update to authenticated
using (
  owner_id = public.fn_current_user_id()
  or public.fn_has_permission('manage_sales_leads')
  or public.fn_is_manager()
)
with check (
  owner_id = public.fn_current_user_id()
  or public.fn_has_permission('manage_sales_leads')
  or public.fn_is_manager()
);

drop policy if exists "sales_leads_delete_manage" on public.sales_leads;
create policy "sales_leads_delete_manage"
on public.sales_leads for delete to authenticated
using (
  public.fn_has_permission('manage_sales_leads')
  or public.fn_is_manager()
);

-- activities: allow if can read sales activity OR owns the parent lead
drop policy if exists "sales_activities_select_owner_or_read" on public.sales_activities;
create policy "sales_activities_select_owner_or_read"
on public.sales_activities for select to authenticated
using (
  public.fn_has_permission('read_sales_activity')
  or public.fn_is_manager()
  or exists (
    select 1
    from public.sales_leads l
    where l.id = sales_activities.lead_id
      and l.owner_id = public.fn_current_user_id()
  )
);

drop policy if exists "sales_activities_insert_owner_or_manage" on public.sales_activities;
create policy "sales_activities_insert_owner_or_manage"
on public.sales_activities for insert to authenticated
with check (
  public.fn_has_permission('read_sales_activity')
  or public.fn_is_manager()
  or exists (
    select 1
    from public.sales_leads l
    where l.id = sales_activities.lead_id
      and l.owner_id = public.fn_current_user_id()
  )
);

drop policy if exists "sales_activities_delete_manager_or_manage" on public.sales_activities;
create policy "sales_activities_delete_manager_or_manage"
on public.sales_activities for delete to authenticated
using (
  public.fn_is_manager()
  or public.fn_has_permission('manage_sales_leads')
);

-- reasons: readable for authenticated with permission
drop policy if exists "sales_reasons_select_sales_reason_read" on public.sales_reasons;
create policy "sales_reasons_select_sales_reason_read"
on public.sales_reasons for select to authenticated
using (
  public.fn_has_permission('read_sales_reasons')
  or public.fn_is_manager()
);

drop policy if exists "sales_reasons_manage_manager" on public.sales_reasons;
create policy "sales_reasons_manage_manager"
on public.sales_reasons for all to authenticated
using (public.fn_is_manager())
with check (public.fn_is_manager());

------------------------------------------------------------
-- RLS: marketing domain
------------------------------------------------------------

-- campaigns: read for read_marketing_data; manage only for manager (or could be added later)
drop policy if exists "marketing_campaigns_select" on public.marketing_campaigns;
create policy "marketing_campaigns_select"
on public.marketing_campaigns for select to authenticated
using (
  public.fn_has_permission('read_marketing_data')
  or public.fn_is_manager()
);

drop policy if exists "marketing_campaigns_manage_manager" on public.marketing_campaigns;
create policy "marketing_campaigns_manage_manager"
on public.marketing_campaigns for all to authenticated
using (public.fn_is_manager())
with check (public.fn_is_manager());

-- offline events: read_marketing_data; manage_offline_events for mutations
drop policy if exists "offline_events_select" on public.offline_events;
create policy "offline_events_select"
on public.offline_events for select to authenticated
using (
  public.fn_has_permission('read_marketing_data')
  or public.fn_is_manager()
);

drop policy if exists "offline_events_manage" on public.offline_events;
drop policy if exists "offline_events_insert" on public.offline_events;
drop policy if exists "offline_events_update" on public.offline_events;
drop policy if exists "offline_events_delete" on public.offline_events;

create policy "offline_events_insert"
on public.offline_events for insert to authenticated
with check (
  public.fn_has_permission('manage_offline_events')
  or public.fn_is_manager()
);

create policy "offline_events_update"
on public.offline_events for update to authenticated
using (
  public.fn_has_permission('manage_offline_events')
  or public.fn_is_manager()
)
with check (
  public.fn_has_permission('manage_offline_events')
  or public.fn_is_manager()
);

create policy "offline_events_delete"
on public.offline_events for delete to authenticated
using (
  public.fn_has_permission('manage_offline_events')
  or public.fn_is_manager()
);
-- seo/sem: read_marketing_data; manage_seo_sem for mutations
drop policy if exists "seo_sem_campaigns_select" on public.seo_sem_campaigns;
create policy "seo_sem_campaigns_select"
on public.seo_sem_campaigns for select to authenticated
using (
  public.fn_has_permission('read_marketing_data')
  or public.fn_is_manager()
);

drop policy if exists "seo_sem_campaigns_manage" on public.seo_sem_campaigns;
drop policy if exists "seo_sem_campaigns_insert" on public.seo_sem_campaigns;
drop policy if exists "seo_sem_campaigns_update" on public.seo_sem_campaigns;
drop policy if exists "seo_sem_campaigns_delete" on public.seo_sem_campaigns;

create policy "seo_sem_campaigns_insert"
on public.seo_sem_campaigns for insert to authenticated
with check (
  public.fn_has_permission('manage_seo_sem')
  or public.fn_is_manager()
);

create policy "seo_sem_campaigns_update"
on public.seo_sem_campaigns for update to authenticated
using (
  public.fn_has_permission('manage_seo_sem')
  or public.fn_is_manager()
)
with check (
  public.fn_has_permission('manage_seo_sem')
  or public.fn_is_manager()
);

create policy "seo_sem_campaigns_delete"
on public.seo_sem_campaigns for delete to authenticated
using (
  public.fn_has_permission('manage_seo_sem')
  or public.fn_is_manager()
);
-- website analytics + digital channels + attribution: manage by manager for now; read by marketing read
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['website_analytics','digital_channels','marketing_attribution'] LOOP
    EXECUTE format('drop policy if exists "%s_select" on public.%I;', tbl, tbl);
    EXECUTE format(
      'create policy "%s_select" on public.%I for select to authenticated using (public.fn_has_permission(''read_marketing_data'') or public.fn_is_manager());',
      tbl, tbl
    );

    EXECUTE format('drop policy if exists "%s_manage_manager" on public.%I;', tbl, tbl);
    EXECUTE format(
      'create policy "%s_manage_manager" on public.%I for all to authenticated using (public.fn_is_manager()) with check (public.fn_is_manager());',
      tbl, tbl
    );
  END LOOP;
END $$;

-- content pieces: read_marketing_data; manage_content_pieces for mutations
drop policy if exists "content_pieces_select" on public.content_pieces;
create policy "content_pieces_select"
on public.content_pieces for select to authenticated
using (
  public.fn_has_permission('read_marketing_data')
  or public.fn_is_manager()
);

drop policy if exists "content_pieces_manage" on public.content_pieces;
drop policy if exists "content_pieces_insert" on public.content_pieces;
drop policy if exists "content_pieces_update" on public.content_pieces;
drop policy if exists "content_pieces_delete" on public.content_pieces;

create policy "content_pieces_insert"
on public.content_pieces for insert to authenticated
with check (
  public.fn_has_permission('manage_content_pieces')
  or public.fn_is_manager()
);

create policy "content_pieces_update"
on public.content_pieces for update to authenticated
using (
  public.fn_has_permission('manage_content_pieces')
  or public.fn_is_manager()
)
with check (
  public.fn_has_permission('manage_content_pieces')
  or public.fn_is_manager()
);

create policy "content_pieces_delete"
on public.content_pieces for delete to authenticated
using (
  public.fn_has_permission('manage_content_pieces')
  or public.fn_is_manager()
);
------------------------------------------------------------
-- RLS: operations domain
------------------------------------------------------------

-- SLA/status: read for ops read; manage manager
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['ops_sla','ops_ticket_statuses'] LOOP
    EXECUTE format('drop policy if exists "%s_select" on public.%I;', tbl, tbl);
    EXECUTE format(
      'create policy "%s_select" on public.%I for select to authenticated using (public.fn_has_permission(''read_ops_data'') or public.fn_is_manager());',
      tbl, tbl
    );

    EXECUTE format('drop policy if exists "%s_manage_manager" on public.%I;', tbl, tbl);
    EXECUTE format(
      'create policy "%s_manage_manager" on public.%I for all to authenticated using (public.fn_is_manager()) with check (public.fn_is_manager());',
      tbl, tbl
    );
  END LOOP;
END $$;

-- tickets: reporter/assignee OR read_ops_data; manage_ops_tickets for mutations
drop policy if exists "ops_tickets_select" on public.ops_tickets;
create policy "ops_tickets_select"
on public.ops_tickets for select to authenticated
using (
  reporter_id = public.fn_current_user_id()
  or assignee_id = public.fn_current_user_id()
  or public.fn_has_permission('read_ops_data')
  or public.fn_is_manager()
);

drop policy if exists "ops_tickets_insert" on public.ops_tickets;
create policy "ops_tickets_insert"
on public.ops_tickets for insert to authenticated
with check (
  reporter_id = public.fn_current_user_id()
  or public.fn_has_permission('manage_ops_tickets')
  or public.fn_is_manager()
);

drop policy if exists "ops_tickets_update" on public.ops_tickets;
create policy "ops_tickets_update"
on public.ops_tickets for update to authenticated
using (
  reporter_id = public.fn_current_user_id()
  or assignee_id = public.fn_current_user_id()
  or public.fn_has_permission('manage_ops_tickets')
  or public.fn_is_manager()
)
with check (
  reporter_id = public.fn_current_user_id()
  or assignee_id = public.fn_current_user_id()
  or public.fn_has_permission('manage_ops_tickets')
  or public.fn_is_manager()
);

drop policy if exists "ops_tickets_delete" on public.ops_tickets;
create policy "ops_tickets_delete"
on public.ops_tickets for delete to authenticated
using (
  public.fn_has_permission('manage_ops_tickets')
  or public.fn_is_manager()
);

------------------------------------------------------------
-- RLS: finance domain
------------------------------------------------------------

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['customers','accounts','finance_transactions','ar_aging','finance_margin'] LOOP
    EXECUTE format('drop policy if exists "%s_select" on public.%I;', tbl, tbl);
    EXECUTE format(
      'create policy "%s_select" on public.%I for select to authenticated using (public.fn_has_permission(''read_finance_data'') or public.fn_is_manager());',
      tbl, tbl
    );

    -- Backward-compat: drop old combined policy name if script v1 ran partially
    EXECUTE format('drop policy if exists "%s_manage" on public.%I;', tbl, tbl);

    EXECUTE format('drop policy if exists "%s_manage_insert" on public.%I;', tbl, tbl);
    EXECUTE format(
      'create policy "%s_manage_insert" on public.%I for insert to authenticated with check (public.fn_has_permission(''manage_finance_data'') or public.fn_is_manager());',
      tbl, tbl
    );

    EXECUTE format('drop policy if exists "%s_manage_update" on public.%I;', tbl, tbl);
    EXECUTE format(
      'create policy "%s_manage_update" on public.%I for update to authenticated using (public.fn_has_permission(''manage_finance_data'') or public.fn_is_manager()) with check (public.fn_has_permission(''manage_finance_data'') or public.fn_is_manager());',
      tbl, tbl
    );

    EXECUTE format('drop policy if exists "%s_manage_delete" on public.%I;', tbl, tbl);
    EXECUTE format(
      'create policy "%s_manage_delete" on public.%I for delete to authenticated using (public.fn_has_permission(''manage_finance_data'') or public.fn_is_manager());',
      tbl, tbl
    );
  END LOOP;
END $$;


------------------------------------------------------------
-- RLS: KPI metrics (read depends on domain; manage by specific manage permissions or manager)
------------------------------------------------------------
drop policy if exists "kpi_metrics_select" on public.kpi_metrics;
create policy "kpi_metrics_select"
on public.kpi_metrics for select to authenticated
using (
  public.fn_is_manager()
  or (
    domain = 'marketing' and public.fn_has_permission('read_marketing_data')
  )
  or (
    domain = 'sales' and public.fn_has_permission('read_sales_overview')
  )
  or (
    domain = 'ops' and public.fn_has_permission('read_ops_data')
  )
  or (
    domain = 'finance' and public.fn_has_permission('read_finance_data')
  )
);

drop policy if exists "kpi_metrics_manage" on public.kpi_metrics;
drop policy if exists "kpi_metrics_insert" on public.kpi_metrics;
drop policy if exists "kpi_metrics_update" on public.kpi_metrics;
drop policy if exists "kpi_metrics_delete" on public.kpi_metrics;

create policy "kpi_metrics_insert"
on public.kpi_metrics for insert to authenticated
with check (
  public.fn_is_manager()
  or (domain = 'marketing' and public.fn_has_permission('manage_marketing_kpi'))
  or (domain = 'finance' and public.fn_has_permission('manage_finance_data'))
);

create policy "kpi_metrics_update"
on public.kpi_metrics for update to authenticated
using (
  public.fn_is_manager()
  or (domain = 'marketing' and public.fn_has_permission('manage_marketing_kpi'))
  or (domain = 'finance' and public.fn_has_permission('manage_finance_data'))
)
with check (
  public.fn_is_manager()
  or (domain = 'marketing' and public.fn_has_permission('manage_marketing_kpi'))
  or (domain = 'finance' and public.fn_has_permission('manage_finance_data'))
);

create policy "kpi_metrics_delete"
on public.kpi_metrics for delete to authenticated
using (
  public.fn_is_manager()
  or (domain = 'marketing' and public.fn_has_permission('manage_marketing_kpi'))
  or (domain = 'finance' and public.fn_has_permission('manage_finance_data'))
);
------------------------------------------------------------
-- 2000_seed: roles, permissions, role_permissions, master data, minimal domain seeds
------------------------------------------------------------

-- Roles (aligned to lib/rbac/roles.ts)
insert into public.roles (name, description, is_manager)
values
  ('director', 'Director role with broad visibility and decision rights', true),
  ('admin', 'System administrator role', true),
  ('sales', 'Sales team role', false),
  ('marketing', 'Marketing team role', false),
  ('ops', 'Operations team role', false),
  ('finance', 'Finance team role', false)
on conflict (name) do update
set description = excluded.description,
    is_manager = excluded.is_manager;

-- Permissions (aligned to lib/rbac/permissions.ts)
insert into public.permissions (name, description)
values
  -- Sales
  ('read_sales_overview', 'Read sales dashboard overview metrics'),
  ('read_sales_pipeline', 'Read sales pipeline data'),
  ('read_sales_activity', 'Read sales activity data'),
  ('read_sales_reasons', 'Read sales reasons taxonomy'),
  ('manage_sales_leads', 'Create/update/delete sales leads'),
  -- Marketing
  ('read_marketing_data', 'Read marketing dashboard data'),
  ('manage_offline_events', 'Create/update/delete offline marketing events'),
  ('manage_seo_sem', 'Create/update/delete SEO/SEM campaign metrics'),
  ('manage_content_pieces', 'Create/update/delete marketing content pieces'),
  ('manage_marketing_kpi', 'Create/update/delete marketing KPIs'),
  -- Operations
  ('read_ops_data', 'Read operations dashboard data'),
  ('manage_ops_tickets', 'Create/update/delete operations tickets'),
  -- Finance
  ('read_finance_data', 'Read finance dashboard data'),
  ('manage_finance_data', 'Create/update/delete finance data'),
  -- Admin / RBAC
  ('read_users', 'Read users list'),
  ('manage_users', 'Create/update/deactivate users'),
  ('read_roles', 'Read roles'),
  ('manage_roles', 'Create/update/delete roles'),
  ('read_permissions', 'Read permissions'),
  ('manage_permissions', 'Create/update/delete permissions')
on conflict (name) do update
set description = excluded.description;

-- Helper CTE to map permissions to roles
with r as (
  select name, id from public.roles
),
p as (
  select name, id from public.permissions
),
pairs as (
  -- director: all permissions
  select r.id as role_id, p.id as permission_id
  from r, p
  where r.name = 'director'

  union all
  -- admin: all permissions
  select r.id, p.id
  from r, p
  where r.name = 'admin'

  union all
  -- sales
  select (select id from r where name='sales'), p.id
  from p where p.name in (
    'read_sales_overview','read_sales_pipeline','read_sales_activity','read_sales_reasons','manage_sales_leads'
  )

  union all
  -- marketing
  select (select id from r where name='marketing'), p.id
  from p where p.name in (
    'read_marketing_data','manage_offline_events','manage_seo_sem','manage_content_pieces','manage_marketing_kpi'
  )

  union all
  -- ops
  select (select id from r where name='ops'), p.id
  from p where p.name in (
    'read_ops_data','manage_ops_tickets'
  )

  union all
  -- finance
  select (select id from r where name='finance'), p.id
  from p where p.name in (
    'read_finance_data','manage_finance_data'
  )
)
insert into public.role_permissions (role_id, permission_id)
select distinct role_id, permission_id
from pairs
on conflict do nothing;

-- Seed minimal master data
insert into public.countries (code, name) values
  ('ID', 'Indonesia')
on conflict (code) do nothing;

insert into public.currencies (code, name, symbol) values
  ('IDR', 'Indonesian Rupiah', 'Rp')
on conflict (code) do nothing;

-- Seed sales pipeline stages
insert into public.sales_pipeline_stages (name, sequence, is_active) values
  ('Prospecting', 1, true),
  ('Qualified', 2, true),
  ('Proposal', 3, true),
  ('Negotiation', 4, true),
  ('Closed Won', 5, true),
  ('Closed Lost', 6, true)
on conflict (name) do update set sequence = excluded.sequence, is_active = excluded.is_active;

-- Seed sales reasons taxonomy (matches types/sales.ts)
insert into public.sales_reasons (name, category, is_active) values
  ('Price too high', 'lost_reason', true),
  ('Missing features', 'lost_reason', true),
  ('Chose competitor', 'lost_reason', true),
  ('No response', 'stuck_reason', true)
on conflict do nothing;

-- Seed ops SLA and ticket statuses
insert into public.ops_sla (name, resolution_target_hours, priority_level) values
  ('Standard', 72, 'normal'),
  ('Urgent', 24, 'high')
on conflict (name) do update set resolution_target_hours = excluded.resolution_target_hours, priority_level = excluded.priority_level;

insert into public.ops_ticket_statuses (name, "order", is_final) values
  ('Open', 1, false),
  ('In Progress', 2, false),
  ('Waiting', 3, false),
  ('Closed', 4, true)
on conflict (name) do update set "order" = excluded."order", is_final = excluded.is_final;

-- Seed finance basic references (no profiles dependency)
insert into public.accounts (name, type, balance) values
  ('Cash', 'asset', 0),
  ('Accounts Receivable', 'asset', 0),
  ('Revenue', 'income', 0),
  ('COGS', 'expense', 0)
on conflict (name) do update set type = excluded.type;

-- Seed KPI definitions (example placeholders)
insert into public.kpi_metrics (domain, name, description, calculation, target_value, is_active)
values
  ('marketing', 'Cost per Lead', 'Total spend / total leads', 'derived:v_marketing_overview', null, true),
  ('marketing', 'ROAS', 'Revenue attributable / ad spend', 'manual', null, true),
  ('sales', 'Leads Created', 'Count of leads created in period', 'sql:count(sales_leads.id)', null, true),
  ('ops', 'Open Tickets', 'Count of tickets not closed', 'sql:count(ops_tickets.id where closed_at is null)', null, true),
  ('finance', 'Gross Margin', 'Revenue - COGS', 'sql:sum(finance_margin.margin)', null, true)
on conflict (domain, name) do update
set description = excluded.description,
    calculation = excluded.calculation,
    target_value = excluded.target_value,
    is_active = excluded.is_active;

commit;

-- End of ugc_dashboard Supabase SQL
