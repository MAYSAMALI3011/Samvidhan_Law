import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export interface ListenButtonProps {
  textToRead: string
  className?: string
}

export function ListenButton({ textToRead, className = '' }: ListenButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    // Stop speech when text changes or on unmount
    if (isSupported) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [textToRead, isSupported])

  const togglePlayback = () => {
    if (!isSupported) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(textToRead)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  if (!isSupported) return null

  return (
    <button
      type="button"
      className={`lesson-utility-btn listen-btn ${isSpeaking ? 'is-speaking' : ''} ${className}`}
      onClick={togglePlayback}
      aria-label={isSpeaking ? 'Stop reading card aloud' : 'Read card aloud with speech'}
      title={isSpeaking ? 'Stop listening' : 'Listen to this lesson card'}
    >
      {isSpeaking ? (
        <>
          <VolumeX size={15} aria-hidden="true" />
          <span>Stop</span>
          <span className="speech-pulse-indicator" aria-hidden="true">
            <span className="wave-bar bar-1" />
            <span className="wave-bar bar-2" />
            <span className="wave-bar bar-3" />
          </span>
        </>
      ) : (
        <>
          <Volume2 size={15} aria-hidden="true" />
          <span>Listen</span>
        </>
      )}
    </button>
  )
}
