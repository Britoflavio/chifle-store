create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);

create table public.category_attributes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name text not null,
  slug text not null,
  value_type text not null default 'select' check (value_type in ('text', 'select', 'number', 'boolean')),
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  is_variant_attribute boolean not null default false,
  sort_order integer not null default 0,
  unique (category_id, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  brand text,
  model text,
  sku text unique,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  out_of_stock_visibility text not null default 'visible' check (out_of_stock_visibility in ('visible', 'hidden')),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  weight_grams integer check (weight_grams is null or weight_grams > 0),
  package_length_cm numeric(8,2) check (package_length_cm is null or package_length_cm > 0),
  package_width_cm numeric(8,2) check (package_width_cm is null or package_width_cm > 0),
  package_height_cm numeric(8,2) check (package_height_cm is null or package_height_cm > 0),
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  is_primary boolean not null default false,
  primary key (product_id, category_id)
);

create unique index product_categories_one_primary
  on public.product_categories (product_id) where is_primary;

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  name text,
  price numeric(12,2) check (price is null or price >= 0),
  stock integer not null default 0 check (stock >= 0),
  attributes jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete cascade,
  storage_path text not null,
  alt_text text not null check (length(trim(alt_text)) > 0),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index categories_parent_idx on public.categories (parent_id, sort_order);
create index products_status_idx on public.products (status, sort_order);
create index product_categories_category_idx on public.product_categories (category_id, product_id);
create index product_variants_product_idx on public.product_variants (product_id, is_active);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.categories enable row level security;
alter table public.category_attributes enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

create policy categories_public_read on public.categories
  for select to anon, authenticated using (is_active = true);
create policy categories_admin_all on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy category_attributes_public_read on public.category_attributes
  for select to anon, authenticated using (exists (select 1 from public.categories c where c.id = category_id and c.is_active));
create policy category_attributes_admin_all on public.category_attributes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy products_public_read on public.products
  for select to anon, authenticated using (
    status = 'published'
    and (out_of_stock_visibility = 'visible' or exists (select 1 from public.product_variants v where v.product_id = id and v.is_active and v.stock > 0))
  );
create policy products_admin_all on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy product_categories_public_read on public.product_categories
  for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy product_categories_admin_all on public.product_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy product_variants_public_read on public.product_variants
  for select to anon, authenticated using (is_active and exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy product_variants_admin_all on public.product_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy product_images_public_read on public.product_images
  for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy product_images_admin_all on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

insert into public.categories (name, slug, description, sort_order)
values
  ('Ropa', 'ropa', 'Prendas urbanas para todos los días.', 10),
  ('Zapatillas', 'zapatillas', 'Calzado urbano y deportivo.', 20),
  ('Accesorios', 'accesorios', 'Detalles que completan el look.', 30),
  ('Hogar', 'hogar', 'Objetos para darle identidad a tus espacios.', 40),
  ('Tecnología', 'tecnologia', 'Tecnología útil para tu día a día.', 50)
on conflict (slug) do nothing;
