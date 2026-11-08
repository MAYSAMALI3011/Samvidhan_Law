import { useState, useEffect } from 'react'
import type { MorMood } from './Mor'

export interface MorMessage {
  id: string
  text: string
  mood?: MorMood
  durationMs?: number
  sessionKey?: string // If provided, shows at most once per browser session
}

type Listener = (current: MorMessage | null) => void

class MorQueueManager {
  private queue: MorMessage[] = []
  private current: MorMessage | null = null
  private listeners: Set<Listener> = new Set()
  private timer: number | null = null

  public say(msg: MorMessage) {
    // Check if session-capped
    if (msg.sessionKey && typeof window !== 'undefined') {
      const storageKey = `samvidhan_mor_session_${msg.sessionKey}`
      if (sessionStorage.getItem(storageKey)) {
        return // Already shown in this session
      }
      sessionStorage.setItem(storageKey, 'true')
    }

    // If another message with same id is already queued, don't duplicate
    if (this.current?.id === msg.id || this.queue.some((m) => m.id === msg.id)) {
      return
    }

    this.queue.push(msg)
    if (!this.current) {
      this.next()
    }
  }

  public dismiss() {
    if (this.timer) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    this.current = null
    this.notify()
    if (this.queue.length > 0) {
      // Small pause before next message
      window.setTimeout(() => this.next(), 300)
    }
  }

  private next() {
    if (this.queue.length === 0) {
      this.current = null
      this.notify()
      return
    }

    this.current = this.queue.shift() || null
    this.notify()

    const duration = this.current?.durationMs ?? 6000
    if (duration > 0 && typeof window !== 'undefined') {
      this.timer = window.setTimeout(() => {
        this.dismiss()
      }, duration)
    }
  }

  public getCurrent(): MorMessage | null {
    return this.current
  }

  public subscribe(fn: Listener) {
    this.listeners.add(fn)
    fn(this.current)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.current))
  }
}

export const morQueue = new MorQueueManager()

export function useMorMessage() {
  const [current, setCurrent] = useState<MorMessage | null>(() => morQueue.getCurrent())

  useEffect(() => {
    return morQueue.subscribe(setCurrent)
  }, [])

  return {
    current,
    dismiss: () => morQueue.dismiss(),
  }
}
