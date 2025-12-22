'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, Camera, Image as ImageIcon, Settings, LogOut, LucideIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'New Client', icon: PlusCircle, href: '/new' },
    { name: 'Quick Cam', icon: Camera, href: '/camera' },
    { name: 'Gallery', icon: ImageIcon, href: '/gallery' },
    { name: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Logo Area */}
            <div className="p-8 pb-4">
                <Link href="/dashboard" className="block">
                    <h1 className="text-4xl font-serif italic font-medium tracking-tight text-white hover:text-white/90 transition-colors">
                        Aura
                    </h1>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-white text-black font-medium shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? 'text-black' : 'text-white/60 group-hover:text-white'}`} />
                            <span className="text-sm tracking-wide">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                        <span className="text-xs font-serif italic">N</span>
                    </div>
                    <span className="text-xs uppercase tracking-widest font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    )
}
