'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
    const [services, setServices] = useState<string[]>([])
    const [references, setReferences] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [newRefFile, setNewRefFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch Clinic Services
        const { data: clinic } = await supabase.from('clinics').select('services, id').eq('owner_id', user.id).single()
        if (clinic) {
            setServices(clinic.services || [])
            // Fetch Existing References
            const { data: refs } = await supabase.from('service_references').select('*').eq('clinic_id', clinic.id)
            setReferences(refs || [])
        }
        setLoading(false)
    }

    const handleUpload = async (serviceName: string) => {
        if (!newRefFile) return
        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Upload File
            const fileExt = newRefFile.name.split('.').pop()
            const fileName = `refs/${user.id}/${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage.from('clinic-assets').upload(fileName, newRefFile)
            if (uploadError) throw new Error(uploadError.message)

            const { data: publicUrl } = supabase.storage.from('clinic-assets').getPublicUrl(fileName)

            // 2. Save DB Record
            const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', user.id).single()
            if (!clinic) throw new Error('No clinic found')

            const { error: dbError } = await supabase.from('service_references').insert({
                clinic_id: clinic.id,
                service_name: serviceName,
                image_url: publicUrl.publicUrl,
                description: 'User uploaded reference'
            })
            if (dbError) throw new Error(dbError.message)

            // Refresh
            setNewRefFile(null)
            fetchData()
        } catch (error: any) {
            console.error(error)
            alert(`Upload failed: ${error.message || 'Unknown error'}`)
        } finally {
            setUploading(false)
        }
    }

    const deleteRef = async (id: string) => {
        if (!confirm('Remove this reference image?')) return
        await supabase.from('service_references').delete().eq('id', id)
        fetchData()
    }

    const handleAddService = async () => {
        const service = prompt("Enter new service name:")
        if (!service) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: clinic } = await supabase.from('clinics').select('id, services').eq('owner_id', user.id).single()
            if (!clinic) return

            const updatedServices = [...(clinic.services || []), service]

            await supabase.from('clinics').update({ services: updatedServices }).eq('id', clinic.id)
            fetchData()
        } catch (e) {
            console.error(e)
            alert('Failed to add service')
        }
    }

    if (loading) return <div className="p-8">Loading settings...</div>

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-light mb-2">Knowledge Base</h1>
                    <p className="text-muted-foreground">Train your AI by uploading example "After" results for your specific services.</p>
                </div>
                <Button onClick={handleAddService}>+ Add New Service</Button>
            </div>

            <div className="grid gap-6">
                {services.length === 0 && (
                    <Card className="p-6 text-center text-muted-foreground">
                        No services defined. Please add a service to start training.
                    </Card>
                )}

                {services.map(service => (
                    <Card key={service} className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-medium">{service}</h3>
                                <p className="text-sm text-muted-foreground">Manage reference styles for {service}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedService(selectedService === service ? null : service)}
                            >
                                {selectedService === service ? 'Close' : 'Add Reference'}
                            </Button>
                        </div>

                        {/* Upload Area */}
                        {selectedService === service && (
                            <div className="bg-muted/30 p-4 rounded-lg mb-4 border-2 border-dashed">
                                <Label>Upload Ideal Result for "{service}"</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="bg-background"
                                        onChange={e => setNewRefFile(e.target.files?.[0] || null)}
                                    />
                                    <Button onClick={() => handleUpload(service)} disabled={!newRefFile || uploading}>
                                        {uploading ? 'Uploading...' : 'Save Reference'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Gallery of Refs */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {references.filter(r => r.service_name === service).map(ref => (
                                <div key={ref.id} className="relative group shrink-0 w-32">
                                    <div className="h-32 w-32 relative rounded-md overflow-hidden border">
                                        <Image
                                            src={ref.image_url}
                                            alt="Ref"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => deleteRef(ref.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            {references.filter(r => r.service_name === service).length === 0 && (
                                <div className="h-32 w-32 flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground text-xs text-center p-2 shrink-0">
                                    No references yet
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
