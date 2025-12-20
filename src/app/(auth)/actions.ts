'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithOtp(formData: FormData) {
    const email = formData.get('email') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true, // Allow sign up via OTP
        }
    })

    if (error) {
        console.error("Supabase Auth Error:", error.message)
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING'
        const maskedKey = key.substring(0, 10) + '...'
        return { error: `${error.message} (Key used: ${maskedKey})` }
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
        console.error("Supabase Verify Error:", error.message)
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING'
        const maskedKey = key.substring(0, 10) + '...'
        return { error: `${error.message} (Key used: ${maskedKey})` }
    }

    redirect('/dashboard')
}
