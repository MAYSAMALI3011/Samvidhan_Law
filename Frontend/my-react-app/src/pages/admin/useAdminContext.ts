import { useOutletContext } from 'react-router-dom'
import type { UserRole } from '../../types'

export interface AdminContextType {
  demoRole: UserRole
  setDemoRole: (role: UserRole) => void
}

export function useAdminContext() {
  return useOutletContext<AdminContextType>()
}
