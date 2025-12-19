import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center font-bold" href="#">
          Beauty Clinic AI
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center text-center px-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Transform Your Clients<br />with AI Magic
          </h1>
          <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mt-4">
            Instantly generate realistic "after" photos for dental, hair, and beauty procedures.
            Train our AI on your specific style.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" className="px-8">Get Started</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
