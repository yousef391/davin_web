'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { UsersPage } from '@/components/pages/UsersPage'

export default function Users() {
  return (
    <DashboardLayout>
      <UsersPage />
    </DashboardLayout>
  )
}
