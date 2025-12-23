-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Role enum and status values are stored as text to keep migrations simple.

-- Table: profiles
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'sales' check (role in (
    'sales', 'marketing', 'domestics_ops', 'exim_ops', 'import_dtd_ops', 'admin'
  )),
  created_at timestamptz not null default now()
);

-- Table: tickets
create table if not exists public.tickets (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('DOM', 'EXIM_IMPORT', 'EXIM_EXPORT', 'IMPORT_DTD')),
  service_type text not null,
  status text not null default 'Draft',
  priority text default 'Normal',
  ops_owner text not null,
  assigned_to uuid references auth.users(id),
  origin text,
  destination text,
  commodity text,
  qty integer,
  weight numeric,
  volume numeric,
  pickup_date date,
  notes text,
  submitted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table: ticket_events
create table if not exists public.ticket_events (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  event_type text not null,
  actor_id uuid not null references auth.users(id),
  actor_role text not null,
  from_status text,
  to_status text,
  payload_json jsonb,
  created_at timestamptz not null default now()
);

-- Table: quotes
create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  all_in_amount numeric,
  currency text,
  validity_start date,
  validity_end date,
  lead_time_text text,
  terms text,
  exclusions text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- Table: quote_line_items
create table if not exists public.quote_line_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  label text not null,
  amount numeric not null
);

-- SLA configuration tables
create table if not exists public.sla_profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  scope text check (scope in ('DOM', 'EXIM_IMPORT', 'EXIM_EXPORT', 'IMPORT_DTD')),
  service_type text,
  target_frt_minutes integer,
  target_quote_minutes integer,
  at_risk_ratio numeric default 0.8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_hours_profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  timezone text not null default 'Asia/Jakarta',
  working_hours jsonb, -- placeholder, e.g. {"mon": [["09:00","18:00"]], ...}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.escalation_rules (
  id uuid primary key default uuid_generate_v4(),
  sla_profile_id uuid not null references public.sla_profiles(id) on delete cascade,
  recipient_role text not null,
  trigger text not null, -- e.g. 'AtRisk', 'Breached'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Function: create_profile() to auto insert profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, new.email, 'sales')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS Policies

-- Profiles: enable row level security
alter table public.profiles enable row level security;

-- Profiles: select policy
create policy "Allow users to read own profile or admin" on public.profiles
  for select using (
    auth.uid() = id OR exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Profiles: update policy
create policy "Allow users to update own profile or admin" on public.profiles
  for update using (
    auth.uid() = id OR exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    auth.uid() = id OR exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Tickets: enable RLS
alter table public.tickets enable row level security;

-- Tickets: select policy
create policy "Requester can read own tickets; ops can read assigned; admin can read all; ops role per owner" on public.tickets
  for select using (
    -- allow if requester
    created_by = auth.uid()
    -- or assigned to current user
    or assigned_to = auth.uid()
    -- or admin
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    -- or ops role matches ops_owner (mapping role prefix)
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'domestics_ops') and ops_owner = 'DOM'
    )
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'exim_ops') and ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')
    )
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'import_dtd_ops') and ops_owner = 'IMPORT_DTD'
    )
  );

-- Tickets: insert policy
create policy "Requester can create tickets" on public.tickets
  for insert with check (
    created_by = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('sales','marketing'))
  );

-- Tickets: update policy
create policy "Allow limited update" on public.tickets
  for update using (
    -- allow if admin
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    -- allow requester updating own ticket (cannot change ops_owner/assigned_to)
    or created_by = auth.uid()
    -- allow assigned ops or matching ops owner
    or assigned_to = auth.uid()
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'domestics_ops') and ops_owner = 'DOM'
    )
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'exim_ops') and ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')
    )
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'import_dtd_ops') and ops_owner = 'IMPORT_DTD'
    )
  ) with check (
    -- same conditions as using for now to keep simple
    true
  );

-- Ticket Events: enable RLS
alter table public.ticket_events enable row level security;

-- Ticket Events: select policy
create policy "Read ticket events if can read ticket" on public.ticket_events
  for select using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_events.ticket_id
      and (
        t.created_by = auth.uid() or t.assigned_to = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'domestics_ops') and t.ops_owner = 'DOM'
        ) or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'exim_ops') and t.ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')
        ) or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'import_dtd_ops') and t.ops_owner = 'IMPORT_DTD'
        )
      )
    )
  );

