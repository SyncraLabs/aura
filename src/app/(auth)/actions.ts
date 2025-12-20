'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithOtp(formData: FormData) {
    const email = formData.get('email') as string

    // 1. Validate Config Formats
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Checking Config:", { url, keyPrefix: key?.substring(0, 5) })

    if (!url || !url.startsWith('https://')) {
        return { error: `Config Error: Supabase URL is invalid. It looks like '${url?.substring(0, 10)}...'. It MUST start with 'https://'. Check Vercel Settings.` }
    }
    if (!key || !key.startsWith('eyJ')) {
        return { error: `Config Error: Anon Key is invalid. It MUST start with 'eyJ'. Check Vercel Settings.` }
    }

    const supabase = await createClient()

    // unified flow: works for both login and signup
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
        }
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function verifyOtp(formData: FormData) {
    const email = formData.get('email') as string
    const token = formData.get('token') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/dashboard')
}
