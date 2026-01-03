import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/components/layout/AppProvider'

export const metadata: Metadata = {
  title: 'Le Petit Davinci - Admin Dashboard',
  description: 'Educational analytics dashboard for Le Petit Davinci',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
