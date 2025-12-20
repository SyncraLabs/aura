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
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden selection:bg-accent/30">
            {/* Ambient Glows (Vibrant) */}
            <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-in fade-in duration-1000" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-in fade-in duration-1000 delay-300" />

            <div className="w-full max-w-sm p-8 glass-card rounded-3xl border border-white/10 shadow-2xl relative z-10 backdrop-blur-3xl">
                <div className="text-center mb-10 space-y-2">
                    <h1 className="text-6xl font-serif italic text-white tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60">
                        Aura
                    </h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-sans font-medium">
                        {step === 'email' ? 'Portal Access' : 'Verify Identity'}
                    </p>
                </div>

                {step === 'email' ? (
                    <form action={handleEmailSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1 font-sans">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="clinic@aura.ai"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/5 focus:ring-1 focus:ring-primary/50 transition-all h-12 rounded-xl font-sans"
                            />
                        </div>
                        <Button disabled={loading} className="w-full bg-white text-black hover:bg-cyan-50 border-0 transition-all h-12 rounded-xl font-medium font-sans mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                            {loading ? 'Sending Code...' : 'Continue with Email'}
                        </Button>
                    </form>
                ) : (
                    <form action={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="token" className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1 font-sans">Enter 6-Digit Code</Label>
                            <Input
                                id="token"
                                name="token"
                                type="text"
                                placeholder="123456"
                                required
                                autoFocus
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:bg-white/5 focus:ring-1 focus:ring-purple-500/50 transition-all h-12 rounded-xl text-center tracking-[0.5em] text-lg font-sans"
                            />
                        </div>
                        <Button disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white border-0 transition-all h-12 rounded-xl font-medium font-sans mt-4 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </Button>
                        <button type="button" onClick={() => setStep('email')} className="w-full text-xs text-muted-foreground hover:text-white mt-4 underline underline-offset-4 font-sans">
                            Wrong email? Go back
                        </button>
                    </form>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-center text-xs rounded-xl animate-in zoom-in-95 font-sans relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                        <span className="relative z-10">{error}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
