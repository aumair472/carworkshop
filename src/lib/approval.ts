import { getActingUser, type ActingUser } from '@/lib/auth-guard'
import type { ApprovalStatus, UserRole } from '@/types'

// Roles that may approve/reject content and assign SEO users to pages.
export const APPROVER_ROLES: UserRole[] = ['super_admin', 'admin', 'editor']

// Roles whose saves land in the approval queue instead of going live-approved.
export const SUBMITTER_ROLES: UserRole[] = ['seo_editor', 'content_writer']

export function canApprove(role: UserRole): boolean {
  return APPROVER_ROLES.includes(role)
}

// Approvers' saves are auto-approved; submitters' saves go to pending review.
export function nextStatusOnSave(role: UserRole): ApprovalStatus {
  return canApprove(role) ? 'approved' : 'pending'
}

export const APPROVAL_ACTIONS = ['approve', 'reject', 'resubmission_required'] as const
export type ApprovalAction = (typeof APPROVAL_ACTIONS)[number]

export function statusForAction(action: ApprovalAction): ApprovalStatus {
  return action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'resubmission_required'
}

// Returns the acting user when they hold an approver role, else null.
// Route handlers: `const approver = await assertApprover(); if (!approver) return 403`.
export async function assertApprover(): Promise<ActingUser | null> {
  const acting = await getActingUser()
  if (!acting || !canApprove(acting.role)) return null
  return acting
}
