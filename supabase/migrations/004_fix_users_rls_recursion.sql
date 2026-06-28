-- Fix 42P17 infinite recursion in users RLS policies.
-- The original super_admin_all_users / admin_read_users policies SELECT from
-- users inside their own USING clause, which recurses. Any query whose policy
-- references users (every content table's admin_all_* policy) therefore errors,
-- breaking all anonymous public reads. Use a SECURITY DEFINER helper that reads
-- the role without triggering users RLS.

create or replace function public.is_staff(roles text[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from public.users
    where id = auth.uid() and role::text = any(roles)
  );
$$;

revoke all on function public.is_staff(text[]) from public;
grant execute on function public.is_staff(text[]) to anon, authenticated, service_role;

drop policy if exists "super_admin_all_users" on public.users;
create policy "super_admin_all_users" on public.users
  for all using (public.is_staff(array['super_admin']));

drop policy if exists "admin_read_users" on public.users;
create policy "admin_read_users" on public.users
  for select using (public.is_staff(array['super_admin','admin']));
