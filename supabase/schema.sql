-- GreenShop Supabase schema
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new',
  first_name text not null,
  last_name text not null,
  country text not null,
  city text not null,
  street_1 text not null,
  street_2 text,
  state text not null,
  zip text not null,
  phone text not null,
  email text not null,
  notes text,
  payment_method text not null default 'cod',
  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0
);

alter table public.orders
  add column if not exists status text not null default 'new';

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  sku text,
  unit_price numeric(12,2) not null default 0,
  qty integer not null default 1,
  line_total numeric(12,2) not null default 0
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin'))
);

create table if not exists public.app_products (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  category text not null check (category in ('Plants', 'Seeds', 'Accessories')),
  size text not null check (size in ('S', 'M', 'L')),
  price numeric(12,2) not null check (price > 0),
  old_price numeric(12,2),
  image text not null,
  badge text check (badge in ('Sale', 'New')),
  description text not null,
  sku text not null unique
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.app_users enable row level security;
alter table public.app_products enable row level security;

-- Demo/public mode for checkout without auth.
drop policy if exists "anon_insert_orders" on public.orders;
create policy "anon_insert_orders"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "anon_select_orders" on public.orders;
create policy "anon_select_orders"
  on public.orders
  for select
  to anon, authenticated
  using (true);

drop policy if exists "anon_insert_order_items" on public.order_items;
create policy "anon_insert_order_items"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "anon_select_order_items" on public.order_items;
create policy "anon_select_order_items"
  on public.order_items
  for select
  to anon, authenticated
  using (true);

-- app_users are accessed only by server routes with service role key.
drop policy if exists "deny_public_app_users" on public.app_users;
create policy "deny_public_app_users"
  on public.app_users
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "deny_public_app_products" on public.app_products;
create policy "deny_public_app_products"
  on public.app_products
  for all
  to anon, authenticated
  using (false)
  with check (false);
