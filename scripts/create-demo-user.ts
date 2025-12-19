import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    const email = 'doctor@clinic.com'
    const password = 'password123'

    console.log(`Creating fresh user ${email}...`)

    // 1. Check/Delete existing to ensure fresh onboarding
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existing = users.find(u => u.email === email)

    if (existing) {
        console.log('User exists. Deleting clinic to reset onboarding...')
        await supabase.from('clinics').delete().eq('owner_id', existing.id)
        console.log('Clinic deleted (if existed). Onboarding should trigger now.')
    } else {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { email_verified: true }
        })
        if (error) console.error(error)
        else console.log('Fresh user created.')
    }
}

main()
