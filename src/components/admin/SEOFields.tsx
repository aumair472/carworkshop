'use client'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

interface SEOFieldsProps {
  title: string
  description: string
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
}

export function SEOFields({ title, description, onTitleChange, onDescriptionChange }: SEOFieldsProps) {
  return (
    <div className="space-y-4 border border-[#E5E7EB] rounded-lg p-4 bg-[#F9FAFB]">
      <h3 className="font-semibold text-[#1F2937] text-sm">SEO Settings</h3>
      <div>
        <Input
          label="SEO Title"
          name="seo_title"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          maxLength={60}
          placeholder="Page title for search engines (max 60 chars)"
        />
        <p className={`text-xs mt-1 ${title.length > 55 ? 'text-[#D97706]' : 'text-[#9CA3AF]'}`}>
          {title.length}/60 characters
        </p>
      </div>
      <div>
        <Textarea
          label="Meta Description"
          name="seo_description"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          maxLength={160}
          rows={3}
          placeholder="Description for search results (max 160 chars)"
        />
        <p className={`text-xs mt-1 ${description.length > 150 ? 'text-[#D97706]' : 'text-[#9CA3AF]'}`}>
          {description.length}/160 characters
        </p>
      </div>
    </div>
  )
}
