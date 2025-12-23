-- Seed data for initial setup

-- Insert default business hours profile
insert into public.business_hours_profiles (id, name, timezone, working_hours)
values (
  uuid_generate_v4(),
  'Default Hours',
  'Asia/Jakarta',
  '{"mon": [["09:00","18:00"]], "tue": [["09:00","18:00"]], "wed": [["09:00","18:00"]], "thu": [["09:00","18:00"]], "fri": [["09:00","18:00"]]}'::jsonb
)
on conflict do nothing;

-- Insert default SLA profile for each scope/service_type combination
insert into public.sla_profiles (id, name, scope, service_type, target_frt_minutes, target_quote_minutes, at_risk_ratio)
values
  (uuid_generate_v4(), 'Default DOM LTL', 'DOM', 'LTL', 60, 240, 0.8),
  (uuid_generate_v4(), 'Default EXIM Import LCL', 'EXIM_IMPORT', 'LCL', 120, 480, 0.8),
  (uuid_generate_v4(), 'Default EXIM Export LCL', 'EXIM_EXPORT', 'LCL', 120, 480, 0.8),
  (uuid_generate_v4(), 'Default Import DTD LCL', 'IMPORT_DTD', 'LCL', 120, 480, 0.8)
on conflict do nothing;

-- Insert default escalation rules (placeholder)
insert into public.escalation_rules (id, sla_profile_id, recipient_role, trigger)
select uuid_generate_v4(), id, 'admin', 'Breached'
from public.sla_profiles
on conflict do nothing;