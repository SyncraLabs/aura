import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, ArrowUpRight, User } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data?.user) return null

    // Fetch recent transformations
    const { data: recent } = await supabase
        .from('examples')
        .select('*')
        .limit(6)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 md:p-16 max-w-[1600px] mx-auto space-y-16">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h2 className="text-5xl md:text-6xl font-serif font-medium tracking-tight text-white">Welcome back</h2>
                    <p className="text-white/60 text-lg font-light tracking-wide">Here are your recent client transformations.</p>
                </div>
                <Link href="/new">
                    <Button className="rounded-full px-8 h-14 bg-white text-black hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105 font-medium text-base tracking-wide">
                        <Plus className="mr-2 h-5 w-5" /> New Client
                    </Button>
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <Card className="glass-card p-8 flex flex-col justify-between h-48 hover:bg-white/10 transition-colors cursor-pointer group rounded-3xl border-0 ring-1 ring-white/10">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Total Clients</h3>
                        <div className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                    </div>
                    <p className="text-5xl md:text-6xl font-serif text-white group-hover:translate-x-2 transition-transform">0</p>
                </Card>
                <Card className="glass-card p-8 flex flex-col justify-between h-48 hover:bg-white/10 transition-colors cursor-pointer group rounded-3xl border-0 ring-1 ring-white/10">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Generated Images</h3>
                        <div className="h-2 w-2 rounded-full bg-sky-500/50 group-hover:bg-sky-400 transition-colors" />
                    </div>
                    <p className="text-5xl md:text-6xl font-serif text-sky-400 group-hover:translate-x-2 transition-transform">0</p>
                </Card>
                <Card className="glass-card p-8 flex flex-col justify-between h-48 hover:bg-white/10 transition-colors cursor-pointer group rounded-3xl border-0 ring-1 ring-white/10">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Credits Remaining</h3>
                        <div className="h-2 w-2 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
                    </div>
                    <p className="text-5xl md:text-6xl font-serif text-emerald-400 group-hover:translate-x-2 transition-transform">∞</p>
                </Card>
            </div>

            {/* Recent Activity Redesign */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-serif font-light text-white">Recent Activity</h3>
                    <Link href="/gallery" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2 group px-4 py-2 rounded-full hover:bg-white/5">
                        <span className="group-hover:tracking-wider transition-all duration-300">View All</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </div>

                {recent && recent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {recent.map((item: any) => (
                            <Link href={`/gallery`} key={item.id} className="group relative block aspect-[3/4] rounded-[2rem] overflow-hidden glass-card transition-all duration-700 hover:scale-[1.01] hover:shadow-2xl hover:shadow-white/5 ring-1 ring-white/10 border-0">
                                {/* Image */}
                                <div className="absolute inset-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.after_url || item.before_url}
                                        alt="Transformation"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                    <p className="text-xs font-bold text-sky-300 tracking-[0.2em] uppercase mb-2 drop-shadow-md">{item.service || 'Transformation'}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-white text-lg font-serif italic tracking-wide">{new Date(item.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                                        <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white hover:text-black hover:scale-110">
                                            <ArrowUpRight className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="h-96 rounded-[2.5rem] glass-card flex flex-col items-center justify-center text-white/40 border-2 border-dashed border-white/10 bg-white/[0.02]">
                        <div className="h-24 w-24 mb-6 rounded-full bg-gradient-to-tr from-white/5 to-transparent flex items-center justify-center shadow-inner">
                            <User className="h-10 w-10 opacity-30" />
                        </div>
                        <p className="font-serif text-2xl opacity-50 font-light">No recent transformations</p>
                        <Link href="/new" className="mt-6">
                            <Button variant="ghost" className="text-white/60 hover:text-white">Start your first one</Button>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    )
}
