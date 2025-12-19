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
        <div className="hidden md:flex w-64 border-r bg-card h-screen flex-col">
            <div className="p-6 border-b border-white/5">
                <h1 className="text-2xl font-serif italic text-white tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Aura
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">AI Beauty Clinic</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <span className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                            pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                        )}>
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