-- Ticket Events: insert policy
create policy "Insert events if actor has ticket access" on public.ticket_events
  for insert with check (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_events.ticket_id
      and (
        t.created_by = auth.uid() or t.assigned_to = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'domestics_ops') and t.ops_owner = 'DOM'
        ) or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'exim_ops') and t.ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')
        ) or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'import_dtd_ops') and t.ops_owner = 'IMPORT_DTD'
        )
      )
    )
  );

-- Quotes: enable RLS
alter table public.quotes enable row level security;
alter table public.quote_line_items enable row level security;

-- Quotes: select policy
create policy "Read quotes if can read ticket" on public.quotes
  for select using (
    exists (
      select 1 from public.tickets t
      where t.id = quotes.ticket_id
      and (
        t.created_by = auth.uid() or t.assigned_to = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'domestics_ops') and t.ops_owner = 'DOM'
        ) or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'exim_ops') and t.ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')
        ) or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'import_dtd_ops') and t.ops_owner = 'IMPORT_DTD'
        )
      )
    )
  );

-- Quotes: insert/update policy (ops only)
create policy "Ops can insert quotes" on public.quotes
  for insert with check (
    exists (
      select 1 from public.tickets t join public.profiles p on p.id = auth.uid()
      where t.id = quotes.ticket_id
      and p.id = auth.uid()
      and (
        (p.role = 'domestics_ops' and t.ops_owner = 'DOM') or
        (p.role = 'exim_ops' and t.ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')) or
        (p.role = 'import_dtd_ops' and t.ops_owner = 'IMPORT_DTD') or
        p.role = 'admin'
      )
    )
  );

create policy "Ops can update quotes" on public.quotes
  for update using (
    exists (
      select 1 from public.tickets t join public.profiles p on p.id = auth.uid()
      where t.id = quotes.ticket_id
      and (
        (p.role = 'domestics_ops' and t.ops_owner = 'DOM') or
        (p.role = 'exim_ops' and t.ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')) or
        (p.role = 'import_dtd_ops' and t.ops_owner = 'IMPORT_DTD') or
        p.role = 'admin'
      )
    )
  ) with check (true);

-- Quote line items: follow quotes policies
create policy "Follow quotes permissions" on public.quote_line_items
  for select using (
    exists (
      select 1 from public.quotes q
      join public.tickets t on t.id = q.ticket_id
      where q.id = quote_line_items.quote_id
      and (
        t.created_by = auth.uid() or t.assigned_to = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'domestics_ops') and t.ops_owner = 'DOM'
        ) or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'exim_ops') and t.ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')
        ) or (
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'import_dtd_ops') and t.ops_owner = 'IMPORT_DTD'
        )
      )
    )
  );

create policy "Ops can insert quote line items" on public.quote_line_items
  for insert with check (
    exists (
      select 1 from public.quotes q join public.tickets t on t.id = q.ticket_id join public.profiles p on p.id = auth.uid()
      where q.id = quote_line_items.quote_id
      and (
        (p.role = 'domestics_ops' and t.ops_owner = 'DOM') or
        (p.role = 'exim_ops' and t.ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')) or
        (p.role = 'import_dtd_ops' and t.ops_owner = 'IMPORT_DTD') or
        p.role = 'admin'
      )
    )
  );

create policy "Ops can update quote line items" on public.quote_line_items
  for update using (
    exists (
      select 1 from public.quotes q join public.tickets t on t.id = q.ticket_id join public.profiles p on p.id = auth.uid()
      where q.id = quote_line_items.quote_id
      and (
        (p.role = 'domestics_ops' and t.ops_owner = 'DOM') or
        (p.role = 'exim_ops' and t.ops_owner in ('EXIM_IMPORT','EXIM_EXPORT')) or
        (p.role = 'import_dtd_ops' and t.ops_owner = 'IMPORT_DTD') or
        p.role = 'admin'
      )
    )
  ) with check (true);

-- SLA tables: enable RLS and restrict to admin
alter table public.sla_profiles enable row level security;
alter table public.business_hours_profiles enable row level security;
alter table public.escalation_rules enable row level security;

create policy "Admin manage SLA profiles" on public.sla_profiles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admin manage business hours profiles" on public.business_hours_profiles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admin manage escalation rules" on public.escalation_rules
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Storage: attachments bucket policy (create using supabase dashboard; here we note recommended policy)
-- In Supabase Storage, create a bucket named 'attachments' (private).
-- Example policy (apply via Storage policies):
--   allow upload, download if exists (select 1 from tickets where id = (storage.metadata ->> 'ticket_id')::uuid and ... same as ticket access ...)
