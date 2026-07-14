import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { FaqForm, EMPTY_FAQ } from '@/components/admin/faqs/FaqForm'

export const metadata = { title: 'Add FAQ' }

export default function NewFaqPage() {
  return (
    <>
      <AdminTopbar title="Add FAQ's" />
      <div className="p-6">
        <FaqForm initial={EMPTY_FAQ} />
      </div>
    </>
  )
}
