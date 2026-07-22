-- 1. Safe Zones
create table if not exists safe_zones (
  id text primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius double precision not null,
  is_active boolean default true,
  type text not null
);

-- 2. Children
create table if not exists children (
  id text primary key,
  name text not null,
  avatar text not null,
  latitude double precision not null,
  longitude double precision not null,
  last_seen text not null,
  battery_level integer not null default 100,
  current_safe_zone_id text references safe_zones(id) on delete set null,
  coins integer default 0,
  xp integer default 0,
  protection_mode text default 'standard',
  birth_date text,
  characteristics text,
  emergency_contact text
);

-- 3. Tasks
create table if not exists tasks (
  id text primary key,
  child_id text references children(id) on delete cascade,
  title text not null,
  description text,
  reward_coins integer not null default 0,
  is_completed boolean default false,
  is_approved boolean default false,
  category text not null,
  due_date text
);

-- 4. Rewards
create table if not exists rewards (
  id text primary key,
  child_id text references children(id) on delete cascade,
  title text not null,
  description text,
  cost_coins integer not null default 0,
  is_redeemed boolean default false,
  is_approved boolean default false
);

-- 5. Alerts
create table if not exists alerts (
  id text primary key,
  child_id text references children(id) on delete cascade,
  child_name text not null,
  type text not null,
  message text not null,
  timestamp text not null,
  is_read boolean default false,
  latitude double precision,
  longitude double precision
);

-- RLS RULES

-- Enable RLS for all tables
alter table safe_zones enable row level security;
alter table children enable row level security;
alter table tasks enable row level security;
alter table rewards enable row level security;
alter table alerts enable row level security;

-- For this application context (since we don't have a rigid multi-tenant architecture yet),
-- we will allow authenticated users to read and write to all tables.
-- IN A PRODUCTION SCENARIO, you should link these records to auth.uid() and only allow users to see their own data.

create policy "Allow full access to authenticated users on safe_zones" on safe_zones for all to authenticated using (true);
create policy "Allow full access to authenticated users on children" on children for all to authenticated using (true);
create policy "Allow full access to authenticated users on tasks" on tasks for all to authenticated using (true);
create policy "Allow full access to authenticated users on rewards" on rewards for all to authenticated using (true);
create policy "Allow full access to authenticated users on alerts" on alerts for all to authenticated using (true);
