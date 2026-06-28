'use client'

import PagesAdminPage from '../page'

// Dedicated "Model Pages" entry — the All Pages manager pre-filtered to model
// hub pages (/brands/[brand]/[model]).
export default function ModelPagesPage() {
  return <PagesAdminPage initialType="model" />
}
