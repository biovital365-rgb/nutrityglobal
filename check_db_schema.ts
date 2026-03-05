import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log('Checking Course table schema...')

    // We can't easily list columns from a query if we don't have admin access to information_schema
    // But we can try to insert a dummy record or select with a specific column to see if it fails

    const { data, error } = await supabase
        .from('Course')
        .select('paypalUrl')
        .limit(1)

    if (error) {
        if (error.message.includes('column "paypalUrl" does not exist')) {
            console.error('ERROR: The column "paypalUrl" is missing from the Course table.')
            console.log('Suggestion: You need to add this column in Supabase.')
        } else {
            console.error('An unexpected error occurred:', error.message)
        }
    } else {
        console.log('Success: The column "paypalUrl" exists in the Course table.')
        console.log('Sample data:', data)
    }
}

checkSchema()
