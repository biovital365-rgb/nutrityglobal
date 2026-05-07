import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFoods() {
    console.log('Checking Food items in database...')

    const { data: foods, error } = await supabase
        .from('Food')
        .select('id, name')

    if (error) {
        console.error('Error fetching foods:', error.message)
        return
    }

    console.log(`Found ${foods?.length || 0} foods.`)
    const tarwi = foods?.find(f => f.name.toLowerCase().includes('tarwi'))
    const sachaInchi = foods?.find(f => f.name.toLowerCase().includes('sacha inchi'))

    console.log('Tarwi:', tarwi || 'NOT FOUND')
    console.log('Sacha Inchi:', sachaInchi || 'NOT FOUND')
}

checkFoods()
