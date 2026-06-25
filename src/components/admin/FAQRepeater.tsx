'use client'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

interface FAQItem {
  question: string
  answer: string
}

interface FAQRepeaterProps {
  items: FAQItem[]
  onChange: (items: FAQItem[]) => void
  maxItems?: number
}

export function FAQRepeater({ items, onChange, maxItems = 20 }: FAQRepeaterProps) {
  function addItem() {
    onChange([...items, { question: '', answer: '' }])
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: keyof FAQItem, value: string) {
    onChange(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#1F2937] text-sm">FAQ Items</h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addItem}
          disabled={items.length >= maxItems}
        >
          + Add FAQ
        </Button>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="border border-[#E5E7EB] rounded-lg p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">FAQ #{idx + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="text-[#DC2626] hover:text-[#B91C1C] text-xs"
              aria-label={`Remove FAQ ${idx + 1}`}
            >
              Remove
            </button>
          </div>
          <Input
            label="Question"
            name={`faq_question_${idx}`}
            value={item.question}
            onChange={e => updateItem(idx, 'question', e.target.value)}
            placeholder="What is...?"
            maxLength={500}
          />
          <Textarea
            label="Answer"
            name={`faq_answer_${idx}`}
            value={item.answer}
            onChange={e => updateItem(idx, 'answer', e.target.value)}
            placeholder="The answer..."
            rows={3}
            maxLength={2000}
          />
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-[#9CA3AF] text-sm text-center py-4 border border-dashed border-[#E5E7EB] rounded-lg">
          No FAQ items yet. Click &quot;+ Add FAQ&quot; to get started.
        </p>
      )}
    </div>
  )
}
