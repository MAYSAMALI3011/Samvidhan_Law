import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface HeroRevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function HeroReveal({ children, delay = 0, className = '' }: HeroRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  // On phone, skip blur animations entirely to save GPU and prevent stuck blur
  return (
    <motion.div
      className={className}
      initial={isMobile ? { opacity: 0, y: 14 } : { opacity: 0, y: 14, filter: 'blur(8px)' }}
      animate={
        isMobile
          ? { opacity: 1, y: 0 }
          : { opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }
      }
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  staggerChildren?: number
  delayChildren?: number
  className?: string
}

export function StaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0.1,
  className = '',
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: isMobile ? { opacity: 0, y: 16 } : { opacity: 0, y: 16, filter: 'blur(6px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: isMobile ? 'none' : 'blur(0px)',
          transitionEnd: { filter: 'none' },
          transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
