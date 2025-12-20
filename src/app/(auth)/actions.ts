'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    // ... (unchanged)
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
    const origin = (await headers()).get('origin')

    console.log("-----------------------------------------")
    console.log("DEBUG SIGNUP:")
    console.log("Email:", email)
    console.log("Origin Header:", origin)
    console.log("Constructed Redirect:", `${origin}/auth/callback`)
    console.log("Env URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("-----------------------------------------")

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // Dynamic Redirect: Works for Localhost AND Vercel automatically
            emailRedirectTo: `${origin}/auth/callback`,
        }
    })

    if (error) {
        return { error: error.message }
    }

    // Capture explicit session if email confirmation is disabled
    if (data.session) {
        return { success: true, session: true }
    }

    return { success: true }
}

export async function verify(formData: FormData) {
    // ... identity verification (unchanged)
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

export async function resend(formData: FormData) {
    const email = formData.get('email') as string
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        }
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
