import { SearchPalette } from '../../components/navigation/SearchPalette'

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onAskSamvidhan?: (query: string) => void
}

/**
 * Command Palette (Pattern 3):
 * Quick global launcher via Cmd/Ctrl+K.
 * Fuzzy searches lessons, articles, acts, case law, quick actions, and settings.
 */
export function CommandPalette({ isOpen, onClose, onAskSamvidhan }: CommandPaletteProps) {
  return (
    <SearchPalette
      isOpen={isOpen}
      onClose={onClose}
      onAskSamvidhan={onAskSamvidhan}
    />
  )
}

export { SearchPalette }
