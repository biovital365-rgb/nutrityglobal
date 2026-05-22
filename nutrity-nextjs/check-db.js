const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres' });
client.connect().then(() => {
  return client.query('select id, email, name, role from public."User"');
}).then(res => {
  console.log("PUBLIC USER:");
  console.log(res.rows);
  return client.query('select id, email from auth.users');
}).then(res => {
  console.log("AUTH USERS:");
  console.log(res.rows);
  process.exit(0);
}).catch(console.error);
