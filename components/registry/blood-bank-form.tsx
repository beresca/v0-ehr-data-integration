'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FormHeader } from '@/components/registry/form-header'
import { PatientDemographics } from '@/components/registry/patient-demographics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { 
  TransfusionCase, 
  CaseStatus,
  TriStateAnswer
} from '@/lib/types/registry'
import { 
  AlertCircle, 
  Building2,
  Syringe,
  Calendar,
  ClipboardList,
  Bell,
  BookOpen,
  Check,
  X,
  Minus
} from 'lucide-react'

interface BloodBankFormProps {
  caseId?: string
  initialData?: TransfusionCase
}

interface TriStateOption {
  id: string
  field: keyof TransfusionCase
  label: string
  description: string
  icon: typeof Syringe
}

const RH_NEGATIVE_OPTIONS: TriStateOption[] = [
  {
    id: 'rhogam',
    field: 'rhogam_treatment',
    label: 'RhoGAM Treatment',
    description: 'Was RhoGAM administered to prevent Rh sensitization?',
    icon: Syringe,
  },
  {
    id: 'ob_referral',
    field: 'ob_referral',
    label: 'OB Referral',
    description: 'Was patient referred to OB for follow-up care?',
    icon: ClipboardList,
  },
  {
    id: 'followup',
    field: 'followup_appointment',
    label: 'Follow-up Appointment',
    description: 'Was a follow-up appointment scheduled?',
    icon: Calendar,
  },
  {
    id: 'antibody',
    field: 'antibody_testing',
    label: 'Antibody Testing',
    description: 'Was antibody testing performed or ordered?',
    icon: ClipboardList,
  },
  {
    id: 'notification',
    field: 'transfusion_notification',
    label: 'Transfusion Notification',
    description: 'Was patient notified about the transfusion details?',
    icon: Bell,
  },
  {
    id: 'education',
    field: 'education_materials',
    label: 'Education Materials',
    description: 'Were education materials provided to the patient?',
    icon: BookOpen,
  },
]

export function BloodBankForm({
  caseId,
  initialData,
}: BloodBankFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // Form state
  const [caseData, setCaseData] = useState<Partial<TransfusionCase>>(
    initialData || {
      form_type: 'blood_bank',
      status: 'draft' as CaseStatus,
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
    return `BB-${date}-${random}`
  }

  // Check if blood type is Rh negative
  const isRhNegative = caseData.blood_type?.endsWith('-')

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
        form_type: 'blood_bank',
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
    
    if (!caseData.blood_type) {
      validationErrors.push('Blood type is required')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setCaseData(prev => ({ ...prev, status: 'pending_review' as CaseStatus }))
    await handleSave()
  }

  const TriStateButtons = ({ 
    value, 
    onChange 
  }: { 
    value?: TriStateAnswer
    onChange: (value: TriStateAnswer) => void 
  }) => (
    <div className="flex gap-1">
      <Button
        type="button"
        variant={value === 'YES' ? 'default' : 'outline'}
        size="sm"
        className={cn(
          'gap-1.5',
          value === 'YES' && 'bg-success hover:bg-success/90 text-success-foreground'
        )}
        onClick={() => onChange('YES')}
      >
        <Check className="h-3.5 w-3.5" />
        Yes
      </Button>
      <Button
        type="button"
        variant={value === 'NO' ? 'default' : 'outline'}
        size="sm"
        className={cn(
          'gap-1.5',
          value === 'NO' && 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
        )}
        onClick={() => onChange('NO')}
      >
        <X className="h-3.5 w-3.5" />
        No
      </Button>
      <Button
        type="button"
        variant={value === 'NOT_INDICATED' ? 'default' : 'outline'}
        size="sm"
        className="gap-1.5"
        onClick={() => onChange('NOT_INDICATED')}
      >
        <Minus className="h-3.5 w-3.5" />
        N/A
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <FormHeader
        formType="blood_bank"
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

        {/* Rh-Negative Patient Documentation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-chart-2" />
                  Rh-Negative Patient Follow-up
                </CardTitle>
                <CardDescription>
                  Documentation for patients who received Rh-positive blood products
                </CardDescription>
              </div>
              {isRhNegative && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Rh-Negative Patient
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!caseData.blood_type ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please enter the patient&apos;s blood type above to see applicable follow-up items.
                </AlertDescription>
              </Alert>
            ) : !isRhNegative ? (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Patient blood type is Rh-positive ({caseData.blood_type}). 
                  No special follow-up documentation required.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert className="border-warning bg-warning/5">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-foreground">
                    <strong>Rh-Negative Patient Alert:</strong> This patient has blood type {caseData.blood_type}. 
                    Complete all applicable follow-up items below.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 mt-6">
                  {RH_NEGATIVE_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const value = caseData[option.field] as TriStateAnswer | undefined

                    return (
                      <div 
                        key={option.id}
                        className={cn(
                          'flex items-start gap-4 p-4 rounded-lg border',
                          value === 'YES' && 'border-success bg-success/5',
                          value === 'NO' && 'border-destructive/50 bg-destructive/5',
                          value === 'NOT_INDICATED' && 'border-muted bg-muted/50',
                          !value && 'border-border'
                        )}
                      >
                        <div className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                          value === 'YES' && 'bg-success/20 text-success',
                          value === 'NO' && 'bg-destructive/20 text-destructive',
                          (!value || value === 'NOT_INDICATED') && 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <TriStateButtons 
                          value={value}
                          onChange={(v) => updateCaseField(option.field, v)}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Additional notes */}
                <Field className="pt-4">
                  <FieldLabel>Additional Notes</FieldLabel>
                  <FieldDescription>
                    Document any additional information about Rh-negative patient management
                  </FieldDescription>
                  <Textarea
                    value={caseData.rh_negative_explanation || ''}
                    onChange={(e) => updateCaseField('rh_negative_explanation', e.target.value)}
                    placeholder="Additional notes about Rh-negative follow-up care..."
                    rows={4}
                  />
                </Field>
              </div>
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
