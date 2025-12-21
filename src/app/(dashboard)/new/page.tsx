'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Wand2, ArrowRight, Image as ImageIcon } from 'lucide-react'
import { generateTransformation } from './actions'

export default function NewTransformationPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [service, setService] = useState('whitening')
    const [isProcessing, setIsProcessing] = useState(false)
    const [resultImage, setResultImage] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'original' | 'result'>('original') // [NEW] Toggle state

    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setSelectedImage(url)
            setSelectedFile(file)
            setResultImage(null)
            setViewMode('original')
        }
    }

    const handleGenerate = async () => {
        if (!selectedFile) return
        setIsProcessing(true)

        try {
            const formData = new FormData()
            formData.append('image', selectedFile)
            formData.append('service', service)

            const result = await generateTransformation(formData)

            if (result.success && result.imageUrl) {
                setResultImage(result.imageUrl)
                setViewMode('result')
            } else {
                alert(`Generation failed: ${result.error}`)
            }
        } catch (e) {
            console.error(e)
            alert('Error generating image')
        } finally {
            setIsProcessing(false)
        }
    }

    const [services, setServices] = useState<string[]>([])
    const [loadingServices, setLoadingServices] = useState(true)

    // Fetch services on mount
    useEffect(() => {
        const fetchServices = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('clinics').select('services').eq('owner_id', user.id).single()
                if (data?.services && data.services.length > 0) {
                    setServices(data.services)
                    setService(data.services[0])
                } else {
                    // Fallback defaults
                    setServices(['Teeth Whitening', 'Veneers', 'Hair Color: Blonde', 'Hair Color: Brunette'])
                }
            }
            setLoadingServices(false)
        }
        fetchServices()
    }, [])

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-light mb-2">New Client Transformation</h1>
                <p className="text-muted-foreground">Upload a client photo and select a service to generate results.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="glass-card border-0 p-6">
                        <h3 className="text-lg font-medium mb-4">1. Upload Photo</h3>
                        <div className="border border-white/10 border-dashed rounded-lg p-8 text-center hover:bg-white/5 transition-colors">
                            <input
                                type="file"
                                id="image-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Click to upload or drag & drop</span>
                            </label>
                        </div>
                    </Card>

                    <Card className="glass-card border-0 p-6">
                        <h3 className="text-lg font-medium mb-4">2. Select Service</h3>
                        {loadingServices ? (
                            <p className="text-sm text-muted-foreground">Loading services...</p>
                        ) : (
                            <Select value={service} onValueChange={setService}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black border-white/10 text-white">
                                    {services.map(s => (
                                        <SelectItem key={s} value={s} className="hover:bg-white/10 cursor-pointer">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {services.length === 0 && !loadingServices && (
                            <p className="text-xs text-red-500 mt-2">No services found. Add them in Settings.</p>
                        )}
                    </Card>

                    <Button
                        size="lg"
                        className="w-full gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        disabled={!selectedImage || isProcessing}
                        onClick={handleGenerate}
                    >
                        {isProcessing ? (
                            <>
                                <Wand2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="h-4 w-4" />
                                Generate Preview
                            </>
                        )}
                    </Button>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <Card className="glass-card border-0 p-6 min-h-[500px] flex flex-col items-center justify-center">
                        {!selectedImage ? (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Preview will appear here</p>
                            </div>
                        ) : (
                            <div className="relative w-full h-full min-h-[400px]">
                                {viewMode === 'result' && resultImage ? (
                                    <div className="relative w-full h-full animate-in fade-in duration-300">
                                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                            <span className="bg-emerald-500/80 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">After</span>
                                        </div>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={resultImage}
                                            alt="Result"
                                            className="w-full h-full object-contain rounded-md"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full animate-in fade-in duration-300">
                                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                            <span className="bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-sm">Before</span>
                                        </div>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={selectedImage}
                                            alt="Original"
                                            className="w-full h-full object-contain rounded-md"
                                        />
                                        {isProcessing && (
                                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-20">
                                                <div className="flex flex-col items-center">
                                                    <Wand2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                                    <p className="text-sm font-medium animate-pulse">AI is working its magic...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {resultImage && (
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'original' ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setViewMode(viewMode === 'original' ? 'result' : 'original')}
                            >
                                {viewMode === 'original' ? 'Show Result' : 'Show Original'}
                            </Button>
                            <Button className="flex-1 p-0" asChild>
                                <a href={resultImage} download={`transformation-result-${Date.now()}.png`}>
                                    <ArrowRight className="h-4 w-4 mr-2" /> Download Result
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
