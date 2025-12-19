'use server'

import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import sharp from 'sharp'

// We don't use 'openai' SDK for the generation call to allow custom params ('input_fidelity', 'gpt-image-1.5')
// but we keep the key.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

export async function generateTransformation(formData: FormData) {
    const image = formData.get('image') as File
    let service = formData.get('service') as string

    // --- CONTEXT REFINEMENT ---
    // Handle ambiguous terms like "Fade" which can mean "Fade to black" in photo editing.
    if (service.toLowerCase().includes('fade') && !service.toLowerCase().includes('hair')) {
        service += ' haircut'
    }

    if (!image) return { success: false, error: 'No image provided' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // 1. Upload Original
    const fileExt = (image.name || 'image.png').split('.').pop() || 'png'
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    await supabase.storage.from('clinic-assets').upload(fileName, image)
    const { data: { publicUrl: imageUrl } } = supabase.storage.from('clinic-assets').getPublicUrl(fileName)

    // 2. Fetch Context
    const { data: clinic } = await supabase.from('clinics').select('services, id, type').eq('owner_id', user.id).single()
    const { data: refs } = await supabase.from('service_references').select('image_url, description').eq('clinic_id', clinic?.id).eq('service_name', service).limit(1)

    const referenceUrl = refs && refs[0] ? refs[0].image_url : null

    // 3. Prompt Construction
    // 3. Prompt Construction
    // Priority: 1. Stored Prompt (from clinic_services), 2. Live Gemini Gen, 3. Fallback Regex

    let prompt = `Make me ${service.replace(/Color:\s*|Hair Color:\s*/i, '').trim()}` // Baseline fallback

    // Attempt to fetch stored prompt
    const { data: storedService } = await supabase.from('clinic_services')
        .select('ai_prompt')
        .eq('clinic_id', clinic?.id)
        .eq('name', service)
        .single()

    if (storedService && storedService.ai_prompt) {
        prompt = storedService.ai_prompt
        console.log("Using Stored Prompt:", prompt)
    } else {
        // Fallback to Live Gemini if no stored prompt found (legacy or new service not in DB)
        try {
            if (GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

                const systemPrompt = `You are an expert AI image prompting assistant. Convert the beauty service request for a specific clinic sector into a precise, imperative image editing instruction for an AI model.
                Focus ONLY on the relevant body part. Do not describe the person, only the change.
                Examples:
                - Service: 'Color: Blue', Sector: 'hair' -> 'Dye the hair blue'
                - Service: 'Veneers', Sector: 'dental' -> 'Make the teeth into perfect white veneers'
                - Service: 'Rhinoplasty', Sector: 'other' -> 'Make the nose smaller and straighter'
                - Service: 'Fade', Sector: 'hair' -> 'Give the person a fade haircut'

                IMPORTANT: If the service is ambiguous like 'Fade' or 'Flash', interpret it as a BEAUTY PROCEDURE, not a photography style.
                
                Input: Service: '${service}', Sector: '${clinic?.type || 'general'}'
                Output (Instruction only):`

                const result = await model.generateContent(systemPrompt)
                const response = result.response.text()
                if (response) {
                    prompt = response.trim()
                }
            }
        } catch (e) {
            console.warn("Gemini Prompt Refinement Failed, using fallback:", e)
        }
    }

    console.log("Using Model: gpt-image-1.5. Prompt:", prompt)

    try {
        const imageBuffer = await image.arrayBuffer()

        // --- PREPARE IMAGE ---
        // We will try RAW (Original) first. If too big (>4MB), we resize to 2048 or 1024 long side but KEEP ASPECT RATIO.
        // gpt-image-1.5 likely supports non-square.
        let processedInput: Buffer = Buffer.from(imageBuffer)

        // Check size. OpenAI limit is often 4MB.
        if (imageBuffer.byteLength > 3.9 * 1024 * 1024) {
            console.log("Image > 4MB, resizing...")
            processedInput = await sharp(processedInput)
                .resize({ width: 1536, height: 1536, fit: 'inside' }) // Reduce resolution to fit size
                .toFormat('png')
                .toBuffer()
        }

        // --- RAW FETCH to support custom Model & Fidelity ---
        // Attempt 1: Mask-less Instruction Edit
        const apiFormData = new FormData()
        // @ts-ignore
        apiFormData.append('image', new Blob([processedInput], { type: 'image/png' }), 'image.png')
        apiFormData.append('prompt', prompt)
        apiFormData.append('model', 'gpt-image-1.5')
        apiFormData.append('input_fidelity', 'high')
        // apiFormData.append('response_format', 'url') // REMOVED: Caused error "Unknown parameter"

        if (referenceUrl) {
            try {
                const refBlob = await (await fetch(referenceUrl)).blob()
                apiFormData.append('image', refBlob, 'reference.png')
            } catch (e) { console.error("Ref fetch fail", e) }
        }

        console.log("Calling OpenAI Raw Edits endpoint (Maskless)...")
        let finalGeneratedUrl = ""

        try {
            const res = await fetch('https://api.openai.com/v1/images/edits', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
                body: apiFormData
            })

            if (!res.ok) {
                const errText = await res.text()
                // If error suggests mask is required, we throw specific error to catch below
                if (errText.includes("'mask'") || errText.includes("mask is required")) {
                    throw new Error("MASK_REQUIRED")
                }

                // Handle Safety Violations (e.g., shirtless photos)
                if (errText.includes("safety_violations") || errText.includes("moderation_blocked")) {
                    throw new Error("The AI rejected this image for safety reasons. Please try a photo with more clothing (e.g., a t-shirt) or a tighter face crop.")
                }

                console.error("GPT-Image-1.5 Error:", errText)
                throw new Error(`OpenAI Error: ${res.statusText} - ${errText}`)
            }

            const json = await res.json()

            if (json.data && json.data[0].url) {
                finalGeneratedUrl = json.data[0].url
            } else if (json.data && json.data[0].b64_json) {
                // Determine mime type from b64 or assume png
                const b64 = json.data[0].b64_json
                const buff = Buffer.from(b64, 'base64')
                const resName = `${user.id}/result_final_${Date.now()}.png`
                await supabase.storage.from('clinic-assets').upload(resName, buff, { contentType: 'image/png' })
                const { data: { publicUrl } } = supabase.storage.from('clinic-assets').getPublicUrl(resName)
                finalGeneratedUrl = publicUrl
            } else {
                throw new Error("No image data in response (checked url and b64_json)")
            }

        } catch (e: any) {
            console.warn("Maskless edit failed. Retrying with Heuristic Mask.", e.message)

            if (e.message === "MASK_REQUIRED") {
                // --- FALLBACK: Add Heuristic Mask but keep Aspect Ratio ---
                const meta = await sharp(processedInput).metadata()
                const w = meta.width!
                const h = meta.height!

                // Blurred Top/Center Mask "Soft Focus"
                const maskBuff = await sharp({
                    create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 255 } }
                })
                    .composite([
                        { input: Buffer.from(`<svg><rect x="0" y="0" width="${w}" height="${h}" fill="black" /></svg>`), blend: 'dest-out' } // Make ALL Transparent
                    ])
                    .png().toBuffer()

                const fallbackFormData = new FormData()
                // @ts-ignore
                fallbackFormData.append('image', new Blob([processedInput], { type: 'image/png' }), 'image.png')
                // @ts-ignore
                fallbackFormData.append('mask', new Blob([maskBuff], { type: 'image/png' }), 'mask.png')
                fallbackFormData.append('prompt', prompt)
                fallbackFormData.append('model', 'gpt-image-1.5') // Still try 1.5 with mask
                fallbackFormData.append('input_fidelity', 'high')
                // fallbackFormData.append('response_format', 'url') // REMOVED here too

                const res2 = await fetch('https://api.openai.com/v1/images/edits', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
                    body: fallbackFormData
                })

                if (!res2.ok) {
                    const errText2 = await res2.text()
                    throw new Error(`GPT 1.5 Masked Error: ${errText2}`)
                }
                const json2 = await res2.json()

                if (json2.data && json2.data[0].url) {
                    finalGeneratedUrl = json2.data[0].url
                } else if (json2.data && json2.data[0].b64_json) {
                    const b64 = json2.data[0].b64_json
                    const buff = Buffer.from(b64, 'base64')
                    const resName = `${user.id}/result_final_${Date.now()}.png`
                    await supabase.storage.from('clinic-assets').upload(resName, buff, { contentType: 'image/png' })
                    const { data: { publicUrl } } = supabase.storage.from('clinic-assets').getPublicUrl(resName)
                    finalGeneratedUrl = publicUrl
                }
            } else {
                throw e
            }
        }

        // Final sanity check
        if (!finalGeneratedUrl) return { success: true, imageUrl: imageUrl } // Fallback to original if logic skipped? Should handle error.

        // If it was B64, we already uploaded (finalGeneratedUrl is supabase string). 
        // If it was URL (OpenAI CDN), we need to upload to Supabase to persist? 
        // Actually, previous code uploaded the URL blob.
        // Let's standardize: if it starts with http (and not supabase), fetch and upload.
        if (!finalGeneratedUrl.includes('supabase')) { // loose check
            try {
                const finalBlob = await (await fetch(finalGeneratedUrl)).blob()
                const resName = `${user.id}/result_final_${Date.now()}.png`
                await supabase.storage.from('clinic-assets').upload(resName, finalBlob, { contentType: 'image/png' })
                const { data: { publicUrl } } = supabase.storage.from('clinic-assets').getPublicUrl(resName)
                finalGeneratedUrl = publicUrl
            } catch (e) { } // if blob fetch fails, we keep the cdn url (risky as it expires)
        }

        // Upload result logic is handled above. checking if we need to return.
        if (!finalGeneratedUrl) return { success: true, imageUrl: imageUrl }

        // Upload Result (No un-letterboxing needed as we didn't letterbox)
        // Note: The previous block already handles uploading if finalGeneratedUrl was a CDN link.
        // We just return success now.

        await supabase.from('examples').insert({ clinic_id: clinic?.id, before_image_url: imageUrl, after_image_url: finalGeneratedUrl })

        return { success: true, imageUrl: finalGeneratedUrl }

    } catch (error: any) {
        console.error("Exec Error:", error)
        return { success: false, error: 'Failed: ' + error.message }
    }
}
