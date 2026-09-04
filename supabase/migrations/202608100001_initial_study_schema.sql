-- Form & Wirkung: anonymous within-subject study schema
-- Enable Anonymous Sign-Ins in Supabase Auth before running the participant flow.

create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

create table public.participants (
  id uuid primary key references auth.users(id) on delete cascade,
  consented boolean not null default true check (consented = true),
  device_type text not null check (device_type in ('desktop', 'tablet', 'mobile')),
  started_at timestamptz not null default now(),
  completed boolean not null default false,
  completed_at timestamptz,
  randomized_sequence jsonb not null,
  constraint randomized_sequence_is_complete check (
    jsonb_typeof(randomized_sequence) = 'array'
    and jsonb_array_length(randomized_sequence) = 9
  ),
  constraint completion_timestamp_consistent check (
    (completed = false and completed_at is null)
    or (completed = true and completed_at is not null)
  )
);

create table public.trial_responses (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  trial_index integer not null check (trial_index between 0 and 8),
  sculpture_id text not null,
  hidden_variant_id text not null,
  asset_type text not null check (asset_type in ('glb', 'obj', 'splat-ply')),
  renderer_type text not null check (renderer_type in ('mesh', 'splat')),
  reference_image_path text not null,
  item_geometry integer not null check (item_geometry between 1 and 7),
  item_color integer not null check (item_color between 1 and 7),
  item_surface integer not null check (item_surface between 1 and 7),
  item_detail integer not null check (item_detail between 1 and 7),
  item_artifacts integer not null check (item_artifacts between 1 and 7),
  item_overall integer not null check (item_overall between 1 and 7),
  open_visual_observations text,
  trial_started_at timestamptz not null,
  trial_submitted_at timestamptz not null,
  trial_duration_ms integer not null check (trial_duration_ms >= 0),
  unique (participant_id, trial_index),
  unique (participant_id, sculpture_id, hidden_variant_id),
  constraint asset_renderer_compatible check (
    (renderer_type = 'mesh' and asset_type in ('glb', 'obj'))
    or (renderer_type = 'splat' and asset_type = 'splat-ply')
  ),
  constraint open_response_length check (
    open_visual_observations is null or char_length(open_visual_observations) <= 5000
  ),
  constraint valid_trial_timestamps check (trial_submitted_at >= trial_started_at)
);

create index trial_responses_participant_idx on public.trial_responses(participant_id);
create index trial_responses_model_idx on public.trial_responses(sculpture_id, hidden_variant_id);
create index participants_completion_idx on public.participants(completed);

alter table public.participants enable row level security;
alter table public.trial_responses enable row level security;

revoke all on public.participants from anon, authenticated;
revoke all on public.trial_responses from anon, authenticated;
grant select, insert on public.participants to authenticated;
grant update (completed, completed_at) on public.participants to authenticated;
grant select, insert on public.trial_responses to authenticated;

create policy "anonymous participant can create own row"
on public.participants
for insert
to authenticated
with check (
  auth.uid() = id
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  and completed = false
  and completed_at is null
);

create policy "participant can read own row and admin can read all"
on public.participants
for select
to authenticated
using (auth.uid() = id or public.is_admin());

create policy "participant can complete own row"
on public.participants
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and completed = true
  and completed_at is not null
  and (select count(*) from public.trial_responses where participant_id = auth.uid()) = 9
);

create policy "anonymous participant can insert own responses"
on public.trial_responses
for insert
to authenticated
with check (
  auth.uid() = participant_id
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  and exists (
    select 1
    from public.participants p
    where p.id = auth.uid()
      and p.completed = false
      and p.randomized_sequence -> trial_index ->> 'sculpture_id' = sculpture_id
      and p.randomized_sequence -> trial_index ->> 'hidden_variant_id' = hidden_variant_id
  )
);

create policy "participant can read own responses and admin can read all"
on public.trial_responses
for select
to authenticated
using (auth.uid() = participant_id or public.is_admin());

comment on table public.participants is 'Anonymous study participants; id equals the Supabase Auth anonymous user id.';
comment on table public.trial_responses is 'One immutable row per real study trial. Practice data is never inserted.';
