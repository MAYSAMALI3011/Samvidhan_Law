/**
 * API Client Re-export & Bridge
 * Delegates to modern typed API layer in src/api
 */
export { isMockMode } from '../api/config'
export {
  loginUser,
  signupUser,
  verifyEmailOtp,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  logoutUser,
  getCurrentUser,
} from '../api/services/authService'
export type { AuthSessionResponse as AuthResponse } from '../api/types'
