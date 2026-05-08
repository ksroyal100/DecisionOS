-- DecideOS v2 Schema
-- Run in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- ─── Decisions ─────────────────────────────────────────────────────
create table if not exists decisions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  situation text not null,
  output jsonb not null,
  mode text not null default 'standard' check (mode in ('micro','standard','deep','simulate')),
  tone text not null default 'logical' check (tone in ('logical','aggressive','safe')),
  share_token uuid default uuid_generate_v4() unique not null,
  created_at timestamptz default now() not null,

  -- Follow-up tracking
  follow_status text check (follow_status in ('followed','ignored','partial')),
  follow_status_set_at timestamptz,

  -- Outcome tracking
  outcome_rating text check (outcome_rating in ('great','good','neutral','bad','terrible')),
  outcome_notes text,
  outcome_set_at timestamptz,

  -- Scheduled follow-ups
  followup_7d_due timestamptz,
  followup_30d_due timestamptz,
  followup_90d_due timestamptz
);

create index if not exists idx_decisions_user_id on decisions(user_id);
create index if not exists idx_decisions_share_token on decisions(share_token);
create index if not exists idx_decisions_created_at on decisions(created_at desc);
create index if not exists idx_decisions_followup on decisions(followup_7d_due, followup_30d_due, followup_90d_due);

-- ─── User Profiles ──────────────────────────────────────────────────
create table if not exists user_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  thinking_style text check (thinking_style in ('overthinker','impulsive','risk-averse','logical','balanced')),
  decision_score integer default 0,
  streak_days integer default 0,
  total_decisions integer default 0,
  good_decisions integer default 0,
  decisions_followed integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_user_profiles_user_id on user_profiles(user_id);

-- ─── RLS ────────────────────────────────────────────────────────────
alter table decisions enable row level security;
alter table user_profiles enable row level security;

-- Decisions policies
create policy "Users can view own decisions" on decisions for select using (auth.uid() = user_id);
create policy "Users can insert own decisions" on decisions for insert with check (auth.uid() = user_id);
create policy "Users can update own decisions" on decisions for update using (auth.uid() = user_id);
create policy "Users can delete own decisions" on decisions for delete using (auth.uid() = user_id);
create policy "Anyone can view shared decisions" on decisions for select using (share_token is not null);

-- Profile policies
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = user_id);
create policy "Users can upsert own profile" on user_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = user_id);
