'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminInput, AdminSelect } from '@/components/admin/ui/AdminField'
import { EmptyState, SkeletonRows } from '@/components/admin/ui/AdminStates'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { UserPlus, X } from 'lucide-react'

type Role = 'super_admin' | 'admin' | 'editor' | 'content_writer' | 'support_staff' | 'seo_editor'
interface UserRow { id: string; email: string; full_name: string | null; role: Role; is_active: boolean; last_login: string | null; created_at: string }

const ROLES: Array<{ value: Role; label: string }> = [
  { value: 'super_admin', label: 'Super Admin' }, { value: 'admin', label: 'Admin' }, { value: 'editor', label: 'Editor' },
  { value: 'content_writer', label: 'Content Writer' }, { value: 'seo_editor', label: 'SEO Editor' }, { value: 'support_staff', label: 'Support Staff' },
]
const ROLE_BADGE: Record<Role, string> = {
  super_admin: 'bg-red-50 text-red-700 border-red-200', admin: 'bg-orange-50 text-orange-700 border-orange-200',
  editor: 'bg-blue-50 text-blue-700 border-blue-200', content_writer: 'bg-green-50 text-green-700 border-green-200',
  seo_editor: 'bg-purple-50 text-purple-700 border-purple-200',
  support_staff: 'bg-zinc-100 text-zinc-600 border-zinc-200',
}
const roleLabel = (r: Role) => ROLES.find(x => x.value === r)?.label ?? r

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [meId, setMeId] = useState('')
  const [myRole, setMyRole] = useState<Role>('content_writer')
  const [loaded, setLoaded] = useState(false)
  const [invite, setInvite] = useState(false)
  const [roleFor, setRoleFor] = useState<UserRow | null>(null)
  const [pwFor, setPwFor] = useState<UserRow | null>(null)
  const [deactivate, setDeactivate] = useState<UserRow | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (cancelled || !res.ok) return
        const d = await res.json() as { users: UserRow[]; currentUserId: string; currentRole: Role }
        if (cancelled) return
        setUsers(d.users ?? []); setMeId(d.currentUserId); setMyRole(d.currentRole)
      } catch { /* ignore */ } finally { if (!cancelled) setLoaded(true) }
    })()
    return () => { cancelled = true }
  }, [reload])

  const refresh = useCallback(() => setReload(n => n + 1), [])
  const isSuper = myRole === 'super_admin'

  async function changeRole(u: UserRow, role: Role) {
    const t = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/users/${u.id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
      const d = await res.json() as { error?: string }
      if (!res.ok) { toast.error(d.error ?? 'Failed', { id: t }); return }
      toast.success('Role updated', { id: t }); setRoleFor(null); refresh()
    } catch { toast.error('Network error', { id: t }) }
  }

  async function doDeactivate(u: UserRow) {
    const t = toast.loading('Updating…')
    try {
      const res = await fetch(`/api/admin/users/${u.id}/deactivate`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !u.is_active }) })
      const d = await res.json() as { error?: string }
      if (!res.ok) { toast.error(d.error ?? 'Failed', { id: t }); return }
      toast.success(u.is_active ? 'User deactivated' : 'User reactivated', { id: t }); setDeactivate(null); refresh()
    } catch { toast.error('Network error', { id: t }) }
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title={`Users (${users.length})`} actions={isSuper || myRole === 'admin' ? <AdminButton variant="primary" onClick={() => setInvite(true)}><UserPlus size={15} /> Invite User</AdminButton> : undefined} />

      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          {!loaded ? <SkeletonRows rows={5} cols={5} />
            : users.length === 0 ? <EmptyState title="No users yet" description="Invite team members to collaborate." />
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-zinc-50 border-b border-zinc-200 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3 text-right">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-zinc-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-full bg-[#4472C4] text-white flex items-center justify-center text-xs font-bold shrink-0">{(u.full_name ?? u.email).slice(0, 1).toUpperCase()}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-900 truncate">{u.full_name ?? '—'}{u.id === meId && <span className="ml-1.5 text-[10px] text-zinc-400">(you)</span>}</p>
                              <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_BADGE[u.role]}`}>{roleLabel(u.role)}</span></td>
                        <td className="px-5 py-3"><span className={u.is_active ? 'text-green-600' : 'text-red-500'}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-5 py-3 text-zinc-400 text-xs">{new Date(u.created_at).toLocaleDateString('en-AE')}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-3 text-xs font-medium">
                            {isSuper && u.id !== meId ? (
                              <>
                                <button onClick={() => setRoleFor(u)} className="text-[#4472C4] hover:underline">Change Role</button>
                                <button onClick={() => setPwFor(u)} className="text-zinc-600 hover:underline">Reset Password</button>
                                <button onClick={() => setDeactivate(u)} className={u.is_active ? 'text-red-500 hover:underline' : 'text-green-600 hover:underline'}>{u.is_active ? 'Deactivate' : 'Reactivate'}</button>
                              </>
                            ) : <span className="text-zinc-300">—</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
        {!isSuper && loaded && <p className="text-xs text-zinc-400 mt-3">Role and status changes require the Super Admin role.</p>}
      </div>

      {invite && <InviteModal onClose={() => setInvite(false)} onDone={() => { setInvite(false); refresh() }} />}
      {roleFor && <RoleModal user={roleFor} onClose={() => setRoleFor(null)} onSave={changeRole} />}
      {pwFor && <PasswordModal user={pwFor} onClose={() => setPwFor(null)} />}
      <ConfirmModal open={!!deactivate} title={deactivate?.is_active ? 'Deactivate user' : 'Reactivate user'} message={deactivate?.is_active ? `Deactivate ${deactivate?.full_name ?? deactivate?.email}? They will lose all access.` : `Reactivate ${deactivate?.full_name ?? deactivate?.email}?`} confirmLabel={deactivate?.is_active ? 'Deactivate' : 'Reactivate'} variant={deactivate?.is_active ? 'danger' : 'primary'} onConfirm={() => deactivate && void doDeactivate(deactivate)} onCancel={() => setDeactivate(null)} />
    </div>
  )
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function InviteModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('editor')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!fullName || !email) { toast.error('Name and email required'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setBusy(true)
    const t = toast.loading('Creating user…')
    try {
      const res = await fetch('/api/admin/users/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: fullName, email, password, role }) })
      const d = await res.json() as { error?: string }
      if (!res.ok) { toast.error(d.error ?? 'Failed', { id: t }); return }
      toast.success('User created', { id: t }); onDone()
    } catch { toast.error('Network error', { id: t }) } finally { setBusy(false) }
  }

  return (
    <ModalShell title="Create New User" onClose={onClose}>
      <div className="space-y-4">
        <AdminInput label="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)} />
        <AdminInput label="Email" required type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <AdminInput label="Password" required type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters — share with the user" />
        <AdminSelect label="Role" value={role} onChange={e => setRole(e.target.value as Role)} options={ROLES} />
        <p className="text-xs text-zinc-400">User can sign in immediately at /admin/login with this email + password. Give them these credentials.</p>
        <div className="flex justify-end gap-2 pt-2">
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" loading={busy} onClick={() => void submit()}>Create User →</AdminButton>
        </div>
      </div>
    </ModalShell>
  )
}

function RoleModal({ user, onClose, onSave }: { user: UserRow; onClose: () => void; onSave: (u: UserRow, role: Role) => void }) {
  const [role, setRole] = useState<Role>(user.role)
  return (
    <ModalShell title={`Change Role — ${user.full_name ?? user.email}`} onClose={onClose}>
      <div className="space-y-2">
        {ROLES.map(r => (
          <label key={r.value} className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
            <input type="radio" name="role" checked={role === r.value} onChange={() => setRole(r.value)} />
            <span className="text-sm text-zinc-800">{r.label}</span>
          </label>
        ))}
        <div className="flex justify-end gap-2 pt-3">
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" onClick={() => onSave(user, role)}>Save Role →</AdminButton>
        </div>
      </div>
    </ModalShell>
  )
}

function PasswordModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setBusy(true)
    const t = toast.loading('Updating password…')
    try {
      const res = await fetch(`/api/admin/users/${user.id}/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const d = await res.json() as { error?: string }
      if (!res.ok) { toast.error(d.error ?? 'Failed', { id: t }); return }
      toast.success(`Password updated for ${user.email}`, { id: t }); onClose()
    } catch { toast.error('Network error', { id: t }) } finally { setBusy(false) }
  }

  return (
    <ModalShell title={`Reset Password — ${user.full_name ?? user.email}`} onClose={onClose}>
      <div className="space-y-4">
        <AdminInput label="New Password" required type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters — share with the user" />
        <p className="text-xs text-zinc-400">Overwrites the user&apos;s password immediately. Give them the new password.</p>
        <div className="flex justify-end gap-2 pt-2">
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" loading={busy} onClick={() => void submit()}>Update Password →</AdminButton>
        </div>
      </div>
    </ModalShell>
  )
}
