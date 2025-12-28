create extension if not exists "pgcrypto";

create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  title text not null,
  status text not null default 'draft',
  vat_rate numeric(5,2) not null default 20,
  subtotal numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table estimates enable row level security;

create or replace function public.is_company_member(cid uuid)
returns boolean as $$
  select exists (
    select 1 from company_memberships
    where company_id = cid
      and user_id = auth.uid()
  );
$$ language sql stable;

create policy "estimate_company_scope"
on estimates
for all
using (is_company_member(company_id))
with check (is_company_member(company_id));

