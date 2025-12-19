// Minimal Login Page with new Aura Branding
import { login, signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />

            <form className="w-full max-w-md p-8 glass-card rounded-2xl border border-white/10 shadow-2xl relative z-10 transition-all hover:border-white/20">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif italic text-white mb-2 bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-500 cursor-default">
                        Aura
                    </h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-medium">AI Beauty Clinic</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-white/50 pl-1">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="clinic@aura.ai"
                            required
                            className="bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/10 transition-all h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-white/50 pl-1">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="bg-white/5 border-white/5 text-white focus:border-primary/50 focus:bg-white/10 transition-all h-11"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <Button formAction={login} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white border-0 shadow-lg shadow-teal-500/20 transition-all text-xs tracking-widest uppercase font-medium h-11">
                        Sign In
                    </Button>
                    <Button formAction={signup} variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white text-xs tracking-widest uppercase font-medium h-11 bg-transparent backdrop-blur-sm">
                        Sign Up
                    </Button>
                </div>

                {searchParams?.message && (
                    <p className="mt-6 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-center text-xs rounded-md backdrop-blur-md">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    )
}
