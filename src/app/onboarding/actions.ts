'use server'

import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { redirect } from 'next/navigation'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

export async function saveClinicProfile(formData: {
    name: string,
    type: string,
    description: string,
    services: string[],
    businessDocUrl?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        // 1. Upsert Clinic
        // Fetch existing first to get ID if needed, or just upsert on owner_id constraint
        const { data: existing } = await supabase.from('clinics').select('id').eq('owner_id', user.id).single()

        let clinicId = existing?.id

        if (existing) {
            await supabase.from('clinics').update({
                name: formData.name,
                type: formData.type as any,
                description: formData.description,
                services: formData.services, // Keep legacy sync for now
                business_doc_url: formData.businessDocUrl,
                onboarding_completed: true
            }).eq('id', existing.id)
        } else {
            const { data: newClinic, error } = await supabase.from('clinics').insert({
                owner_id: user.id,
                name: formData.name,
                type: formData.type as any,
                description: formData.description,
                services: formData.services,
                business_doc_url: formData.businessDocUrl,
                onboarding_completed: true
            }).select().single()

            if (error) throw error
            clinicId = newClinic.id
        }

        if (!clinicId) throw new Error("Failed to get clinic ID")

        // 2. Process Services & Generate Prompts
        if (GEMINI_API_KEY && formData.services.length > 0) {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const promptConfig = `You are an expert AI image prompting assistant. Convert the beauty service request for a specific clinic sector into a precise, imperative image editing instruction for an AI model.
            Focus ONLY on the relevant body part. Do not describe the person, only the change.
            Examples:
            - Service: 'Color: Blue', Sector: 'hair' -> 'Dye the hair blue'
            - Service: 'Veneers', Sector: 'dental' -> 'Make the teeth into perfect white veneers'
            - Service: 'Rhinoplasty', Sector: 'other' -> 'Make the nose smaller and straighter'
            - Service: 'Fade', Sector: 'hair' -> 'Give the person a fade haircut'
            
            IMPORTANT: If the service is ambiguous like 'Fade' or 'Flash', interpret it as a BEAUTY PROCEDURE, not a photography style.
            
            Sector: '${formData.type}'`

            // We do this in parallel for speed
            await Promise.all(formData.services.map(async (serviceName) => {
                let aiPrompt = `Make me ${serviceName}` // Fallback

                try {
                    const result = await model.generateContent(`${promptConfig}
                    Input Service: '${serviceName}'
                    Output (Instruction only):`)
                    const response = result.response.text()
                    if (response) aiPrompt = response.trim()
                } catch (e) {
                    console.warn(`Gemini prompt gen failed for ${serviceName}`, e)
                }

                // Upsert into clinic_services
                // Note: We need to handle potential duplicates if user re-runs onboarding. 
                // We used 'unique_service_per_clinic' constraint, so we can upsert.
                const { error } = await supabase.from('clinic_services').upsert({
                    clinic_id: clinicId,
                    name: serviceName,
                    ai_prompt: aiPrompt
                }, { onConflict: 'clinic_id, name' })

                if (error) console.error("Error saving service prompt", error)
            }))
        } else {
            // Fallback if no Gemini Key, just insert raw
            await Promise.all(formData.services.map(async (serviceName) => {
                await supabase.from('clinic_services').upsert({
                    clinic_id: clinicId,
                    name: serviceName,
                    ai_prompt: `Make me ${serviceName}`
                }, { onConflict: 'clinic_id, name' })
            }))
        }

        return { success: true }

    } catch (e: any) {
        console.error("Save Clinic Error:", e)
        return { success: false, error: e.message }
    }
}
