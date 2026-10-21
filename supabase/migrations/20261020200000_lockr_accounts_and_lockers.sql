create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  country_code text not null default 'BE',
  created_at timestamptz not null default now()
);

create table if not exists public.lockers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  item_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_username_format_check;
alter table public.profiles
  add constraint profiles_username_format_check
  check (username ~ '^[A-Za-z0-9_]{3,20}$') not valid;

alter table public.profiles
  drop constraint if exists profiles_country_code_check;
alter table public.profiles
  add constraint profiles_country_code_check
  check (country_code in ('BE', 'FR', 'CH', 'CA', 'LU', 'DE', 'NL', 'GB', 'ES', 'IT', 'PT', 'PL', 'US', 'BR', 'OTHER')) not valid;

alter table public.profiles enable row level security;
alter table public.lockers enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Lockers are publicly readable" on public.lockers;
create policy "Lockers are publicly readable"
on public.lockers for select
to anon, authenticated
using (true);

drop policy if exists "Users can create their own locker" on public.lockers;
create policy "Users can create their own locker"
on public.lockers for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own locker" on public.lockers;
create policy "Users can update their own locker"
on public.lockers for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.create_lockr_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  desired_username text;
  desired_country text;
begin
  desired_username := trim(new.raw_user_meta_data ->> 'username');
  if desired_username is null
    or desired_username !~ '^[A-Za-z0-9_]{3,20}$'
    or exists (
      select 1
      from public.profiles
      where username = desired_username
    )
  then
    desired_username := 'Joueur_' || substr(new.id::text, 1, 12);
  end if;

  desired_country := new.raw_user_meta_data ->> 'country_code';
  if desired_country is null
    or desired_country not in ('BE', 'FR', 'CH', 'CA', 'LU', 'DE', 'NL', 'GB', 'ES', 'IT', 'PT', 'PL', 'US', 'BR', 'OTHER')
  then
    desired_country := 'BE';
  end if;

  insert into public.profiles (id, username, country_code)
  values (new.id, desired_username, desired_country);

  return new;
end;
$$;

revoke all on function public.create_lockr_profile() from public, anon, authenticated;

drop trigger if exists on_lockr_user_created on auth.users;
create trigger on_lockr_user_created
after insert on auth.users
for each row execute procedure public.create_lockr_profile();

grant select on public.profiles to anon, authenticated;
grant update (username, country_code) on public.profiles to authenticated;
grant select, insert, update on public.lockers to authenticated;
grant select on public.lockers to anon;
