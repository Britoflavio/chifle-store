create table public.admin_allowlist (
  email text primary key,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

insert into public.admin_allowlist (email)
values ('nachomartinez49@gmail.com')
on conflict (email) do nothing;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_allowlist enable row level security;
alter table public.profiles enable row level security;

create policy profiles_select_self on public.profiles
  for select to authenticated using (id = auth.uid());

create or replace function public.claim_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text;
  profile public.profiles;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select lower(email) into current_email from auth.users where id = auth.uid();
  insert into public.profiles (id, email, full_name, role)
  values (
    auth.uid(), current_email, coalesce((select raw_user_meta_data->>'full_name' from auth.users where id = auth.uid()), current_email),
    case when exists (select 1 from public.admin_allowlist where lower(email) = current_email) then 'admin' else 'customer' end
  )
  on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, role = case when profiles.role = 'admin' then 'admin' else excluded.role end, updated_at = now()
  returning * into profile;
  return profile;
end;
$$;

revoke all on function public.claim_profile() from public;
grant execute on function public.claim_profile() to authenticated;
