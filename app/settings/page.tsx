import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your BloodTrack preferences, notification settings, EHR integrations, and user management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  )
}
