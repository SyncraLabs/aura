import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import Replicate from 'replicate'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testReplicate() {
    if (!process.env.REPLICATE_API_TOKEN) {
        console.error('No Replicate Token Found')
        return;
    }

    console.log('Replicate Token Found:', process.env.REPLICATE_API_TOKEN.substring(0, 5) + '...')

    const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
    })

    try {
        // Simple test using a small model or standard one
        // Generating a small test image to verify auth
        console.log('Testing Replicate Authentication...')

        const output = await replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            {
                input: {
                    prompt: "a small red dot",
                    width: 128,
                    height: 128
                }
            }
        )

        console.log('Replicate Test Success:', output)
    } catch (e) {
        console.error('Replicate Test Failed:', e)
    }
}

testReplicate()
