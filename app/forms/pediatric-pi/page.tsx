'use client'

import { useState } from 'react'
import { TransfusionPIForm } from '@/components/registry/transfusion-pi-form'
import { EmsImportModal } from '@/components/registry/ems-import-modal'

export default function PediatricPIFormPage() {
  const [showEmsImport, setShowEmsImport] = useState(false)

  return (
    <>
      <TransfusionPIForm 
        formType="pediatric_pi"
        onEmsImport={() => setShowEmsImport(true)}
      />
      <EmsImportModal
        open={showEmsImport}
        onOpenChange={setShowEmsImport}
        onImport={(data) => {
          // Handle imported EMS data
          console.log('[v0] EMS data imported:', data)
          setShowEmsImport(false)
        }}
      />
    </>
  )
}
