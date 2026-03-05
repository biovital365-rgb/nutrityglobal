import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
    const email = 'biovital.365@gmail.com'

    // First check if user already exists
    const check = await pool.query('SELECT id, email, role, plan FROM "User" WHERE email = $1', [email])

    if (check.rows.length > 0) {
        console.log(`Usuario encontrado: ${check.rows[0].email} | Rol: ${check.rows[0].role}`)
        await pool.query('UPDATE "User" SET role = $1, plan = $2 WHERE email = $3', ['ADMIN', 'ELITE', email])
        const v = await pool.query('SELECT email, role, plan FROM "User" WHERE email = $1', [email])
        console.log(`DONE -> Rol: ${v.rows[0].role} | Plan: ${v.rows[0].plan}`)
    } else {
        console.log('Usuario no encontrado. Creando manualmente en Supabase...')

        // Get master org
        const orgs = await pool.query('SELECT id FROM "Organization" LIMIT 1')
        let orgId: string

        if (orgs.rows.length === 0) {
            console.log('Creando organizacion master...')
            const newOrg = await pool.query(
                `INSERT INTO "Organization" (id, name, "createdAt") VALUES (gen_random_uuid(), 'Nutrity Global Master', NOW()) RETURNING id`
            )
            orgId = newOrg.rows[0].id
        } else {
            orgId = orgs.rows[0].id
        }

        // Create user directly as ADMIN
        await pool.query(
            `INSERT INTO "User" (id, email, name, role, plan, "organizationId", "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())`,
            [email, 'BioVital Admin', 'ADMIN', 'ELITE', orgId]
        )

        const v = await pool.query('SELECT email, role, plan FROM "User" WHERE email = $1', [email])
        console.log(`CREADO -> Email: ${v.rows[0].email} | Rol: ${v.rows[0].role} | Plan: ${v.rows[0].plan}`)
    }

    // Show all users
    const all = await pool.query('SELECT email, role, plan FROM "User"')
    console.log('\nTodos los usuarios:')
    all.rows.forEach((u: any) => console.log(`  - ${u.email} (${u.role} / ${u.plan})`))

    await pool.end()
}

main().catch(e => { console.error('Error:', e); process.exit(1) })
