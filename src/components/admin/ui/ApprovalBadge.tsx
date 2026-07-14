import { APPROVAL_STATUS_LABELS, type ApprovalStatus } from '@/types'

const COLORS: Record<ApprovalStatus, string> = {
  approved: '#22C55E',
  pending: '#E8601C',
  resubmission_required: '#EF4444',
  rejected: '#6B7280',
}

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span className="text-xs font-semibold whitespace-nowrap" style={{ color: COLORS[status] }}>
      {APPROVAL_STATUS_LABELS[status]}
    </span>
  )
}
