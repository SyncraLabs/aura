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
    const email = 'newdoctor@clinic.com'
    const password = 'password123'

    console.log(`Creating fresh user ${email}...`)

    // 1. Check/Delete existing
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existing = users.find(u => u.email === email)

    if (existing) {
        console.log('User exists. Deleting user completely to ensure fresh start...')
        await supabase.auth.admin.deleteUser(existing.id)
    }

    // 2. Create fresh
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { email_verified: true }
    })

    if (error) {
        console.error(error)
    } else {
        console.log('Fresh user created successfully!')
        console.log('Credentials -> Email: newdoctor@clinic.com, Pass: password123')
    }
}

main()
