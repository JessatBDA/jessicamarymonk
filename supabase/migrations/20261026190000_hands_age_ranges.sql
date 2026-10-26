-- Widen Share your hands age bands. Keep the earlier stored values so existing rows stay valid.
-- Apply to the Jessica Mary Monk project only, after 20261026160000_hands_engagement.sql.

begin;

alter table public.hands_responses
  drop constraint if exists hands_responses_age_range_check;

alter table public.hands_responses
  add constraint hands_responses_age_range_check
  check (age_range in (
    '',
    'prefer-not',
    'under-16',
    '16-17',
    '18-over',
    'under-18',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65-74',
    '75-84',
    '85-89',
    '90-plus'
  ));

alter table public.hands_works
  drop constraint if exists hands_works_age_range_check;

alter table public.hands_works
  add constraint hands_works_age_range_check
  check (age_range in (
    '',
    'prefer-not',
    'under-16',
    '16-17',
    '18-over',
    'under-18',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65-74',
    '75-84',
    '85-89',
    '90-plus'
  ));

commit;
