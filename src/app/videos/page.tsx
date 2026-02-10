'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { VideosPage } from '@/components/pages/VideosPage'

export default function Page() {
  return (
    <DashboardLayout>
      <VideosPage />
    </DashboardLayout>
  )
}
