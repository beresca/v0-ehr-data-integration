import { AppShell } from '@/components/layout/app-shell'
import { PIDashboard } from '@/components/screens/pi-dashboard'

export default function DashboardPage() {
  return (
    <AppShell>
      <PIDashboard />
    </AppShell>
  )
}
