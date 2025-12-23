import { Sidebar } from '@/components/sidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import { MobileNav } from '@/components/mobile-nav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        redirect('/login')
    }

    // Check if user has completed onboarding
    const { data: clinic } = await supabase
        .from('clinics')
        .select('id')
        .eq('owner_id', data.user.id)
        .single()

    if (!clinic) {
        redirect('/onboarding')
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-background overflow-auto pb-20 md:pb-0 relative md:pl-72 transition-all duration-300">
                {/* Ambient Glows for Dashboard */}
                <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

                <div className="relative z-10 w-full min-h-full">
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    )
}
