import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database } from 'lucide-react'

export default function RegistryPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Database className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Registry</CardTitle>
            <CardDescription>
              Full registry search and export coming soon. Access historical transfusion records, generate reports, and export data for research.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  )
}
