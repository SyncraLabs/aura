import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testSchemaAndData() {
    console.log('Testing Database Schema & Data...')

    // 1. Check if we can select 'services' from clinics
    try {
        const { data, error } = await supabase.from('clinics').select('services, description').limit(1)
        if (error) {
            console.error('SCHEMA ERROR: Could not select "services" column. The migration likely wasn\'t run.')
            console.error(error)
        } else {
            console.log('Schema Check Passed: "services" column exists.')
            console.log('Sample Data:', data)
        }
    } catch (e) {
        console.error('Connection Failed:', e)
    }

    // 2. Check for recent clinics
    const { data: users } = await supabase.auth.admin.listUsers()
    const lastUser = users.users[0] // approximation
    if (lastUser) {
        console.log(`Checking clinic for user ${lastUser.email} (${lastUser.id})`)
        const { data: clinic } = await supabase.from('clinics').select('*').eq('owner_id', lastUser.id)
        console.log('Clinic Record:', clinic)
    }
}

testSchemaAndData()
