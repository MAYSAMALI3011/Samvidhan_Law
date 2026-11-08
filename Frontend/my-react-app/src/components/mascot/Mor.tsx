import React, { useEffect, useContext } from 'react'
import { AppStateContext } from '../../context/AppState'
import { useMorMessage, morQueue } from './morQueue'
import {
  resolveMorMood,
  getMorAriaLabel,
  shouldRenderMor,
  getMorWrapperClasses,
} from './morLogic'
import './mor.css'

import morWave from '../../assets/mor/mor_wave.png'
import morReading from '../../assets/mor/mor_reading.png'
import morCelebrate from '../../assets/mor/mor_celebrate.png'
import morThinking from '../../assets/mor/mor_thinking.png'
import morEncourage from '../../assets/mor/mor_encourage.png'
import morSleepy from '../../assets/mor/mor_sleepy.png'
import morIdle from '../../assets/mor/mor_idle.png'

export type MorMood =
  | 'wave'
  | 'reading'
  | 'celebrate'
  | 'thinking'
  | 'encourage'
  | 'sleepy'
  | 'idle'
  // Backward compatibility aliases:
  | 'standing'
  | 'waving'
  | 'celebrating'
  | 'encouraging'
  | 'head-only'

export type MorSize = 'sm' | 'md' | 'lg' | number

export interface MorProps {
  mood?: MorMood
  size?: MorSize
  animate?: boolean
  enabled?: boolean
  className?: string
  style?: React.CSSProperties
  decorative?: boolean
  'aria-label'?: string
  onClick?: () => void
  showBubble?: boolean
  bubbleText?: string
}

const SIZE_MAP: Record<'sm' | 'md' | 'lg', number> = {
  sm: 44,
  md: 84,
  lg: 144,
}

const MOOD_IMAGES: Record<string, string> = {
  wave: morWave,
  waving: morWave,
  reading: morReading,
  celebrate: morCelebrate,
  celebrating: morCelebrate,
  thinking: morThinking,
  encourage: morEncourage,
  encouraging: morEncourage,
  sleepy: morSleepy,
  idle: morIdle,
  standing: morIdle,
  'head-only': morIdle,
}

export function Mor({
  mood = 'idle',
  size = 'md',
  animate = true,
  enabled,
  className = '',
  style = {},
  decorative = false,
  'aria-label': customAriaLabel,
  onClick,
  showBubble = false,
  bubbleText,
}: MorProps) {
  const state = useContext(AppStateContext)
  const settingsEnabled = state?.progress?.mascotEnabled

  // Honor Settings toggle: "Show guide character" (progress.mascotEnabled)
  if (!shouldRenderMor(settingsEnabled, enabled)) {
    return null
  }

  // Canonical mood mapping
  const canonicalMood = resolveMorMood(mood)
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 84

  // Accessibility label
  const accessibleLabel = getMorAriaLabel(mood, decorative, customAriaLabel)
  const wrapperClasses = getMorWrapperClasses(mood, animate, className)
  const imageSrc = MOOD_IMAGES[mood] || MOOD_IMAGES[canonicalMood] || morIdle
  const isHeadOnly = mood === 'head-only'

  return (
    <div
      className={wrapperClasses}
      style={{
        width: pixelSize,
        height: pixelSize,
        ...style,
      }}
      role={decorative ? undefined : 'img'}
      aria-label={accessibleLabel}
      aria-hidden={decorative ? true : undefined}
      onClick={onClick}
    >
      <div
        className={`mor-img-container ${isHeadOnly ? 'mor-head-crop' : ''}`}
        style={{
          width: pixelSize,
          height: pixelSize,
        }}
      >
        <img
          src={imageSrc}
          alt={accessibleLabel || 'Mor the peacock mascot'}
          className="mor-character-img"
          width={pixelSize}
          height={pixelSize}
          loading="lazy"
          draggable={false}
        />
      </div>

      {/* Floating speech bubble */}
      {showBubble && bubbleText && (
        <div className="mor-inline-speech-bubble" role="tooltip" aria-live="polite">
          <p className="mor-speech-bubble-text">{bubbleText}</p>
          <div className="mor-speech-bubble-arrow" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

/**
 * <MorSays> Speech-Bubble Helper
 * Integrates with morQueue to show only one bubble at a time,
 * and honors sessionKey to never auto-open more than once per browser session.
 */
export interface MorSaysProps {
  message?: string
  mood?: MorMood
  size?: MorSize
  sessionKey?: string
  durationMs?: number
  className?: string
}

export function MorSays({
  message,
  mood = 'idle',
  size = 'md',
  sessionKey,
  durationMs = 6000,
  className = '',
}: MorSaysProps) {
  const { current, dismiss } = useMorMessage()

  useEffect(() => {
    if (message && sessionKey) {
      morQueue.say({
        id: `morsays-${sessionKey}`,
        text: message,
        mood,
        sessionKey,
        durationMs,
      })
    }
  }, [message, sessionKey, mood, durationMs])

  const activeMessage = message || current?.text
  const activeMood = (current?.mood || mood) as MorMood

  if (!activeMessage) {
    return <Mor mood={activeMood} size={size} className={className} />
  }

  return (
    <div className={`mor-says-container ${className}`} style={{ position: 'relative', display: 'inline-flex' }}>
      <Mor mood={activeMood} size={size} showBubble={true} bubbleText={activeMessage} />
      <button
        type="button"
        className="mor-speech-bubble-dismiss"
        onClick={() => dismiss()}
        aria-label="Dismiss guide message"
      >
        ×
      </button>
    </div>
  )
}

// Backward-compatible alias
export const MorMascot = Mor
export type MorMascotProps = MorProps
