import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    const user = data?.user

    if (!user) {
        return redirect('/login')
    }

    // Check if clinic profile exists
    const { data: clinic } = await supabase
        .from('clinics')
        .select('onboarding_completed')
        .eq('owner_id', user.id)
        .single()

    // If clinic exists & onboarding done, redirect to dashboard if they visit onboarding?
    // Actually usually we want to keep them on onboarding if NOT done.
    // But this is just layout.

    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b p-4 flex justify-between items-center bg-card">
                <span className="font-bold">Beauty Clinic AI</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
            </header>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
