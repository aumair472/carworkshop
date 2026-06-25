import { createServiceClient } from '@/lib/supabase/service'
import type { Json } from '@/types/database'

interface AuditParams {
  userId: string
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'generate'
  table: string
  recordId: string
  changes?: Json
}

export async function logAudit({ userId, action, table, recordId, changes }: AuditParams): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      table_name: table,
      record_id: recordId,
      changes_json: changes ?? null,
    })
  } catch (err) {
    console.error('Audit log failed:', err)
  }
}
