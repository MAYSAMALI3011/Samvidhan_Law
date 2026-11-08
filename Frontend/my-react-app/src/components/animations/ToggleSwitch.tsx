import React, { useId } from 'react'

interface ToggleSwitchProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  ariaLabel?: string
  disabled?: boolean
  description?: string
}

export function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  ariaLabel,
  disabled = false,
  description,
}: ToggleSwitchProps) {
  const autoId = useId()
  const switchId = id || autoId

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!disabled) onChange(!checked)
    }
  }

  return (
    <div className="toggle-switch-wrapper">
      <div className="toggle-switch-text-group">
        {label && (
          <label htmlFor={switchId} className="toggle-switch-label">
            {label}
          </label>
        )}
        {description && <p className="toggle-switch-desc">{description}</p>}
      </div>

      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`toggle-switch-track ${checked ? 'is-checked' : ''} ${disabled ? 'is-disabled' : ''}`}
      >
        <span className="toggle-switch-thumb" />
      </button>
    </div>
  )
}
