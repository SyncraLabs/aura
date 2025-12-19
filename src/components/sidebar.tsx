'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, PlusCircle, Image as ImageIcon, Settings, LogOut, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'New Client',
        href: '/new',
        icon: PlusCircle
    },
    {
        title: 'Quick Cam',
        href: '/camera',
        icon: Camera
    },
    {
        title: 'Gallery',
        href: '/gallery',
        icon: ImageIcon
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings
    }
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <div className="hidden md:flex w-72 border-r border-white/5 bg-black h-screen flex-col selection:bg-white/20">
            <div className="p-8 border-b border-white/5">
                <h1 className="text-3xl font-serif italic text-white tracking-tight">
                    Aura
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mt-2 font-medium">Aesthetic Intelligence</p>
            </div>

            <nav className="flex-1 p-6 space-y-1">
                {sidebarItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <span className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium",
                            pathname === item.href
                                ? "bg-white text-black shadow-lg shadow-white/10"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}>
                            <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-black" : "text-muted-foreground group-hover:text-white")} />
                            {item.title}
                        </span>
                    </Link>
                ))}
            </nav>

            <div className="p-6 border-t border-white/5">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl h-12" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
