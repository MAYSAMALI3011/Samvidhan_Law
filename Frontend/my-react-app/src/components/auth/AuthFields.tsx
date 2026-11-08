import { useState, useId, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Check, AlertCircle, type LucideIcon } from 'lucide-react'
import { detectEmailTypo } from '../../ui/forms/useSmartValidation'
import '../../ui/forms/forms.css'

// --- 1. Standard Stacked Input Field ---
export interface InputFieldProps {
  label: string
  id?: string
  name: string
  type?: string
  placeholder?: string
  value: string
  onChange: (val: string) => void
  onBlur?: () => void
  error?: string
  icon?: LucideIcon
  required?: boolean
  autoFocus?: boolean
  autoComplete?: string
  inputRef?: React.Ref<HTMLInputElement>
}

export function InputField({
  label,
  id: customId,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  required,
  autoFocus,
  autoComplete,
  inputRef,
}: InputFieldProps) {
  const autoId = useId()
  const fieldId = customId || autoId
  const errorId = `${fieldId}-error`

  return (
    <div className="auth-field-group">
      <label htmlFor={fieldId} className="auth-field-label">
        <span>{label}</span>
        {required && <span className="auth-required-mark" aria-hidden="true">*</span>}
      </label>

      <div className={`auth-input-wrapper ${error ? 'has-error' : ''} ${value ? 'has-value' : ''}`}>
        {Icon && (
          <span className="auth-input-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        )}
        <input
          ref={inputRef}
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="auth-input-control"
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -4, x: 0 }}
            animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24 }}
            className="auth-field-error"
          >
            <AlertCircle size={14} aria-hidden="true" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pattern 9: Common Email Typo Suggestion */}
      {type === 'email' && value && (
        (() => {
          const suggestion = detectEmailTypo(value)
          if (!suggestion || suggestion === value) return null
          return (
            <div className="email-suggestion-box" role="status">
              <span>Did you mean <strong>{suggestion}</strong>?</span>
              <button
                type="button"
                className="email-suggestion-btn"
                onClick={() => onChange(suggestion)}
              >
                Apply
              </button>
            </div>
          )
        })()
      )}
    </div>
  )
}

// --- 2. Password Field with Live Strength Meter ---
export interface PasswordFieldProps {
  label: string
  id?: string
  name: string
  placeholder?: string
  value: string
  onChange: (val: string) => void
  onBlur?: () => void
  error?: string
  icon?: LucideIcon
  required?: boolean
  autoFocus?: boolean
  autoComplete?: string
  showStrength?: boolean
  inputRef?: React.Ref<HTMLInputElement>
}

export function PasswordField({
  label,
  id: customId,
  name,
  placeholder = 'Password',
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  required,
  autoFocus,
  autoComplete = 'current-password',
  showStrength = false,
  inputRef,
}: PasswordFieldProps) {
  const autoId = useId()
  const fieldId = customId || autoId
  const errorId = `${fieldId}-error`
  const [showPassword, setShowPassword] = useState(false)

  // Password strength calculation
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' }
    let score = 0
    if (pass.length >= 8) score += 1
    if (pass.length >= 12) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#ef4444' }
      case 2:
        return { score: 2, label: 'Fair', color: '#f59e0b' }
      case 3:
        return { score: 3, label: 'Good', color: '#3b82f6' }
      case 4:
        return { score: 4, label: 'Strong', color: '#10b981' }
      default:
        return { score: 1, label: 'Weak', color: '#ef4444' }
    }
  }

  const strength = getStrength(value)

  return (
    <div className="auth-field-group">
      <label htmlFor={fieldId} className="auth-field-label">
        <span>{label}</span>
        {required && <span className="auth-required-mark" aria-hidden="true">*</span>}
      </label>

      <div className={`auth-input-wrapper ${error ? 'has-error' : ''} ${value ? 'has-value' : ''}`}>
        {Icon && (
          <span className="auth-input-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        )}
        <input
          ref={inputRef}
          id={fieldId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="auth-input-control"
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password as plain text'}
          tabIndex={0}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Live Strength Meter (Sign Up) */}
      {showStrength && value.length > 0 && (
        <div className="auth-strength-meter" aria-live="polite">
          <div className="auth-strength-bars">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="auth-strength-segment"
                style={{
                  backgroundColor: step <= strength.score ? strength.color : 'var(--border, rgba(255,255,255,0.12))',
                }}
              />
            ))}
          </div>
          <div className="auth-strength-label" style={{ color: strength.color }}>
            <span>{strength.label} password</span>
            {strength.score < 3 && (
              <span className="auth-strength-hint"> &bull; Add numbers or symbols</span>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -4, x: 0 }}
            animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24 }}
            className="auth-field-error"
          >
            <AlertCircle size={14} aria-hidden="true" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- 3. Animated Checkbox Component ---
export interface AnimatedCheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  error?: string
}

export function AnimatedCheckbox({
  id: customId,
  checked,
  onChange,
  label,
  error,
}: AnimatedCheckboxProps) {
  const autoId = useId()
  const boxId = customId || autoId

  return (
    <div className="auth-checkbox-group">
      <label htmlFor={boxId} className="auth-checkbox-label">
        <input
          id={boxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="auth-checkbox-hidden"
        />
        <span className={`auth-custom-checkbox ${checked ? 'is-checked' : ''} ${error ? 'has-error' : ''}`}>
          <svg viewBox="0 0 16 16" fill="none" className="auth-check-svg">
            <motion.path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{
                pathLength: checked ? 1 : 0,
                opacity: checked ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </svg>
        </span>
        <span className="auth-checkbox-text">{label}</span>
      </label>

      {error && (
        <div className="auth-field-error" role="alert" style={{ marginTop: '0.25rem' }}>
          <AlertCircle size={13} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// --- 4. Submit Button with Morphing State ---
export interface SubmitButtonProps {
  isLoading: boolean
  isSuccess: boolean
  label: string
  successLabel?: string
  disabled?: boolean
  onClick?: () => void
}

export function SubmitButton({
  isLoading,
  isSuccess,
  label,
  successLabel = 'Success!',
  disabled,
  onClick,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading || isSuccess}
      onClick={onClick}
      className={`auth-submit-btn ${isSuccess ? 'is-success' : ''} ${isLoading ? 'is-loading' : ''}`}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="auth-btn-spinner-content"
          >
            <span className="auth-spinner-ring" aria-hidden="true" />
            <span>Processing...</span>
          </motion.span>
        ) : isSuccess ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="auth-btn-success-content"
          >
            <Check size={18} strokeWidth={3} aria-hidden="true" />
            <span>{successLabel}</span>
          </motion.span>
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
