import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
    const email = 'test@example.com'

    // 1. Get User ID
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
        console.error('Test user not found, run create-user.ts first')
        return
    }

    console.log(`Checking clinic for user ${user.id}...`)

    // 2. Check if Clinic exists
    const { data: clinic } = await supabase
        .from('clinics')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (clinic) {
        console.log('Clinic already exists:', clinic.name)
    } else {
        console.log('Creating demo clinic "Bright Future Dental"...')
        const { error } = await supabase.from('clinics').insert({
            owner_id: user.id,
            name: 'Bright Future Dental',
            type: 'dental',
            onboarding_completed: true
        })

        if (error) console.error('Error creating clinic:', error)
        else console.log('Clinic created successfully.')
    }
}

main()
