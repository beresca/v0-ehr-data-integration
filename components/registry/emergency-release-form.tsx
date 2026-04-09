'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FormHeader } from '@/components/registry/form-header'
import { PatientDemographics } from '@/components/registry/patient-demographics'
import { EventDetails } from '@/components/registry/event-details'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { 
  TransfusionCase, 
  CaseStatus,
  NoTransfusionReason,
  DataSource
} from '@/lib/types/registry'
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Droplet,
  Package,
  FileQuestion
} from 'lucide-react'

interface EmergencyReleaseFormProps {
  caseId?: string
  initialData?: TransfusionCase
}

export function EmergencyReleaseForm({
  caseId,
  initialData,
}: EmergencyReleaseFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // Form state
  const [caseData, setCaseData] = useState<Partial<TransfusionCase>>(
    initialData || {
      form_type: 'emergency_release',
      status: 'draft' as CaseStatus,
      patient_transported: true,
    }
  )
  
  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Update case data
  const updateCaseField = useCallback(<K extends keyof TransfusionCase>(
    field: K,
    value: TransfusionCase[K]
  ) => {
    setCaseData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }, [])

  // Generate case number
  const generateCaseNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ER-${date}-${random}`
  }

  // Save form
  const handleSave = async () => {
    setIsSaving(true)
    setErrors([])

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to save')
      }

      const caseNumber = caseData.case_number || generateCaseNumber()
      const casePayload = {
        ...caseData,
        case_number: caseNumber,
        form_type: 'emergency_release',
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (caseId) {
        const { error } = await supabase
          .from('transfusion_cases')
          .update(casePayload)
          .eq('id', caseId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('transfusion_cases')
          .insert(casePayload)
          .select('id')
          .single()
        if (error) throw error
        
        if (!caseId && data.id) {
          router.push(`/cases/${data.id}`)
        }
      }

      setIsDirty(false)
      toast.success('Form saved successfully')
    } catch (error) {
      console.error('Save error:', error)
      setErrors([error instanceof Error ? error.message : 'Failed to save form'])
      toast.error('Failed to save form')
    } finally {
      setIsSaving(false)
    }
  }

  // Submit for review
  const handleSubmit = async () => {
    const validationErrors: string[] = []
    
    if (caseData.received_prehospital_blood === undefined) {
      validationErrors.push('Please indicate if patient received prehospital blood')
    }
    if (caseData.received_prehospital_blood === false && !caseData.no_transfusion_reason) {
      validationErrors.push('Please specify why blood was not transfused')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setCaseData(prev => ({ ...prev, status: 'pending_review' as CaseStatus }))
    await handleSave()
  }

  return (
    <div className="min-h-screen bg-background">
      <FormHeader
        formType="emergency_release"
        caseNumber={caseData.case_number}
        status={caseData.status || 'draft'}
        onBack={() => router.push('/dashboard')}
        onSave={handleSave}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        isDirty={isDirty}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Error display */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Patient Demographics */}
        <PatientDemographics
          patientUid={caseData.patient_uid}
          patientMrn={caseData.patient_mrn}
          age={caseData.age}
          gender={caseData.gender}
          bloodType={caseData.blood_type}
          onPatientUidChange={(v) => updateCaseField('patient_uid', v)}
          onPatientMrnChange={(v) => updateCaseField('patient_mrn', v)}
          onAgeChange={(v) => updateCaseField('age', v)}
          onGenderChange={(v) => updateCaseField('gender', v)}
          onBloodTypeChange={(v) => updateCaseField('blood_type', v)}
        />

        {/* Event Details */}
        <EventDetails
          eventDate={caseData.event_date}
          agency={caseData.agency}
          transportingUnit={caseData.transporting_unit}
          destinationFacility={caseData.destination_facility}
          patientTransported={caseData.patient_transported}
          onEventDateChange={(v) => updateCaseField('event_date', v)}
          onAgencyChange={(v) => updateCaseField('agency', v)}
          onTransportingUnitChange={(v) => updateCaseField('transporting_unit', v)}
          onDestinationFacilityChange={(v) => updateCaseField('destination_facility', v)}
          onPatientTransportedChange={(v) => updateCaseField('patient_transported', v)}
        />

        {/* Prehospital Blood Received */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-destructive" />
              Prehospital Blood Product Administration
            </CardTitle>
            <CardDescription>
              Document whether patient received emergency release blood products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field>
              <FieldLabel className="text-base">
                Did patient receive prehospital blood product transfusion?
              </FieldLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <button
                  type="button"
                  onClick={() => updateCaseField('received_prehospital_blood', true)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border text-left transition-colors',
                    caseData.received_prehospital_blood === true
                      ? 'border-success bg-success/5'
                      : 'border-border hover:border-success/50'
                  )}
                >
                  <div className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
                    caseData.received_prehospital_blood === true
                      ? 'bg-success/20 text-success'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Yes</p>
                    <p className="text-sm text-muted-foreground">
                      Blood products were administered in the field
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateCaseField('received_prehospital_blood', false)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border text-left transition-colors',
                    caseData.received_prehospital_blood === false
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
                    caseData.received_prehospital_blood === false
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">No</p>
                    <p className="text-sm text-muted-foreground">
                      Blood products were not administered
                    </p>
                  </div>
                </button>
              </div>
            </Field>

            {/* Reason for no transfusion */}
            {caseData.received_prehospital_blood === false && (
              <Field className="animate-in fade-in slide-in-from-top-2 duration-200">
                <FieldLabel>Reason blood was not transfused</FieldLabel>
                <RadioGroup
                  value={caseData.no_transfusion_reason}
                  onValueChange={(v) => updateCaseField('no_transfusion_reason', v as NoTransfusionReason)}
                  className="grid gap-3 mt-2"
                >
                  {[
                    { 
                      value: 'CRITERIA_NOT_MET', 
                      label: 'Criteria Not Met', 
                      description: 'Patient did not meet transfusion criteria',
                      icon: FileQuestion
                    },
                    { 
                      value: 'PRODUCT_UNAVAILABLE', 
                      label: 'Product Unavailable', 
                      description: 'Blood products were not available on unit',
                      icon: Package
                    },
                    { 
                      value: 'OTHER', 
                      label: 'Other', 
                      description: 'Specify the reason',
                      icon: AlertCircle
                    },
                  ].map((option) => {
                    const Icon = option.icon
                    const isSelected = caseData.no_transfusion_reason === option.value

                    return (
                      <label
                        key={option.value}
                        htmlFor={`reason-${option.value}`}
                        className={cn(
                          'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem 
                          value={option.value} 
                          id={`reason-${option.value}`}
                          className="mt-0.5"
                        />
                        <div className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                          isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </label>
                    )
                  })}
                </RadioGroup>

                {caseData.no_transfusion_reason === 'OTHER' && (
                  <div className="mt-3 ml-14">
                    <Field>
                      <FieldLabel>Specify reason</FieldLabel>
                      <Textarea
                        value={caseData.no_transfusion_reason_details || ''}
                        onChange={(e) => updateCaseField('no_transfusion_reason_details', e.target.value)}
                        placeholder="Describe why blood was not transfused..."
                        rows={3}
                      />
                    </Field>
                  </div>
                )}
              </Field>
            )}
          </CardContent>
        </Card>

        {/* Form actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={isSaving || !isDirty}>
            Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            Submit
          </Button>
        </div>
      </main>
    </div>
  )
}
