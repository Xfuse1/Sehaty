"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, Trash2, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string) => void
  maxDuration?: number // بالثواني
  className?: string
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  maxDuration = 300, // 5 دقائق افتراضي
  className = "" 
}: VoiceRecorderProps) {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // تنظيف عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      stopAllStreams()
    }
  }, [audioUrl])

  // إيقاف جميع التدفقات الصوتية
  const stopAllStreams = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  // بدء التسجيل
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        
        setAudioBlob(audioBlob)
        setAudioUrl(url)
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, url)
        }
        
        stopAllStreams()
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      
      // بدء المؤقت
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          
          // إيقاف التسجيل عند الوصول للحد الأقصى
          if (newTime >= maxDuration) {
            stopRecording()
            toast({
              title: "تم إيقاف التسجيل",
              description: `تم الوصول للحد الأقصى ${formatTime(maxDuration)}`,
            })
          }
          
          return newTime
        })
      }, 1000)

      toast({
        title: "بدأ التسجيل",
        description: "جاري تسجيل رسالتك الصوتية",
      })
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        variant: "destructive",
        title: "خطأ في الوصول للميكروفون",
        description: "الرجاء السماح بالوصول للميكروفون من إعدادات المتصفح",
      })
    }
  }

  // إيقاف التسجيل مؤقتاً
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  // استئناف التسجيل
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // استئناف المؤقت
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  // إيقاف التسجيل نهائياً
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  // تشغيل التسجيل
  const playRecording = () => {
    if (audioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.play()
      setIsPlaying(true)
    }
  }

  // إيقاف التشغيل مؤقتاً
  const pausePlaying = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      setIsPlaying(false)
    }
  }

  // حذف التسجيل
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    
    setAudioUrl(null)
    setAudioBlob(null)
    setRecordingTime(0)
    setIsPlaying(false)
    audioChunksRef.current = []
  }

  // تنزيل التسجيل
  const downloadRecording = () => {
    if (audioUrl && audioBlob) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = `voice-message-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      toast({
        title: "تم التنزيل",
        description: "تم تنزيل التسجيل الصوتي",
      })
    }
  }

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* مشغل الصوت المخفي */}
      {audioUrl && (
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* المؤقت */}
      <div className="flex items-center justify-center">
        <div className="text-2xl font-mono font-bold text-primary">
          {formatTime(recordingTime)}
        </div>
        {maxDuration && (
          <span className="text-sm text-muted-foreground mr-2">
            / {formatTime(maxDuration)}
          </span>
        )}
      </div>

      {/* أزرار التحكم */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {!isRecording && !audioUrl && (
          <Button
            onClick={startRecording}
            size="lg"
            className="gap-2"
          >
            <Mic className="w-5 h-5" />
            ابدأ التسجيل
          </Button>
        )}

        {isRecording && (
          <>
            {!isPaused ? (
              <Button
                onClick={pauseRecording}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Pause className="w-5 h-5" />
                إيقاف مؤقت
              </Button>
            ) : (
              <Button
                onClick={resumeRecording}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Play className="w-5 h-5" />
                متابعة
              </Button>
            )}
            
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <Square className="w-5 h-5" />
              إيقاف
            </Button>
          </>
        )}

        {audioUrl && !isRecording && (
          <>
            {!isPlaying ? (
              <Button
                onClick={playRecording}
                size="lg"
                className="gap-2"
              >
                <Play className="w-5 h-5" />
                تشغيل
              </Button>
            ) : (
              <Button
                onClick={pausePlaying}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Pause className="w-5 h-5" />
                إيقاف مؤقت
              </Button>
            )}
            
            <Button
              onClick={downloadRecording}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Download className="w-5 h-5" />
              تنزيل
            </Button>
            
            <Button
              onClick={deleteRecording}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <Trash2 className="w-5 h-5" />
              حذف
            </Button>
            
            <Button
              onClick={startRecording}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Mic className="w-5 h-5" />
              تسجيل جديد
            </Button>
          </>
        )}
      </div>

      {/* شريط التقدم للتشغيل */}
      {audioUrl && (
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-primary transition-all ${isPlaying ? 'animate-pulse' : ''}`}
            style={{ 
              width: audioPlayerRef.current 
                ? `${(audioPlayerRef.current.currentTime / audioPlayerRef.current.duration) * 100}%` 
                : '0%' 
            }}
          />
        </div>
      )}

      {/* معلومات التسجيل */}
      {audioBlob && (
        <div className="text-sm text-center text-muted-foreground">
          حجم الملف: {(audioBlob.size / 1024).toFixed(2)} كيلوبايت
        </div>
      )}
    </div>
  )
}
