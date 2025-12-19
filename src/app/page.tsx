import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground font-sans selection:bg-primary/30">

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link className="flex items-center gap-2" href="#">
            <span className="font-serif italic text-2xl tracking-wide text-white">Aura</span>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link className="text-sm font-medium text-muted-foreground hover:text-white transition-colors" href="/login">
              Sign In
            </Link>
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-6 h-8 text-xs border-white/20 hover:bg-white/10 hover:text-white bg-transparent">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-20">

        {/* Hero Section */}
        <section className="container mx-auto px-6 flex flex-col items-center text-center space-y-12">
          <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-foreground/80 mb-4">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>Now with Intelligent Context Learning</span>
            </div>

            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight text-white">
              The Future of <br />
              <span className="italic text-white/60">Aesthetic Precision.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
              Transform client consultations with hyper-realistic AI simulations.
              Train Aura on your clinic's unique style for results that look exactly like your work.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-8 h-12 text-base bg-white text-black hover:bg-gray-200">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="ghost" className="rounded-full px-8 h-12 text-base text-white hover:bg-white/10 group">
                  Watch Demo <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Abstract Visual / Mesh Gradient */}
          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative mt-16 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-black to-purple-900/20 opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif italic text-white/20 text-4xl">Interactive Demo Preview</span>
            </div>
            {/* This would be a real image/video in prod */}
          </div>
        </section>

        {/* Feature Grid (Minimalist) */}
        <section className="container mx-auto px-6 py-32">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Context Aware", desc: "Aura understands your specific sector—dental, hair, or dermatology." },
              { title: "Instant Simulation", desc: "Generate studio-quality before/after comparisons in seconds." },
              { title: "Secure & Private", desc: "Enterprise-grade encryption for all client data and photos." }
            ].map((feature, i) => (
              <div key={i} className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-serif text-white">{feature.title}</h3>
                <p className="text-muted-foreground font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="py-8 border-t border-white/5 text-center text-sm text-muted-foreground">
        <p>&copy; 2024 Aura Aesthetics AI. Crafted for perfection.</p>
      </footer>
    </div>
  )
}
