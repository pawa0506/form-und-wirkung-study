# Supabase setup

1. Create a Supabase project and open **Authentication → Providers**.
2. Enable **Anonymous Sign-Ins** for study participants and Email/Password for administrators.
3. Run `migrations/202608100001_initial_study_schema.sql` in the SQL editor or with the Supabase CLI.
4. Create an email/password admin user in **Authentication → Users**.
5. Mark that account as an administrator with the service role or SQL editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where email = 'admin@example.org';
```

Sign out and back in after changing app metadata so the new JWT contains the
admin role. Never expose the service-role key in the frontend. The public
publishable/anon key is intentionally used with Row Level Security.

For a public study, also enable Supabase CAPTCHA/Turnstile for anonymous sign-in
abuse prevention and define a retention schedule for anonymous Auth users and
study records.
