import { AlertCircle, Check } from 'lucide-react'
import { calculatePasswordStrength } from './useSmartValidation'
import './forms.css'

export interface ValidatedFieldProps {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'textarea'
  value: string
  onChange: (val: string) => void
  onBlur?: () => void
  error?: string
  touched?: boolean
  emailSuggestion?: string
  onAcceptEmailSuggestion?: (suggested: string) => void
  placeholder?: string
  required?: boolean
  autoComplete?: string
  helperText?: string
  showPasswordStrength?: boolean
}

export function ValidatedField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  emailSuggestion,
  onAcceptEmailSuggestion,
  placeholder,
  required,
  autoComplete,
  helperText,
  showPasswordStrength,
}: ValidatedFieldProps) {
  const isInvalid = Boolean(touched && error)
  const isValid = Boolean(touched && !error && value.trim())
  const strength = showPasswordStrength && type === 'password' ? calculatePasswordStrength(value) : null

  return (
    <div className={`validated-field-group ${isInvalid ? 'has-error' : ''} ${isValid ? 'is-valid' : ''}`}>
      <label htmlFor={id} className="field-label">
        <span>{label}</span>
        {required && <span className="field-required">*</span>}
      </label>

      <div className="field-input-wrapper">
        {type === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            aria-invalid={isInvalid}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-desc` : undefined}
            className="field-input field-textarea"
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-invalid={isInvalid}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-desc` : undefined}
            className="field-input"
          />
        )}

        {isInvalid && (
          <div className="field-status-icon error-icon" aria-hidden="true">
            <AlertCircle size={16} />
          </div>
        )}
        {isValid && (
          <div className="field-status-icon valid-icon" aria-hidden="true">
            <Check size={16} />
          </div>
        )}
      </div>

      {/* Email Typo Suggestion Pill */}
      {emailSuggestion && onAcceptEmailSuggestion && (
        <div className="email-suggestion-box" role="status">
          <span>Did you mean <strong>{emailSuggestion}</strong>?</span>
          <button
            type="button"
            className="email-suggestion-btn"
            onClick={() => onAcceptEmailSuggestion(emailSuggestion)}
          >
            Apply
          </button>
        </div>
      )}

      {/* Password Strength Meter */}
      {strength && value.length > 0 && (
        <div className="password-strength-container" aria-live="polite">
          <div className="strength-bars">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`strength-bar-segment ${idx <= strength.score - 1 ? 'is-active' : ''}`}
                style={{
                  backgroundColor: idx <= strength.score - 1 ? strength.color : undefined,
                }}
              />
            ))}
          </div>
          <span className="strength-label" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      )}

      {/* Error Message */}
      {isInvalid && (
        <p id={`${id}-error`} className="field-error-message" role="alert">
          {error}
        </p>
      )}

      {/* Helper text */}
      {!isInvalid && helperText && (
        <p id={`${id}-desc`} className="field-helper-text">
          {helperText}
        </p>
      )}
    </div>
  )
}
