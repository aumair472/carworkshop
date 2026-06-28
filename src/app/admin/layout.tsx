import { Toaster } from 'react-hot-toast'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { getActingUser } from '@/lib/auth-guard'

export const metadata = {
  title: { default: 'Admin | CarWorkshop.ae', template: '%s | Admin — CarWorkshop.ae' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const acting = await getActingUser()
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FC]">
      <AdminSidebar role={acting?.role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </div>
  )
}
