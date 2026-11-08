import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/useTheme'
import './theme-toggle.css'

interface ThemeToggleProps {
  showSystemToggle?: boolean
  className?: string
  idPrefix?: string
}

export function ThemeToggle({
  showSystemToggle = false,
  className = '',
  idPrefix = 'theme-toggle',
}: ThemeToggleProps) {
  const { themeMode, setThemeMode, activeTheme, toggleTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  const isSystem = themeMode === 'system'
  const switchId = `${idPrefix}-input`
  const systemId = `${idPrefix}-system`

  const handleSwitchChange = () => {
    if (isSystem) {
      // If currently following system, toggling manually switches to explicit opposite mode
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark'
      setThemeMode(nextTheme)
    } else {
      toggleTheme()
    }
  }

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setThemeMode('system')
    } else {
      setThemeMode(activeTheme)
    }
  }

  return (
    <div className={`samvidhan-theme-switch-group ${className}`}>
      <div className="theme-switch-row">
        {/* Sun Icon (Left) */}
        <Sun
          size={16}
          className={`theme-icon sun-icon ${!isDark ? 'is-active' : ''}`}
          aria-hidden="true"
        />

        {/* Uiverse Switch (gharsh11032000 adapted with Brand Gold) */}
        <label
          className={`switch ${isSystem ? 'is-system-controlled' : ''}`}
          htmlFor={switchId}
          title={isSystem ? 'Follows system theme (uncheck below to lock)' : isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <input
            id={switchId}
            type="checkbox"
            checked={isDark}
            onChange={handleSwitchChange}
            aria-label="Toggle dark mode"
          />
          <span className="slider" />
        </label>

        {/* Moon Icon (Right) */}
        <Moon
          size={16}
          className={`theme-icon moon-icon ${isDark ? 'is-active' : ''}`}
          aria-hidden="true"
        />
      </div>

      {/* Follow System Theme Switch / Checkbox (for Settings page) */}
      {showSystemToggle && (
        <label className="follow-system-label" htmlFor={systemId}>
          <input
            id={systemId}
            type="checkbox"
            checked={isSystem}
            onChange={handleSystemChange}
            className="follow-system-checkbox"
          />
          <span className="follow-system-text">Follow system theme</span>
          <span className="follow-system-hint">
            ({isSystem ? `Auto: ${activeTheme}` : 'Manual override active'})
          </span>
        </label>
      )}
    </div>
  )
}
