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
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-5xl font-serif font-medium tracking-tight text-white mb-2">Welcome back</h2>
                    <p className="text-white/60 text-lg font-light">Here are your recent client transformations.</p>
                </div>
                <Link href="/new">
                    <Button className="rounded-full px-6 h-12 bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 font-medium">
                        <Plus className="mr-2 h-4 w-4" /> New Client
                    </Button>
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card p-6 flex flex-col justify-between h-32 hover:bg-white/10 transition-colors cursor-pointer group rounded-2xl">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Clients</h3>
                    <p className="text-4xl font-serif text-white group-hover:translate-x-2 transition-transform">0</p>
                </Card>
                <Card className="glass-card p-6 flex flex-col justify-between h-32 hover:bg-white/10 transition-colors cursor-pointer group rounded-2xl">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Generated Images</h3>
                    <p className="text-4xl font-serif text-sky-400 group-hover:translate-x-2 transition-transform">0</p>
                </Card>
                <Card className="glass-card p-6 flex flex-col justify-between h-32 hover:bg-white/10 transition-colors cursor-pointer group rounded-2xl">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Credits Remaining</h3>
                    <p className="text-4xl font-serif text-emerald-400 group-hover:translate-x-2 transition-transform">Unlimited</p>
                </Card>
            </div>

            {/* Recent Activity Redesign */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-serif font-light text-white">Recent Activity</h3>
                    <Link href="/gallery" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1 group">
                        <span className="group-hover:underline decoration-white/30 underline-offset-4">View All</span> <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </div>

                {recent && recent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recent.map((item: any) => (
                            <Link href={`/gallery`} key={item.id} className="group relative block aspect-[4/5] rounded-2xl overflow-hidden glass-card transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20">
                                {/* Image */}
                                <div className="absolute inset-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.after_url || item.before_url}
                                        alt="Transformation"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-xs font-bold text-sky-300 tracking-widest uppercase mb-1 drop-shadow-md">{item.service || 'Transformation'}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-white/90 text-sm font-light">{new Date(item.created_at).toLocaleDateString()}</p>
                                        <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black mt-2">
                                            <ArrowUpRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="h-64 rounded-3xl glass-card flex flex-col items-center justify-center text-white/40 border-dashed border-2 border-white/5 bg-white/5">
                        <div className="h-16 w-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <User className="h-8 w-8 opacity-40" />
                        </div>
                        <p className="font-serif italic text-lg opacity-60">No recent transformations</p>
                    </div>
                )}
            </section>
        </div>
    )
}
