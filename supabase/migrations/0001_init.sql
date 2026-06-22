-- StockLog — initial schema (see SCHEMA.md for the source of truth)
-- Run this once in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create table shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),
  owner_name text,
  shop_name text not null,
  created_at timestamptz not null default now()
);

create index shops_owner_id_idx on shops (owner_id);

create table inventory (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id),
  device_name text not null,
  brand text,
  imei text not null unique,
  color text,
  storage text,
  condition text check (condition in ('New', 'UK Used', 'NG Used')),
  cost_price integer,
  selling_price integer,
  status text not null default 'in_stock' check (status in ('in_stock', 'sold')),
  date_of_entry date not null default current_date,
  created_at timestamptz not null default now()
);

create index inventory_shop_id_idx on inventory (shop_id);

create table sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id),
  inventory_id uuid not null references inventory (id),
  buyer_name text,
  buyer_phone text,
  selling_price integer not null,
  payment_method text check (payment_method in ('Cash', 'Transfer')),
  date_of_sale date not null default current_date,
  created_at timestamptz not null default now()
);

create index sales_shop_id_idx on sales (shop_id);
create index sales_inventory_id_idx on sales (inventory_id);

-- Row Level Security ----------------------------------------------------

alter table shops enable row level security;
alter table inventory enable row level security;
alter table sales enable row level security;

-- shops: a user can only see/create/update their own shop row.
create policy "shops_select_own" on shops
  for select using (owner_id = auth.uid());

create policy "shops_insert_own" on shops
  for insert with check (owner_id = auth.uid());

create policy "shops_update_own" on shops
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- inventory: scoped to shops owned by the current user.
create policy "inventory_select_own_shop" on inventory
  for select using (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "inventory_insert_own_shop" on inventory
  for insert with check (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "inventory_update_own_shop" on inventory
  for update
  using (shop_id in (select id from shops where owner_id = auth.uid()))
  with check (shop_id in (select id from shops where owner_id = auth.uid()));

-- sales: scoped to shops owned by the current user.
create policy "sales_select_own_shop" on sales
  for select using (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "sales_insert_own_shop" on sales
  for insert with check (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "sales_update_own_shop" on sales
  for update
  using (shop_id in (select id from shops where owner_id = auth.uid()))
  with check (shop_id in (select id from shops where owner_id = auth.uid()));
