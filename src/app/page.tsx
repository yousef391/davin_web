'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AnalyticsPage } from '@/components/pages/AnalyticsPage'

export default function Home() {
  return (
    <DashboardLayout>
      <AnalyticsPage />
    </DashboardLayout>
  )
}
