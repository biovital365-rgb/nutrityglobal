import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase URL or Anon Key in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log('🔍 Testing Supabase Connection...')

    // 1. Test Food Table
    const { data: foods, error: foodError } = await supabase
        .from('Food')
        .select('id, name')
        .limit(1)

    if (foodError) {
        console.error('❌ Error fetching Food table:', foodError.message)
        console.log('💡 Tip: Check if the table exists or if RLS is blocking public access.')
    } else {
        console.log('✅ Successfully connected to Food table!')
        if (foods.length === 0) {
            console.log('⚠️ Warning: Food table is empty. Need to run seed?')
        } else {
            console.log(`📡 Sample Data Found: ${foods[0].name}`)
        }
    }

    // 2. Test Micronutrient Table
    const { data: micros, error: microError } = await supabase
        .from('Micronutrient')
        .select('id, name')
        .limit(1)

    if (microError) {
        console.error('❌ Error fetching Micronutrient table:', microError.message)
    } else {
        console.log('✅ Successfully connected to Micronutrient table!')
    }

    // 3. Test Organization Table (Internal Check)
    const { data: orgs, error: orgError } = await supabase
        .from('Organization')
        .select('id, name')
        .limit(1)

    if (orgError) {
        console.log('ℹ️ Organization table might be protected by RLS (Expected).')
    } else {
        console.log('✅ Successfully connected to Organization table!')
    }
}

testConnection()
