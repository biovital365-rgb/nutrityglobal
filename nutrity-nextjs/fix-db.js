const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres' });

async function run() {
  await client.connect();
  console.log('Connected to DB');

  await client.query(`
    create or replace function public.handle_new_user()
    returns trigger as $$
    begin
      insert into public."User" (id, email, name, role, plan, "updatedAt")
      values (
        new.id::text, 
        new.email, 
        coalesce(new.raw_user_meta_data->>'full_name', 'Nuevo Usuario'), 
        'USER', 
        'FREE',
        now()
      )
      on conflict (id) do nothing;
      return new;
    end;
    $$ language plpgsql security definer;
  `);

  await client.query(`drop trigger if exists on_auth_user_created on auth.users;`);
  
  await client.query(`
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  `);

  console.log('Trigger created');

  const res = await client.query(`
    insert into public."User" (id, email, name, role, plan, "updatedAt")
    select id::text, email, coalesce(raw_user_meta_data->>'full_name', 'Nuevo Usuario'), 'USER', 'FREE', now()
    from auth.users
    where not exists (
      select 1 from public."User" where public."User".id = auth.users.id::text
    )
    on conflict (email) do update set id = excluded.id;
  `);

  console.log('Backfill complete, rows affected:', res.rowCount);
  await client.end();
}

run().catch(console.error);
