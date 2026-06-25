import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata = {
  title: { default: 'Admin | CarWorkshop.ae', template: '%s | Admin — CarWorkshop.ae' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
