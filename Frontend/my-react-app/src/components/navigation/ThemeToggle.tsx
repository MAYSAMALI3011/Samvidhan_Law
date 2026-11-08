import { ThemeToggle as CommonThemeToggle } from '../common/ThemeToggle'

export function ThemeToggle({ showSystemToggle = false }: { showSystemToggle?: boolean }) {
  return <CommonThemeToggle showSystemToggle={showSystemToggle} idPrefix="nav-theme" />
}
