import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data?.user) return null

    // Fetch recent transformations (mock for now if no table data)
    const { data: recent } = await supabase
        .from('examples') // Re-using examples table for results? Or new table? 
        // Let's assume we store results in 'examples' or a new 'transformations' table.
        // For now, let's just query 'examples' as a placeholder.
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-light">Welcome back</h2>
                    <p className="text-muted-foreground">Here are your recent client transformations.</p>
                </div>
                <Link href="/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Client
                    </Button>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Generated Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Unlimited</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recent Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(!recent || recent.length === 0) ? (
                        <div className="col-span-3 text-center p-12 border border-dashed rounded-lg text-muted-foreground">
                            No transformations yet. Start your first one!
                        </div>
                    ) : (
                        recent.map((item: any) => (
                            <Card key={item.id} className="overflow-hidden">
                                <div className="h-48 bg-muted relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.after_image_url} alt="Result" className="object-cover w-full h-full" />
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
