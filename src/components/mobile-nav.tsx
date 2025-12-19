'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, PlusCircle, Image as ImageIcon, Settings, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    {
        title: 'Home',
        href: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'New',
        href: '/new',
        icon: PlusCircle
    },
    {
        title: 'Camera',
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

export function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 md:hidden pb-safe">
            <nav className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1",
                            pathname === item.href
                                ? "text-primary"
                                : "text-muted-foreground hover:text-white transition-colors"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", pathname === item.href && "animate-pulse")} />
                        <span className="text-[10px] uppercase tracking-widest font-medium">{item.title}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}
