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
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden selection:bg-white/20">
            {/* Ambient Glows (Subtle) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

            <form className="w-full max-w-sm p-8 glass-card rounded-3xl border border-white/5 shadow-2xl relative z-10">
                <div className="text-center mb-12 space-y-2">
                    <h1 className="text-5xl font-serif italic text-white tracking-tight">
                        Aura
                    </h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">Aesthetic Intelligence</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="clinic@aura.ai"
                            required
                            className="bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 transition-all h-12 rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="bg-white/5 border-white/5 text-white focus:border-white/20 focus:bg-white/10 transition-all h-12 rounded-xl"
                        />
                    </div>
                </div>

                <div className="grid gap-3 mt-8">
                    <Button formAction={login} className="w-full bg-white text-black hover:bg-gray-200 border-0 transition-all h-12 rounded-xl font-medium">
                        Log In
                    </Button>
                    <Button formAction={signup} variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white h-12 rounded-xl bg-transparent">
                        Create Account
                    </Button>
                </div>

                {searchParams?.message && (
                    <p className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-center text-xs rounded-xl">
                        {decodeURIComponent(searchParams.message)}
                    </p>
                )}
            </form>
        </div>
    )
}
