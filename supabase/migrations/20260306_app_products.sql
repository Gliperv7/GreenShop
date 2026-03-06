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

alter table public.app_products enable row level security;

drop policy if exists "deny_public_app_products" on public.app_products;
create policy "deny_public_app_products"
  on public.app_products
  for all
  to anon, authenticated
  using (false)
  with check (false);
