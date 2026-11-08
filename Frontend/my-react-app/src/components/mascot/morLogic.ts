export type CanonicalMorMood = 'wave' | 'reading' | 'celebrate' | 'thinking' | 'encourage' | 'sleepy' | 'idle'

export function resolveMorMood(mood: string = 'idle'): CanonicalMorMood {
  if (mood === 'waving') return 'wave'
  if (mood === 'celebrating') return 'celebrate'
  if (mood === 'encouraging') return 'encourage'
  if (mood === 'standing' || mood === 'head-only') return 'idle'
  if (['wave', 'reading', 'celebrate', 'thinking', 'encourage', 'sleepy', 'idle'].includes(mood)) {
    return mood as CanonicalMorMood
  }
  return 'idle'
}

export function getMorAriaLabel(
  mood: string = 'idle',
  decorative: boolean = false,
  customLabel?: string
): string | undefined {
  if (decorative) return undefined
  if (customLabel) return customLabel
  const canonical = resolveMorMood(mood)
  return `Mor the peacock, ${canonical}`
}

export function shouldRenderMor(
  mascotEnabledInSettings?: boolean,
  propEnabled?: boolean
): boolean {
  if (propEnabled === false) return false
  if (mascotEnabledInSettings === false) return false
  return true
}

export function getMorWrapperClasses(
  mood: string = 'idle',
  animate: boolean = true,
  className: string = ''
): string {
  const canonical = resolveMorMood(mood)
  const animClass = animate ? 'is-animated' : 'is-static'
  return `mor-component-wrapper mood-${canonical} ${animClass} ${className}`.trim()
}
