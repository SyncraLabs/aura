import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground font-sans selection:bg-accent/30 relative overflow-hidden">

      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-in fade-in duration-1000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-in fade-in duration-1000 delay-300" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-green-500/10 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[5000ms]" />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link className="flex items-center gap-2 group" href="#">
            <span className="font-serif italic text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 group-hover:to-primary transition-all">Aura</span>
          </Link>
          <nav className="flex gap-8 items-center">
            <Link className="text-sm font-medium text-muted-foreground hover:text-white transition-colors tracking-wide" href="/login">
              Sign In
            </Link>
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-6 h-10 text-xs border-white/10 hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] transition-all">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-20 relative z-10">

        {/* Hero Section */}
        <section className="container mx-auto px-6 flex flex-col items-center text-center space-y-12">
          <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-foreground/90 mb-4 backdrop-blur-md glow-blue">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <span className="tracking-widest uppercase">The Next Gen Aesthetic AI</span>
            </div>

            <h1 className="font-sans font-bold text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter text-white">
              Redefine <br />
              <span className="text-gradient">Perfection.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-light tracking-wide">
              Advanced context-aware simulation for elite aesthetic clinics.
              <br />
              <span className="text-white/40 text-sm mt-2 block font-mono">Powered by Gemini 1.5 & GPT-4o</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-10 h-14 text-base bg-white text-black hover:bg-cyan-50 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] transition-all transform hover:scale-105">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="ghost" className="rounded-full px-10 h-14 text-base text-white hover:bg-white/5 border border-white/5 hover:border-white/20 backdrop-blur-sm group">
                  Watch Demo <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform text-primary" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Abstract Visual / Mesh Gradient */}
          <div className="w-full max-w-6xl aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative mt-24 group">
            <div className="absolute inset-0 bg-black/40 z-10" />

            {/* Dynamic CSS Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black opacity-80" />
            <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-cyan-500/30 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-purple-500/30 blur-[100px] rounded-full animate-pulse delay-1000" />

            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="glass px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-white/40 font-mono text-sm ml-4">initiating_neural_link...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid (Minimalist + Glass) */}
        <section className="container mx-auto px-6 py-40">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Context Aware", desc: "Aura understands your specific sector—dental, hair, or dermatology.", color: "text-cyan-400", glow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]" },
              { title: "Instant Simulation", desc: "Generate studio-quality before/after comparisons in seconds.", color: "text-purple-400", glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]" },
              { title: "Secure & Private", desc: "Enterprise-grade encryption for all client data and photos.", color: "text-emerald-400", glow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]" }
            ].map((feature, i) => (
              <div key={i} className={`space-y-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 group ${feature.glow}`}>
                <CheckCircle2 className={`w-8 h-8 ${feature.color}`} />
                <h3 className="text-2xl font-sans font-medium text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">{feature.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="py-12 border-t border-white/5 bg-black relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-serif italic text-xl text-white/40">Aura</span>
          <p className="text-sm text-muted-foreground">&copy; 2024 Aura Aesthetics AI. Crafted for perfection.</p>
        </div>
      </footer>
    </div>
  )
}
