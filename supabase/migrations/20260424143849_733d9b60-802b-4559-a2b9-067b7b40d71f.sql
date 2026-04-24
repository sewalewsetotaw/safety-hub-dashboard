
-- AUDITS
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  title text not null,
  audit_type text not null default 'internal',
  scope text,
  auditor text,
  status text not null default 'planned',
  planned_date date,
  completed_at timestamptz,
  findings_count integer default 0,
  score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.audits enable row level security;
create policy "Audits viewable by authenticated" on public.audits for select to authenticated using (true);
create policy "Authenticated can insert audits" on public.audits for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update audits" on public.audits for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete audits" on public.audits for delete to authenticated using (auth.uid() = created_by);
create trigger audits_set_updated_at before update on public.audits for each row execute function public.set_updated_at();

-- COMPLIANCE
create table public.compliance_items (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  title text not null,
  framework text not null default 'ISO 45001',
  clause text,
  owner text,
  status text not null default 'pending',
  due_date date,
  evidence_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.compliance_items enable row level security;
create policy "Compliance viewable by authenticated" on public.compliance_items for select to authenticated using (true);
create policy "Authenticated can insert compliance" on public.compliance_items for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update compliance" on public.compliance_items for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete compliance" on public.compliance_items for delete to authenticated using (auth.uid() = created_by);
create trigger compliance_items_set_updated_at before update on public.compliance_items for each row execute function public.set_updated_at();

-- ENVIRONMENTAL
create table public.environmental_readings (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  site text not null,
  metric text not null,
  value numeric not null,
  unit text not null default 'mg/m3',
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.environmental_readings enable row level security;
create policy "Env viewable by authenticated" on public.environmental_readings for select to authenticated using (true);
create policy "Authenticated can insert env" on public.environmental_readings for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update env" on public.environmental_readings for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete env" on public.environmental_readings for delete to authenticated using (auth.uid() = created_by);
create trigger environmental_readings_set_updated_at before update on public.environmental_readings for each row execute function public.set_updated_at();

-- JOURNEY
create table public.journey_trips (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  trip_number text not null,
  driver text not null,
  vehicle text,
  origin text not null,
  destination text not null,
  distance_km numeric,
  eta text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.journey_trips enable row level security;
create policy "Trips viewable by authenticated" on public.journey_trips for select to authenticated using (true);
create policy "Authenticated can insert trips" on public.journey_trips for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update trips" on public.journey_trips for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete trips" on public.journey_trips for delete to authenticated using (auth.uid() = created_by);
create trigger journey_trips_set_updated_at before update on public.journey_trips for each row execute function public.set_updated_at();

-- RISK
create table public.risk_register (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  title text not null,
  category text not null default 'operational',
  likelihood integer not null default 1,
  impact integer not null default 1,
  score integer generated always as (likelihood * impact) stored,
  mitigation text,
  owner text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.risk_register enable row level security;
create policy "Risk viewable by authenticated" on public.risk_register for select to authenticated using (true);
create policy "Authenticated can insert risk" on public.risk_register for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update risk" on public.risk_register for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete risk" on public.risk_register for delete to authenticated using (auth.uid() = created_by);
create trigger risk_register_set_updated_at before update on public.risk_register for each row execute function public.set_updated_at();

-- SUBCONTRACTORS
create table public.subcontractors (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  company_name text not null,
  trade text,
  contact_name text,
  contact_email text,
  status text not null default 'pending',
  prequalified_until date,
  safety_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subcontractors enable row level security;
create policy "Subcontractors viewable by authenticated" on public.subcontractors for select to authenticated using (true);
create policy "Authenticated can insert subcontractors" on public.subcontractors for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update subcontractors" on public.subcontractors for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete subcontractors" on public.subcontractors for delete to authenticated using (auth.uid() = created_by);
create trigger subcontractors_set_updated_at before update on public.subcontractors for each row execute function public.set_updated_at();

-- TRAINING
create table public.training_records (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  employee_name text not null,
  course text not null,
  provider text,
  completed_at date,
  expires_at date,
  status text not null default 'scheduled',
  score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.training_records enable row level security;
create policy "Training viewable by authenticated" on public.training_records for select to authenticated using (true);
create policy "Authenticated can insert training" on public.training_records for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update training" on public.training_records for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete training" on public.training_records for delete to authenticated using (auth.uid() = created_by);
create trigger training_records_set_updated_at before update on public.training_records for each row execute function public.set_updated_at();
