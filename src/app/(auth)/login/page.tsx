'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, signup, verify, resend } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('login')
    const [step, setStep] = useState<'form' | 'verify'>('form') // For signup verification
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resendStatus, setResendStatus] = useState<string | null>(null) // New state

    // Handle Login (Email + Password)
    const handleLogin = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        const res = await login(formData)
        setLoading(false)

        if (res?.error) {
            setError(res.error)
        } else {
            router.push('/dashboard')
        }
    }

    // Handle Signup (Email + Password -> triggers Verification)
    const handleSignup = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        // Store email for verification step
        setEmail(formData.get('email') as string)

        const res = await signup(formData)
        setLoading(false)

        if (res?.error) {
            setError(res.error)
        } else if (res?.session) {
            // Auto-confirmed (e.g. Email Confirmations Disabled in Supabase)
            router.push('/dashboard')
        } else {
            setStep('verify') // Move to OTP entry
        }
    }

    // Handle Verification (Email + Code)
    const handleVerify = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        formData.append('email', email)

        const res = await verify(formData)
        setLoading(false)

        if (res?.error) {
            setError(res.error)
        }
        // verify action handles redirect on success
    }

    // Handle Resend
    const handleResend = async () => {
        setLoading(true)
        setError(null)
        setResendStatus(null)

        const formData = new FormData()
        formData.append('email', email)

        const res = await resend(formData)
        setLoading(false)

        if (res?.error) {
            setError(res.error)
        } else {
            setResendStatus("New code sent! Check your inbox.")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden selection:bg-accent/30 font-sans">
            {/* Ambient Glows: Blue & Green */}
            <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-in fade-in duration-1000" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-emerald-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-in fade-in duration-1000 delay-300" />

            <div className="w-full max-w-sm p-8 glass-card rounded-3xl border border-white/10 shadow-2xl relative z-10 backdrop-blur-3xl">
                <div className="text-center mb-8 space-y-2">
                    <h1 className="text-6xl font-serif italic text-white tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60">
                        Aura
                    </h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] font-medium">
                        {step === 'verify' ? 'Verify Account' : 'Portal Access'}
                    </p>
                </div>

                {step === 'verify' ? (
                    <form action={handleVerify} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="space-y-2 text-center">
                            <p className="text-xs text-muted-foreground">
                                We sent a code to <span className="text-white font-medium">{email}</span>.
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">
                                (Check your Spam folder!)
                            </p>
                            <Input
                                name="token"
                                type="text"
                                placeholder="123456"
                                required
                                autoFocus
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:bg-white/5 focus:ring-1 focus:ring-emerald-500/50 transition-all h-12 rounded-xl text-center tracking-[0.5em] text-lg font-sans mt-4"
                            />
                        </div>
                        <Button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 transition-all h-12 rounded-xl font-medium mt-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            {loading ? 'Verifying...' : 'Complete Sign Up'}
                        </Button>
                        <button type="button" onClick={() => setStep('form')} className="w-full text-xs text-muted-foreground hover:text-white mt-4 underline underline-offset-4">
                            Wrong email? Try again
                        </button>
                    </form>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-xl">
                            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground transition-all">Sign In</TabsTrigger>
                            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground transition-all">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form action={handleLogin} className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Email</Label>
                                    <Input name="email" type="email" required placeholder="name@example.com" className="bg-black/20 border-white/10 text-white focus:border-cyan-400/50 h-11 rounded-lg" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Password</Label>
                                    <Input name="password" type="password" required placeholder="••••••••" className="bg-black/20 border-white/10 text-white focus:border-cyan-400/50 h-11 rounded-lg" />
                                </div>
                                <Button disabled={loading} className="w-full bg-white text-black hover:bg-cyan-50 h-11 rounded-lg font-medium mt-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form action={handleSignup} className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Email</Label>
                                    <Input name="email" type="email" required placeholder="name@example.com" className="bg-black/20 border-white/10 text-white focus:border-emerald-500/50 h-11 rounded-lg" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Password</Label>
                                    <Input name="password" type="password" required placeholder="Create a password" className="bg-black/20 border-white/10 text-white focus:border-emerald-500/50 h-11 rounded-lg" />
                                </div>
                                <Button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 rounded-lg font-medium mt-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                )}

                {error && (
                    <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-center text-xs rounded-lg animate-in zoom-in-95">
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
