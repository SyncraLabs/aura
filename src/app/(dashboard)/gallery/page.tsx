import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

export default async function GalleryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: images } = await supabase
        .from('examples')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="p-8">
            <h1 className="text-3xl font-light mb-6">Transformation Gallery</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images?.map((image: any) => (
                    <Card key={image.id} className="overflow-hidden group relative">
                        <div className="aspect-[4/3] flex relative">
                            {/* Before Image (Left Half) */}
                            <div className="w-1/2 relative overflow-hidden border-r border-white/10">
                                <img
                                    src={image.before_image_url}
                                    alt="Before"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-white/10 font-medium">Before</div>
                            </div>
                            {/* After Image (Right Half) */}
                            <div className="w-1/2 relative overflow-hidden">
                                <img
                                    src={image.after_image_url}
                                    alt="After"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm shadow-lg font-medium">After</div>
                            </div>
                        </div>
                        <div className="p-4 bg-card">
                            <p className="text-sm font-medium text-muted-foreground">Generated {new Date(image.created_at).toLocaleDateString()}</p>
                        </div>
                    </Card>
                ))}

                {(!images || images.length === 0) && (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        <p>No transformations found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
