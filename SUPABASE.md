# Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy `y/.env.example` to `y/.env` and set values:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (required for auth and admin status updates)
   - `AUTH_SESSION_SECRET` (long random secret for signed session cookie)
4. Restart dev server: `npm run dev`.

## What is stored
- `orders`: checkout customer and totals
- `order_items`: products linked to each order
- `app_users`: application users with hashed passwords and role (`user` / `admin`)

## Runtime behavior
- Checkout sends data to server endpoint `POST /api/orders`.
- Server endpoint writes to Supabase (`orders` + `order_items`) and sets initial `status = new`.
- If server request fails, checkout still works locally (`localStorage`).
- Login/register works through server endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`) and signed httpOnly cookie session.
- Private user pages (`/my-account`, `/address`, `/orders`) require authenticated session.
- Admin page `/admin-orders` requires `admin` role and updates order status via `PATCH /api/orders`.

## Promote admin user
Run in SQL editor:

```sql
update public.app_users
set role = 'admin'
where email = 'your-admin-email@example.com';
```
