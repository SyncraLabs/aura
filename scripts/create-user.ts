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
    const password = 'password123'

    console.log(`Creating user ${email}...`)

    // Check if user exists first to avoid error
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existing = users.find(u => u.email === email)

    if (existing) {
        console.log('User already exists, updating password...')
        const { error } = await supabase.auth.admin.updateUserById(existing.id, {
            password: password,
            email_confirm: true,
            user_metadata: { email_verified: true }
        })
        if (error) console.error('Error updating:', error)
        else console.log('User updated.')
    } else {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { email_verified: true }
        })

        if (error) {
            console.error('Error creating user:', error)
        } else {
            console.log('User created:', data.user.id)
        }
    }
}

main()
