export interface ShortcutItem {
  keys: string[]
  altKeys?: string[]
  description: string
}

export const shortcutItems: ShortcutItem[] = [
  { keys: ['?'], description: 'Open keyboard shortcuts help' },
  { keys: ['Ctrl', 'K'], altKeys: ['/'], description: 'Open Command Palette / Search' },
  { keys: ['G', 'D'], description: 'Go to Dashboard' },
  { keys: ['G', 'C'], description: 'Go to Curriculum & Courses' },
  { keys: ['G', 'B'], description: 'Go to Bookmarks' },
  { keys: ['B'], description: 'Toggle bookmark on active lesson' },
  { keys: ['T'], description: 'Toggle Theme (Light / Dark)' },
  { keys: ['Esc'], description: 'Close active modal / dialog' },
]
