/**
 * Admin Service Bridge
 * Delegates to modern typed API layer in src/api
 */
export {
  adminService,
  type AdminContentItem,
  type AdminUserRecord,
  type MistakeReport,
  type AuditLogItem,
} from '../api/services/adminService'
