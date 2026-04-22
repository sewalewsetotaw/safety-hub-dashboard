-- Helper: updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Vehicles
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  asset_id text not null unique,
  type text not null,
  driver text,
  site text,
  status text not null default 'active' check (status in ('active','grounded','maintenance')),
  last_inspection timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "Vehicles viewable by authenticated"
  on public.vehicles for select to authenticated using (true);
create policy "Authenticated can insert vehicles"
  on public.vehicles for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update vehicles"
  on public.vehicles for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete vehicles"
  on public.vehicles for delete to authenticated using (auth.uid() = created_by);

create trigger vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();

-- 3. Incidents
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text not null default 'low' check (severity in ('low','medium','high','critical')),
  incident_type text not null default 'near-miss',
  location text,
  status text not null default 'open' check (status in ('open','in-progress','closed')),
  occurred_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.incidents enable row level security;

create policy "Incidents viewable by authenticated"
  on public.incidents for select to authenticated using (true);
create policy "Authenticated can insert incidents"
  on public.incidents for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update incidents"
  on public.incidents for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete incidents"
  on public.incidents for delete to authenticated using (auth.uid() = created_by);

create trigger incidents_updated_at before update on public.incidents
  for each row execute function public.set_updated_at();

-- 4. Inspections
create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  inspection_type text not null default 'site',
  location text,
  score integer check (score is null or (score >= 0 and score <= 100)),
  status text not null default 'pending' check (status in ('pending','in-progress','closed','overdue')),
  due_date date,
  completed_at timestamptz,
  notes text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inspections enable row level security;

create policy "Inspections viewable by authenticated"
  on public.inspections for select to authenticated using (true);
create policy "Authenticated can insert inspections"
  on public.inspections for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update inspections"
  on public.inspections for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete inspections"
  on public.inspections for delete to authenticated using (auth.uid() = created_by);

create trigger inspections_updated_at before update on public.inspections
  for each row execute function public.set_updated_at();

-- 5. Permits to Work
create table public.permits (
  id uuid primary key default gen_random_uuid(),
  permit_number text not null unique,
  title text not null,
  permit_type text not null default 'general',
  location text,
  contractor text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','closed')),
  valid_from date,
  valid_until date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.permits enable row level security;

create policy "Permits viewable by authenticated"
  on public.permits for select to authenticated using (true);
create policy "Authenticated can insert permits"
  on public.permits for insert to authenticated with check (auth.uid() = created_by);
create policy "Owner can update permits"
  on public.permits for update to authenticated using (auth.uid() = created_by);
create policy "Owner can delete permits"
  on public.permits for delete to authenticated using (auth.uid() = created_by);

create trigger permits_updated_at before update on public.permits
  for each row execute function public.set_updated_at();