import { useState, useRef, useCallback } from 'react'
import { streamChat } from '../../../api/services/assistantService'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: { label: string; url: string; summary: string }[]
  followUps?: string[]
  isStreaming?: boolean
  isThinking?: boolean
  isStopped?: boolean
  error?: string
}

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const conversationIdRef = useRef<string | undefined>(undefined)

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsGenerating(false)
    setMessages((prev) => {
      const copy = [...prev]
      const last = copy[copy.length - 1]
      if (last && last.role === 'assistant' && last.isStreaming) {
        last.isStreaming = false
        last.isStopped = true
      }
      return copy
    })
  }, [])

  const sendMessage = useCallback(async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return

    const userMsgId = 'u-' + Date.now()
    const assistantMsgId = 'a-' + Date.now()

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: promptText.trim(),
    }

    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isThinking: true,
      isStreaming: true,
      citations: [],
      followUps: [],
    }

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
    setIsGenerating(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // Simulate brief thinking period (600ms)
      await new Promise((resolve) => setTimeout(resolve, 600))
      if (controller.signal.aborted) return

      // Transition thinking to streaming
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isThinking: false } : m))
      )

      // Consume mock or real SSE stream
      const stream = streamChat(promptText, {
        signal: controller.signal,
        conversationId: conversationIdRef.current,
      })

      for await (const chunk of stream) {
        if (controller.signal.aborted) break

        if (chunk.conversationId) {
          conversationIdRef.current = chunk.conversationId
        }

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantMsgId) return m
            return {
              ...m,
              content: chunk.token ? m.content + chunk.token : m.content,
              citations: chunk.citation
                ? [...(m.citations || []), chunk.citation]
                : m.citations,
              followUps: chunk.followUps ? chunk.followUps : m.followUps,
              isStreaming: !chunk.done,
            }
          })
        )
      }
    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        const message =
          err instanceof Error && err.message?.trim()
            ? err.message.trim()
            : typeof err === 'object' &&
                err !== null &&
                'message' in err &&
                typeof (err as { message: unknown }).message === 'string' &&
                (err as { message: string }).message.trim()
              ? (err as { message: string }).message.trim()
              : 'Connection lost. Please retry your query.'

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  error: message,
                }
              : m
          )
        )
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false, isThinking: false } : m
        )
      )
    }
  }, [isGenerating])

  const clearChat = useCallback(() => {
    stopGeneration()
    conversationIdRef.current = undefined
    setMessages([])
  }, [stopGeneration])

  return {
    messages,
    isGenerating,
    sendMessage,
    stopGeneration,
    clearChat,
  }
}
