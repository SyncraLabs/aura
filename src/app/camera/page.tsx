'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { Camera, RefreshCw, Zap, ArrowLeft, Download, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import Image from 'next/image' // Using standard img for stability with external URLs
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
    const [isDragging, setIsDragging] = useState(false)
    const [compareMode, setCompareMode] = useState<'split' | 'overlay'>('split')
    const [sliderPosition, setSliderPosition] = useState(50)
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchServices = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Fetch clinic services to populate the quick-select menu
            const { data: clinic } = await supabase.from('clinics').select('id, services').eq('owner_id', user.id).single()
            if (clinic && clinic.services) {
                setServices(clinic.services.map((s: string) => ({ name: s })))
            }
        }
        fetchServices()
    }, [router])

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            setImageSrc(imageSrc)
        }
    }, [webcamRef])

    const retake = () => {
        setImageSrc(null)
        setResultSrc(null)
        setSelectedService(null)
        setError(null)
    }

    const handleGenerate = async () => {
        if (!imageSrc || !selectedService) return

        setLoading(true)
        setError(null)

        try {
            console.log("Starting generation for service:", selectedService)

            // Convert Base64 to Blob
            const res = await fetch(imageSrc)
            const blob = await res.blob()
            const file = new File([blob], "camera-capture.png", { type: "image/png" })

            const formData = new FormData()
            formData.append('image', file)
            formData.append('service', selectedService)

            console.log("Sending FormData to server action...")

            // Reuse the server action
            const result = await generateTransformation(formData)
            console.log("Server action result:", result)

            if (result.success && result.imageUrl) {
                console.log("Setting Result Src:", result.imageUrl)
                // Force a cache-busting param if needed, or just set raw
                setResultSrc(result.imageUrl)
            } else {
                console.error("Generation logic failed:", result.error)
                setError(result.error || "Generation failed - No URL returned")
            }
        } catch (e: any) {
            console.error("Client Action Exception:", e)
            setError(e.message || "An unexpected error occurred during generation")
        } finally {
            setLoading(false)
        }
    }

    const videoConstraints = {
        facingMode: "user"
    };

    const handleStart = (clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const percent = (x / rect.width) * 100
        setSliderPosition(percent)
        setIsDragging(true)
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        handleStart(e.clientX)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        const percent = (x / rect.width) * 100
        setSliderPosition(percent)
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        setIsDragging(false)
    }

    return (
        <div className="min-h-[100dvh] bg-black text-white relative flex flex-col overflow-hidden">
            {/* Header / Nav */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="text-white hover:bg-white/10 pointer-events-auto">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="text-center">
                    <h1 className="text-sm font-medium tracking-widest uppercase text-white/80 font-serif italic">Quick Cam</h1>
                    <button
                        onClick={() => {
                            // TEST MODE: Load fake images
                            setImageSrc("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop")
                            setResultSrc("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop")
                        }}
                        className="pointer-events-auto text-[10px] text-red-500 bg-white/10 px-2 py-1 rounded mt-1 hover:bg-white/20"
                    >
                        DEBUG: LOAD TEST IMAGES
                    </button>
                    {imageSrc && <p className="text-[10px] text-green-500">Src Len: {imageSrc.length}</p>}
                </div>
                <div className="w-6" />
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center bg-black">

                {/* 1. Camera View */}
                {!imageSrc && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/png"
                        videoConstraints={videoConstraints}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* 2. Captured Preview */}
                {imageSrc && !resultSrc && (
                    <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />

                        {loading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-30 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                    <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                                </div>
                                <p className="text-white/80 font-serif italic mt-4 animate-pulse">Designing new look...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Result View (Comparison) */}
                {resultSrc && imageSrc && (
                    <div
                        ref={containerRef}
                        className="relative w-full h-full cursor-col-resize select-none touch-none bg-zinc-900" // Added dark bg
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onDragStart={(e) => e.preventDefault()}
                    >
                        {/* Background (After) */}
                        <div className="absolute inset-0 w-full h-full z-0 bg-blue-900/20"> {/* Debug BG */}
                            {/* Switched to standard img to avoid next/image whitelist issues causing black screen */}
                            <img
                                src={resultSrc}
                                alt="After"
                                className="w-full h-full object-contain pointer-events-none select-none block" // Changed to object-contain to ensuring no cropping issues hide the image
                                draggable={false}
                                onError={(e) => {
                                    console.error("Result image failed to load:", resultSrc);
                                    e.currentTarget.style.border = "4px solid red"; // Thicker border
                                    e.currentTarget.style.backgroundColor = "rgba(255,0,0,0.1)";
                                }}
                            />
                            <div className="absolute top-20 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">After</span>
                            </div>
                        </div>

                        {/* Foreground (Before) - Clipped */}
                        <div
                            className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 pointer-events-none bg-emerald-900/20" // Debug BG
                            style={{ width: `${sliderPosition}%` }}
                        >
                            {/* Use percentage inverse to keep image static while clipping parent */}
                            <div className="relative h-full" style={{ width: sliderPosition > 0 ? `${100 / (sliderPosition / 100)}%` : '100vw' }}>
                                <img
                                    src={imageSrc}
                                    alt="Before"
                                    className="w-full h-full object-contain pointer-events-none select-none block" // Changed to object-contain
                                    draggable={false}
                                />
                            </div>
                            <div className="absolute top-20 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-[10px] uppercase tracking-widest text-white/80">Before</span>
                            </div>
                        </div>

                        {/* Slider Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white/0 cursor-col-resize z-20 flex items-center justify-center pointer-events-none"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xl border border-white/50 shadow-2xl flex items-center justify-center transform transition-transform">
                                <div className="w-1 h-4 bg-white/80 rounded mx-[1px]" />
                                <div className="w-1 h-4 bg-white/80 rounded mx-[1px]" />
                            </div>
                        </div>

                        {/* Download FAB */}
                        <div className="absolute bottom-32 right-6 z-30 pointer-events-auto">
                            <Button
                                size="icon"
                                className="rounded-full h-14 w-14 shadow-2xl bg-white text-black hover:bg-white/90 transition-transform hover:scale-105"
                                onClick={(e) => { e.stopPropagation(); window.open(resultSrc, '_blank'); }}
                            >
                                <Download className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="absolute top-24 left-4 right-4 p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl text-white text-center z-40">
                        <p className="text-sm font-medium">{error}</p>
                        <Button variant="link" onClick={() => setError(null)} className="text-white/60 text-xs mt-1">Dismiss</Button>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-8 bg-black/80 backdrop-blur-xl border-t border-white/5 z-20 pb-12">
                {!imageSrc && (
                    <div className="flex justify-center items-center">
                        <Button
                            onClick={capture}
                            className="h-20 w-20 rounded-full border-[6px] border-white/20 bg-transparent relative flex items-center justify-center transition-all hover:border-primary/50 group"
                        >
                            <div className="h-16 w-16 bg-white rounded-full group-active:scale-90 transition-transform" />
                        </Button>
                    </div>
                )}

                {imageSrc && !resultSrc && !loading && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5">
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-4 px-4 mask-fade-sides">
                            {services.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedService(s.name)}
                                    className={`
                                        flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all snap-start border backdrop-blur-md
                                        ${selectedService === s.name
                                            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}
                                    `}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={retake} className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl text-xs uppercase tracking-widest">
                                Retake
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                disabled={!selectedService}
                                className="flex-[2] bg-white text-black hover:bg-gray-200 font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:shadow-none text-xs uppercase tracking-widest transition-all"
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Generate
                            </Button>
                        </div>
                    </div>
                )}

                {resultSrc && (
                    <div className="flex gap-4 animate-in slide-in-from-bottom-5">
                        <Button variant="outline" onClick={retake} className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl text-xs uppercase tracking-widest backdrop-blur-md">
                            New Client
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
