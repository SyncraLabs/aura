'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import { saveClinicProfile } from './actions'

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        type: 'dental',
        description: '',
        services: [] as string[]
    })
    const [newService, setNewService] = useState('')
    const [file, setFile] = useState<File | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleAddService = () => {
        if (newService.trim()) {
            setFormData(prev => ({
                ...prev,
                services: [...prev.services, newService.trim()]
            }))
            setNewService('')
        }
    }

    const removeService = (index: number) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        let docUrl = ''
        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Math.random()}.${fileExt}`
            const { data } = await supabase.storage.from('clinic-assets').upload(fileName, file)
            if (data) docUrl = data.path
        }

        const result = await saveClinicProfile({
            name: formData.name,
            type: formData.type,
            description: formData.description,
            services: formData.services,
            businessDocUrl: docUrl
        })

        if (result.success) {
            router.push('/dashboard')
        } else {
            alert(`Error saving profile: ${result.error}`)
        }

        setLoading(false)
    }

    return (
        <div className="max-w-xl mx-auto py-10">
            <h1 className="text-3xl font-light mb-2">Setup your Business</h1>
            <p className="text-muted-foreground mb-8">Let&apos;s customize your AI experience.</p>

            <Card className="p-8">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Business Name</Label>
                            <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Bright Smiles" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Business Type</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dental">Dental</SelectItem>
                                    <SelectItem value="hair">Hair Salon</SelectItem>
                                    <SelectItem value="nails">Nail Studio</SelectItem>
                                    <SelectItem value="aesthetic">Medical Aesthetics</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Short Description</Label>
                            <Input name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g. Specializing in veneers and natural aesthetics" />
                        </div>
                        <Button onClick={() => setStep(2)} disabled={!formData.name} className="w-full mt-4">Next: Services</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Add Your Services</Label>
                            <p className="text-xs text-muted-foreground">These will appear in your AI dashboard.</p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. Teeth Whitening"
                                    value={newService}
                                    onChange={(e) => setNewService(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                                />
                                <Button onClick={handleAddService} variant="secondary">Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4 min-h-[50px]">
                                {formData.services.map((s, i) => (
                                    <div key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                                        {s}
                                        <button onClick={() => removeService(i)} className="hover:text-destructive">×</button>
                                    </div>
                                ))}
                                {formData.services.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic">No services added yet.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                            <Button onClick={() => setStep(3)} className="flex-1">Next: Verification</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                            <Label>Business Document (Optional)</Label>
                            <p className="text-xs text-muted-foreground mb-4">Upload license or certification.</p>
                            <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="max-w-xs mx-auto" />
                        </div>
                        <div className="bg-muted/30 p-4 rounded text-sm text-center">
                            <p>You can upload <strong>Reference Photos</strong> in Settings later to fine-tune the AI style.</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                                {loading ? 'Saving...' : 'Complete Setup'}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-center gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2 w-2 rounded-full ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
                    ))}
                </div>
            </Card>
        </div>
    )
}
