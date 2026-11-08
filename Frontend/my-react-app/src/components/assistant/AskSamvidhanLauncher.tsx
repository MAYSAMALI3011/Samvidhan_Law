import { useState, useEffect } from 'react'
import { ChatLauncher } from '../chatbot/ChatLauncher'
import { AskSamvidhanModal } from './AskSamvidhanModal'
import '../chatbot/chatbot.tokens.css'

export function AskSamvidhanLauncher() {
  const [isOpen, setIsOpen] = useState(false)

  // Listen to custom global event dispatched from sidebar or navbar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('samvidhan:open-chat', handleOpen)
    return () => window.removeEventListener('samvidhan:open-chat', handleOpen)
  }, [])

  return (
    <>
      <ChatLauncher isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} />
      <AskSamvidhanModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
