'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { RefreshCw, Zap, ArrowLeft, Download, Camera as CameraIcon } from 'lucide-react'
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

    // View Mode for Toggle Switch
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
            setViewMode('before')
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
                setViewMode('after')
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

            {/* Header - Styled */}
            <div className="absolute top-0 left-0 right-0 z-20 p-8 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/dashboard')}
                    className="text-white hover:bg-white/10 pointer-events-auto rounded-full h-12 w-12 backdrop-blur-md border border-white/5"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                    <h1 className="text-2xl font-serif font-medium tracking-wide text-white drop-shadow-md">Quick Cam</h1>
                    <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-bold mt-1">AI Instant Analysis</p>
                </div>
                <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-8">

                {/* Background Ambient Styles */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

                {/* 1. Camera Feed Frame */}
                {!imageSrc && (
                    <div className="relative w-full h-full max-w-lg aspect-[9/16] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/50 backdrop-blur-sm">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/png"
                            videoConstraints={videoConstraints}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Custom Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="w-full h-full border-[20px] border-white/5 rounded-[2.5rem]" />
                            <div className="absolute top-1/2 left-0 w-full h-px bg-white/30" />
                            <div className="absolute left-1/2 top-0 w-px h-full bg-white/30" />
                        </div>
                    </div>
                )}

                {/* 2. Result View (Toggle) */}
                {imageSrc && (
                    <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-[9/16] max-h-[75vh] rounded-[2.5rem] overflow-hidden glass-card border-0 shadow-2xl animate-in zoom-in-95 duration-500 ring-1 ring-white/10">
                        {/* Image Display */}
                        <div className="absolute inset-0 bg-zinc-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={resultSrc && viewMode === 'after' ? resultSrc : imageSrc}
                                alt="Client"
                                className="w-full h-full object-cover"
                            />

                            {/* Loading State */}
                            {loading && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center z-10 animate-in fade-in duration-500">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-sky-500/30 blur-2xl rounded-full animate-pulse" />
                                        <RefreshCw className="h-10 w-10 text-white animate-spin relative z-10" />
                                    </div>
                                    <p className="text-white text-lg font-serif italic animate-pulse tracking-wide">Designing new look...</p>
                                </div>
                            )}

                            {/* Label Badge */}
                            <div className="absolute top-6 left-6 z-10">
                                <span className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-500 ${resultSrc && viewMode === 'after'
                                        ? "bg-emerald-500/90 text-white"
                                        : "bg-black/40 text-white"
                                    }`}>
                                    {resultSrc && viewMode === 'after' ? "After Aura" : "Original"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Toast */}
                {error && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/80 text-white px-6 py-3 rounded-full text-xs font-medium shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 z-50 border border-white/10">
                        {error}
                        <button onClick={() => setError(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
                    </div>
                )}
            </div>

            {/* Bottom Controls - Styled */}
            <div className="p-8 pb-12 w-full bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex flex-col items-center gap-8">

                {!imageSrc ? (
                    // Capture Button Premium
                    <button
                        onClick={capture}
                        className="group relative"
                    >
                        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full group-hover:bg-white/30 transition-all duration-500" />
                        <div className="h-24 w-24 rounded-full border-[8px] border-white/10 flex items-center justify-center relative z-10 shadow-2xl transition-transform duration-300 group-hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-md">
                            <div className="h-20 w-20 rounded-full bg-white group-hover:bg-gray-200 transition-colors duration-300 shadow-inner" />
                        </div>
                    </button>
                ) : (
                    // Action Buttons
                    <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-10 duration-500">

                        {/* Service Selection (Only if no result yet) */}
                        {!resultSrc && !loading && (
                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-sides justify-center px-4">
                                {services.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedService(s.name)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${selectedService === s.name
                                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-6 justify-center">
                            {/* Retake */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={retake}
                                className="h-14 w-14 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-transform hover:rotate-180 duration-500"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </Button>

                            {/* Main Action */}
                            {!resultSrc ? (
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!selectedService || loading}
                                    className="h-14 px-10 rounded-full bg-white text-black font-medium tracking-wide shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex-1 max-w-[240px]"
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    {loading ? 'ANALYZING...' : 'GENERATE'}
                                </Button>
                            ) : (
                                // Toggle Switch (Only when result exists)
                                <div className="bg-white/10 p-1.5 rounded-full flex border border-white/10 backdrop-blur-xl shadow-2xl">
                                    <button
                                        onClick={() => setViewMode('before')}
                                        className={`px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-500 ${viewMode === 'before' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'
                                            }`}
                                    >
                                        Before
                                    </button>
                                    <button
                                        onClick={() => setViewMode('after')}
                                        className={`px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-500 ${viewMode === 'after' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white'
                                            }`}
                                    >
                                        After
                                    </button>
                                </div>
                            )}

                            {/* Download */}
                            {resultSrc && (
                                <Button
                                    size="icon"
                                    className="h-14 w-14 rounded-full bg-white/10 text-white hover:bg-white hover:text-black border border-white/10 backdrop-blur-sm transition-all shadow-lg"
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
