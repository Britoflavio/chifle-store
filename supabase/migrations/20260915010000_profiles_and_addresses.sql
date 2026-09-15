alter table public.profiles
  add column if not exists phone text,
  add column if not exists dni text,
  add column if not exists avatar_url text;

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Casa',
  recipient_name text not null,
  street text not null,
  street_number text not null,
  apartment text,
  city text not null,
  province text not null default 'Córdoba',
  postal_code text not null,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

alter table public.addresses enable row level security;

create policy addresses_select_self on public.addresses
  for select to authenticated using (user_id = auth.uid());
create policy addresses_insert_self on public.addresses
  for insert to authenticated with check (user_id = auth.uid());
create policy addresses_update_self on public.addresses
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy addresses_delete_self on public.addresses
  for delete to authenticated using (user_id = auth.uid());

create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.claim_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text;
  profile public.profiles;
  metadata jsonb;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select lower(email), raw_user_meta_data into current_email, metadata
  from auth.users where id = auth.uid();

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    auth.uid(), current_email, coalesce(metadata->>'full_name', metadata->>'name', current_email), metadata->>'avatar_url',
    case when exists (select 1 from public.admin_allowlist where lower(email) = current_email) then 'admin' else 'customer' end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(profiles.full_name, excluded.full_name),
    avatar_url = coalesce(profiles.avatar_url, excluded.avatar_url),
    role = case when profiles.role = 'admin' then 'admin' else excluded.role end,
    updated_at = now()
  returning * into profile;
  return profile;
end;
$$;
