import pg from 'pg'
const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres"
const pool = new pg.Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})
async function main() {
    const res = await pool.query('SELECT email, "firebaseUid" FROM "User"');
    console.log(JSON.stringify(res.rows, null, 2));
    await pool.end();
}
main();
