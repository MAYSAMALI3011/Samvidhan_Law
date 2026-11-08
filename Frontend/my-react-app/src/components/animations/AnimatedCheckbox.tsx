import React, { useId } from 'react'

interface AnimatedCheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  ariaLabel?: string
  disabled?: boolean
}

export function AnimatedCheckbox({
  id,
  checked,
  onChange,
  label,
  ariaLabel,
  disabled = false,
}: AnimatedCheckboxProps) {
  const autoId = useId()
  const checkboxId = id || autoId

  return (
    <label htmlFor={checkboxId} className={`animated-checkbox-label ${disabled ? 'is-disabled' : ''}`}>
      <span className="animated-checkbox-container">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={ariaLabel}
          className="animated-checkbox-input"
        />
        <span className={`animated-checkbox-box ${checked ? 'is-checked' : ''}`}>
          <svg
            className="animated-checkbox-svg"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animated-checkbox-checkmark"
            />
          </svg>
        </span>
      </span>
      {label && <span className="animated-checkbox-text">{label}</span>}
    </label>
  )
}
