begin;
-- Existing rows retain version 1; subsequent inserts default to version 2.
alter table public.participants
 add column experience_3d text check (experience_3d in ('never','rarely','occasionally','often','very_often')),
 add column questionnaire_version integer not null default 1 check (questionnaire_version in (1,2));
alter table public.participants alter column questionnaire_version set default 2;
alter table public.trial_responses
 add column item_material_realism integer check (item_material_realism between 1 and 7),
 add column item_view_stability integer check (item_view_stability between 1 and 7),
 add column questionnaire_version integer not null default 1 check (questionnaire_version in (1,2)),
 add constraint v2_requires_eight_items check (questionnaire_version = 1 or
   (item_material_realism is not null and item_view_stability is not null));
alter table public.trial_responses alter column questionnaire_version set default 2;
-- Restrictive policies supplement (never replace/broaden) the existing ownership,
-- anonymous-auth, sequence, completion and admin SELECT policies.
create policy "new participants use questionnaire v2"
 on public.participants as restrictive for insert to authenticated
 with check (questionnaire_version = 2);
create policy "new responses use questionnaire v2"
 on public.trial_responses as restrictive for insert to authenticated
 with check (questionnaire_version = 2);
-- No extra grants: experience is only supplied at INSERT. Existing UPDATE grants
-- remain limited to completed and completed_at. Responses remain immutable.
comment on column public.participants.experience_3d is 'NULL = prefer not to say (v2), or not collected (v1).';
comment on column public.participants.questionnaire_version is 'Version at enrollment; resumed legacy participants may subsequently submit v2 trials.';
comment on column public.trial_responses.questionnaire_version is 'Version of the actual trial wording; use this to separate analyses.';
commit;
