'use client'

import { useState } from 'react'
import { signInWithOtp, verifyOtp } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
    const [step, setStep] = useState<'email' | 'otp'>('email')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleEmailSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        const res = await signInWithOtp(formData)
        setLoading(false)

        if (res?.error) {
            setError(res.error)
        } else {
            setStep('otp')
        }
    }

    const handleOtpSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        // Add email to formData since verifiedOtp needs it
        formData.append('email', email)
        const res = await verifyOtp(formData)
        setLoading(false)

        if (res?.error) {
            setError(res.error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden selection:bg-white/20">
            {/* Ambient Glows (Subtle) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-sm p-8 glass-card rounded-3xl border border-white/5 shadow-2xl relative z-10">
                <div className="text-center mb-12 space-y-2">
                    <h1 className="text-5xl font-serif italic text-white tracking-tight">
                        Aura
                    </h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">
                        {step === 'email' ? 'Sign In' : 'Verify Identity'}
                    </p>
                </div>

                {step === 'email' ? (
                    <form action={handleEmailSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="clinic@aura.ai"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 transition-all h-12 rounded-xl"
                            />
                        </div>
                        <Button disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 border-0 transition-all h-12 rounded-xl font-medium mt-8">
                            {loading ? 'Sending Code...' : 'Continue with Email'}
                        </Button>
                    </form>
                ) : (
                    <form action={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="token" className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Enter 6-Digit Code</Label>
                            <Input
                                id="token"
                                name="token"
                                type="text"
                                placeholder="123456"
                                required
                                autoFocus
                                className="bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 transition-all h-12 rounded-xl text-center tracking-[0.5em] text-lg"
                            />
                        </div>
                        <Button disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 border-0 transition-all h-12 rounded-xl font-medium mt-8">
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </Button>
                        <button type="button" onClick={() => setStep('email')} className="w-full text-xs text-muted-foreground hover:text-white mt-4 underline underline-offset-4">
                            Wrong email? Go back
                        </button>
                    </form>
                )}

                {error && (
                    <p className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-center text-xs rounded-xl animate-in zoom-in-95">
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
}
