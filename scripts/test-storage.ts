import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testUpload() {
    const fileContent = fs.readFileSync('test_upload.txt')

    // Use a user ID from an existing user (e.g. Test user)
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === 'test@example.com')

    if (!user) {
        console.error('Test user not found!')
        return
    }

    const fileName = `${user.id}/test_upload_${Date.now()}.txt`

    console.log('Attempting upload to clinic-assets...')
    const { data, error } = await supabase.storage
        .from('clinic-assets')
        .upload(fileName, fileContent, { upsert: true })

    if (error) {
        console.error('Upload Failed:', error)
    } else {
        console.log('Upload Success:', data)

        const { data: publicUrlData } = supabase.storage
            .from('clinic-assets')
            .getPublicUrl(fileName)

        console.log('Public URL:', publicUrlData.publicUrl)
    }
}

testUpload()
