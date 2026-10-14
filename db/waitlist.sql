create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 254),
  source text not null default 'hero',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_key on public.waitlist (email);

alter table public.waitlist enable row level security;

create policy "anyone can join the waitlist"
  on public.waitlist for insert
  to anon
  with check (true);

create table if not exists public.waitlist_tasks (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 254),
  task text not null check (length(task) <= 280),
  created_at timestamptz not null default now()
);

alter table public.waitlist_tasks enable row level security;

create policy "anyone can add a task"
  on public.waitlist_tasks for insert
  to anon
  with check (true);
