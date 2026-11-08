// Web Audio API synthesized sound generator for Duolingo-style gamification
// Zero external assets required, zero latency, runs offline.

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export type SoundEffectType = 'correct' | 'wrong' | 'complete' | 'pop' | 'chest' | 'combo'

export function playSoundEffect(type: SoundEffectType) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    if (type === 'correct') {
      const freqs = [523.25, 659.25, 783.99]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)

        gain.gain.setValueAtTime(0, now + idx * 0.08)
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.45)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.5)
      })
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.28)

      gain.gain.setValueAtTime(0.14, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.32)
    } else if (type === 'complete') {
      const notes = [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.12 },
        { f: 783.99, t: 0.24 },
        { f: 1046.5, t: 0.38 },
      ]
      notes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(f, now + t)

        gain.gain.setValueAtTime(0, now + t)
        gain.gain.linearRampToValueAtTime(0.2, now + t + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.6)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + t)
        osc.stop(now + t + 0.65)
      })
    } else if (type === 'pop') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(750, now)
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.07)

      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.09)
    } else if (type === 'chest') {
      // Shimmering treasure chest reward sound
      const notes = [440, 554.37, 659.25, 880, 1108.73]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.06)

        gain.gain.setValueAtTime(0, now + idx * 0.06)
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.06 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.06)
        osc.stop(now + idx * 0.06 + 0.55)
      })
    } else if (type === 'combo') {
      // Rapid ascending combo sound
      const freqs = [600, 750, 900]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.05)

        gain.gain.setValueAtTime(0.12, now + idx * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.05)
        osc.stop(now + idx * 0.05 + 0.22)
      })
    }
  } catch {
    // Graceful fallback
  }
}
