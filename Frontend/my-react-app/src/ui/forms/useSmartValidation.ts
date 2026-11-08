import { useState, useCallback } from 'react'

export interface FieldRules {
  required?: boolean
  email?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (val: string) => string | null
}

const COMMON_EMAIL_DOMAINS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'iclud.com': 'icloud.com',
}

export function detectEmailTypo(email: string): string | null {
  const parts = email.split('@')
  if (parts.length !== 2) return null
  const domain = parts[1].toLowerCase().trim()
  const suggestion = COMMON_EMAIL_DOMAINS[domain]
  return suggestion ? `${parts[0]}@${suggestion}` : null
}

export function calculatePasswordStrength(password: string): {
  score: number // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'
  color: string
} {
  if (!password) {
    return { score: 0, label: 'Very Weak', color: '#64748b' }
  }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const map: Record<number, { label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'; color: string }> = {
    0: { label: 'Very Weak', color: '#ef4444' },
    1: { label: 'Weak', color: '#f97316' },
    2: { label: 'Fair', color: '#eab308' },
    3: { label: 'Strong', color: '#3b82f6' },
    4: { label: 'Very Strong', color: '#10b981' },
  }
  return { score, ...map[score] }
}

export function useSmartValidation<T extends Record<string, string>>(
  initialValues: T,
  rules: Partial<Record<keyof T, FieldRules>>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [emailSuggestions, setEmailSuggestions] = useState<Partial<Record<keyof T, string>>>({})

  const validateField = useCallback(
    (name: keyof T, val: string): string | null => {
      const fieldRules = rules[name]
      if (!fieldRules) return null

      if (fieldRules.required && !val.trim()) {
        return 'This field is required.'
      }

      if (fieldRules.email && val.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(val.trim())) {
          return 'Please enter a valid email address.'
        }
      }

      if (fieldRules.minLength && val.length < fieldRules.minLength) {
        return `Must be at least ${fieldRules.minLength} characters.`
      }

      if (fieldRules.maxLength && val.length > fieldRules.maxLength) {
        return `Cannot exceed ${fieldRules.maxLength} characters.`
      }

      if (fieldRules.pattern && !fieldRules.pattern.test(val)) {
        return 'Invalid format.'
      }

      if (fieldRules.custom) {
        return fieldRules.custom(val)
      }

      return null
    },
    [rules]
  )

  const handleChange = (name: keyof T, val: string) => {
    setValues((prev) => ({ ...prev, [name]: val }))

    // Check for email typos
    if (rules[name]?.email) {
      const typo = detectEmailTypo(val)
      setEmailSuggestions((prev) => ({ ...prev, [name]: typo || undefined }))
    }

    // Live validation if already touched or error existed
    if (touched[name] || errors[name]) {
      const err = validateField(name, val)
      setErrors((prev) => ({ ...prev, [name]: err || undefined }))
    }
  }

  const handleBlur = (name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const err = validateField(name, values[name] || '')
    setErrors((prev) => ({ ...prev, [name]: err || undefined }))
  }

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    const newTouched: Partial<Record<keyof T, boolean>> = {}
    let firstInvalidKey: string | null = null

    for (const key in rules) {
      newTouched[key] = true
      const err = validateField(key, values[key] || '')
      if (err) {
        newErrors[key] = err
        if (!firstInvalidKey) firstInvalidKey = key
      }
    }

    setTouched(newTouched)
    setErrors(newErrors)

    if (firstInvalidKey) {
      // Focus first invalid input
      const el = document.getElementById(firstInvalidKey) || document.querySelector(`[name="${firstInvalidKey}"]`)
      if (el && 'focus' in el) {
        ;(el as HTMLElement).focus()
      }
      return false
    }

    return true
  }

  const isValid = Object.keys(rules).every((key) => !validateField(key as keyof T, values[key as keyof T] || ''))

  return {
    values,
    setValues,
    errors,
    touched,
    emailSuggestions,
    handleChange,
    handleBlur,
    validateAll,
    isValid,
    setEmailSuggestions,
  }
}
