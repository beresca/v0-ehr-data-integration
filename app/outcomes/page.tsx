import { Suspense } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { OutcomeReview } from '@/components/screens/outcome-review'

export default function OutcomesPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-muted-foreground">Loading outcomes...</div>}>
        <OutcomeReview />
      </Suspense>
    </AppShell>
  )
}
