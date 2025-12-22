'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { RefreshCw, Zap, ArrowLeft, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { generateTransformation } from '../(dashboard)/new/actions'

type Service = {
    name: string,
    ai_prompt?: string
}

export default function CameraPage() {
    const webcamRef = useRef<Webcam>(null)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [resultSrc, setResultSrc] = useState<string | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // [NEW] View Mode for Toggle Switch
    const [viewMode, setViewMode] = useState<'before' | 'after'>('after')

    const router = useRouter()

    useEffect(() => {
        const fetchServices = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: clinic } = await supabase.from('clinics').select('id, services').eq('owner_id', user.id).single()
            if (clinic && clinic.services) {
                setServices(clinic.services.map((s: string) => ({ name: s })))
            } else {
                setServices([{ name: 'Whitening' }, { name: 'Veneers' }])
            }
        }
        fetchServices()
    }, [router])

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            setImageSrc(imageSrc)
            setViewMode('before') // Start with before view
        }
    }, [webcamRef])

    const retake = () => {
        setImageSrc(null)
        setResultSrc(null)
        setSelectedService(null)
        setError(null)
        setViewMode('after')
    }

    const handleGenerate = async () => {
        if (!imageSrc || !selectedService) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(imageSrc)
            const blob = await res.blob()
            const file = new File([blob], "camera-capture.png", { type: "image/png" })

            const formData = new FormData()
            formData.append('image', file)
            formData.append('service', selectedService)

            const result = await generateTransformation(formData)

            if (result.success && result.imageUrl) {
                setResultSrc(result.imageUrl)
                setViewMode('after') // Auto-switch to result
            } else {
                setError(result.error || "Generation failed - No URL returned")
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred during generation")
        } finally {
            setLoading(false)
        }
    }

    const videoConstraints = {
        facingMode: "user"
    };

    return (
        <div className="relative h-[100dvh] w-full bg-black overflow-hidden flex flex-col font-sans">

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="text-white hover:bg-white/10 pointer-events-auto">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="text-center">
                    <h1 className="text-sm font-medium tracking-widest uppercase text-white/80 font-serif italic">Quick Cam</h1>
                    <div className="flex flex-col gap-1 items-center">
                        <button
                            onClick={() => {
                                // Test Mode Backup
                                setImageSrc("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop")
                                setResultSrc("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop")
                                setViewMode('after')
                            }}
                            className="pointer-events-auto text-[10px] text-white/20 hover:text-white transition-colors"
                        >
                            DEBUG LOAD
                        </button>
                    </div>
                </div>
                <div className="w-6" />
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center bg-black p-4">

                {/* 1. Camera Feed */}
                {!imageSrc && (
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/png"
                            videoConstraints={videoConstraints}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* 2. Result View (Toggle) */}
                {imageSrc && (
                    <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-[9/16] max-h-[70vh] rounded-3xl overflow-hidden glass-card border-0 shadow-2xl animate-in zoom-in-95 duration-500">
                        {/* Image Display */}
                        <div className="absolute inset-0 bg-zinc-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={resultSrc && viewMode === 'after' ? resultSrc : imageSrc}
                                alt="Client"
                                className="w-full h-full object-cover"
                            />

                            {/* Status Overlay */}
                            {loading && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-10 animate-in fade-in">
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                        <RefreshCw className="h-8 w-8 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-white/80 font-serif italic animate-pulse">Designing new look...</p>
                                </div>
                            )}

                            {/* Label Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 ${resultSrc && viewMode === 'after'
                                        ? "bg-emerald-500/90 text-white"
                                        : "bg-black/60 text-white/80"
                                    }`}>
                                    {resultSrc && viewMode === 'after' ? "After Aura" : "Original"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Toast */}
                {error && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-full text-xs shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 z-50">
                        {error}
                        <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-6 pb-10 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 z-20 flex flex-col items-center gap-6">

                {!imageSrc ? (
                    // Capture Button
                    <button
                        onClick={capture}
                        className="group relative"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/40 transition-all duration-500" />
                        <div className="h-20 w-20 rounded-full border-[6px] border-white/20 flex items-center justify-center relative z-10 shadow-2xl transition-transform group-hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-sm">
                            <div className="h-16 w-16 rounded-full bg-white group-hover:bg-primary transition-colors duration-300" />
                        </div>
                    </button>
                ) : (
                    // Action Buttons
                    <div className="w-full max-w-md space-y-6">

                        {/* Service Selection (Only if no result yet) */}
                        {!resultSrc && !loading && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-sides justify-center">
                                {services.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedService(s.name)}
                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${selectedService === s.name
                                                ? 'bg-white text-black border-white shadow-lg scale-105'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4 justify-center">
                            {/* Retake */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={retake}
                                className="h-12 w-12 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </Button>

                            {/* Main Action */}
                            {!resultSrc ? (
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!selectedService || loading}
                                    className="h-12 px-8 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex-1 max-w-[200px]"
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    {loading ? 'Designing...' : 'Generate New Look'}
                                </Button>
                            ) : (
                                // Toggle Switch (Only when result exists)
                                <div className="bg-white/10 p-1 rounded-full flex border border-white/10 backdrop-blur-md">
                                    <button
                                        onClick={() => setViewMode('before')}
                                        className={`px-6 py-2 rounded-full text-xs font-medium transition-all duration-500 ${viewMode === 'before' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'
                                            }`}
                                    >
                                        Before
                                    </button>
                                    <button
                                        onClick={() => setViewMode('after')}
                                        className={`px-6 py-2 rounded-full text-xs font-medium transition-all duration-500 ${viewMode === 'after' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white'
                                            }`}
                                    >
                                        After
                                    </button>
                                </div>
                            )}

                            {/* Download (Only when result exists) */}
                            {resultSrc && (
                                <Button
                                    size="icon"
                                    className="h-12 w-12 rounded-full bg-white text-black hover:bg-white/90 shadow-lg"
                                    onClick={() => window.open(resultSrc, '_blank')}
                                >
                                    <Download className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
