create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 254),
  source text not null default 'hero',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_key on public.waitlist (email);

alter table public.waitlist enable row level security;

drop policy if exists "anyone can join the waitlist" on public.waitlist;
drop policy if exists "waitlist_all_anon" on public.waitlist;
drop policy if exists "waitlist_anon_all" on public.waitlist;

create policy "waitlist_anon_all"
  on public.waitlist
  for all
  to anon, authenticated
  using (true)
  with check (true);

create table if not exists public.waitlist_tasks (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 254),
  task text not null check (length(task) <= 280),
  created_at timestamptz not null default now()
);

alter table public.waitlist_tasks enable row level security;

drop policy if exists "anyone can add a task" on public.waitlist_tasks;
drop policy if exists "waitlist_tasks_all_anon" on public.waitlist_tasks;
drop policy if exists "waitlist_tasks_anon_all" on public.waitlist_tasks;

create policy "waitlist_tasks_anon_all"
  on public.waitlist_tasks
  for all
  to anon, authenticated
  using (true)
  with check (true);

grant all on table public.waitlist to anon, authenticated, service_role;
grant all on table public.waitlist_tasks to anon, authenticated, service_role;
