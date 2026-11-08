import { Tooltip as BaseTooltip } from '../animations/Tooltip'
import type { ReactNode } from 'react'

export interface TooltipProps {
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
  delay?: number
}

export function Tooltip(props: TooltipProps) {
  return <BaseTooltip {...props} />
}
