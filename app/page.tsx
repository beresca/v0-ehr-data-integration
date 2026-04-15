import { Suspense } from 'react'
import { MedicQuickDoc } from '@/components/screens/medic-quick-doc'

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading...</div>}>
      <MedicQuickDoc />
    </Suspense>
  )
}
