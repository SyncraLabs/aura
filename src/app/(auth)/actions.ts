'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // Forcing email verification so we can use the Code flow
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
        }
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function verify(formData: FormData) {
    const email = formData.get('email') as string
    const token = formData.get('token') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup', // Verifying the signup email
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/dashboard')
}
