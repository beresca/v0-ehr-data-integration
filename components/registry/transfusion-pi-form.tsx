'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FormHeader } from '@/components/registry/form-header'
import { PatientDemographics } from '@/components/registry/patient-demographics'
import { EventDetails } from '@/components/registry/event-details'
import { VitalSignsSection } from '@/components/registry/vital-signs-section'
import { PhysiologicSignsSection } from '@/components/registry/physiologic-signs-section'
import { IndicationSection } from '@/components/registry/indication-section'
import { ComplicationSection } from '@/components/registry/complication-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProvenanceBadgeInline } from '@/components/registry/provenance-badge'
import { toast } from 'sonner'
import type { 
  TransfusionCase, 
  VitalSign, 
  PhysiologicSign, 
  FieldProvenance,
  FormType, 
  CaseStatus,
  IndicationCategory,
  ComplicationType,
  TriStateAnswer,
  DataSource
} from '@/lib/types/registry'
import { 
  Upload, 
  CheckCircle, 
  Building2, 
  AlertCircle 
} from 'lucide-react'

interface TransfusionPIFormProps {
  formType: FormType
  caseId?: string
  initialData?: TransfusionCase
  initialVitalSigns?: VitalSign[]
  initialPhysiologicSigns?: PhysiologicSign[]
  initialProvenance?: FieldProvenance[]
  onEmsImport?: () => void
}

export function TransfusionPIForm({
  formType,
  caseId,
  initialData,
  initialVitalSigns = [],
  initialPhysiologicSigns = [],
  initialProvenance = [],
  onEmsImport,
}: TransfusionPIFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // Form state
  const [caseData, setCaseData] = useState<Partial<TransfusionCase>>(
    initialData || {
      form_type: formType,
      status: 'draft' as CaseStatus,
      patient_transported: true,
    }
  )
  const [vitalSigns, setVitalSigns] = useState<Partial<VitalSign>[]>(initialVitalSigns)
  const [physiologicSigns, setPhysiologicSigns] = useState<Partial<PhysiologicSign>[]>(initialPhysiologicSigns)
  const [provenance, setProvenance] = useState<Map<string, FieldProvenance>>(
    new Map(initialProvenance.map(p => [p.field_name, p]))
  )
  
  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Track changes
  useEffect(() => {
    setIsDirty(true)
  }, [caseData, vitalSigns, physiologicSigns])

  // Get provenance source for a field
  const getFieldSource = useCallback((fieldName: string): DataSource | undefined => {
    return provenance.get(fieldName)?.source
  }, [provenance])

  // Update case data with provenance tracking
  const updateCaseField = useCallback(<K extends keyof TransfusionCase>(
    field: K,
    value: TransfusionCase[K],
    source: DataSource = 'MANUAL'
  ) => {
    setCaseData(prev => ({ ...prev, [field]: value }))
    setProvenance(prev => {
      const next = new Map(prev)
      next.set(field, {
        id: crypto.randomUUID(),
        case_id: caseId || '',
        field_name: field,
        field_value: String(value),
        source,
        recorded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      return next
    })
  }, [caseId])

  // Vital sign handlers
  const handleVitalSignChange = useCallback((index: number, updates: Partial<VitalSign>) => {
    setVitalSigns(prev => {
      const next = [...prev]
      if (index < next.length) {
        next[index] = { ...next[index], ...updates }
      } else {
        next.push(updates)
      }
      return next
    })
  }, [])

  // Physiologic sign handlers
  const handlePhysiologicSignChange = useCallback((index: number, updates: Partial<PhysiologicSign>) => {
    setPhysiologicSigns(prev => {
      const next = [...prev]
      if (index < next.length) {
        next[index] = { ...next[index], ...updates }
      } else {
        next.push(updates)
      }
      return next
    })
  }, [])

  // Get SBP and HR values for shock index calculation
  const sbpVital = vitalSigns.find(v => v.vital_type === 'sbp')
  const hrVital = vitalSigns.find(v => v.vital_type === 'hr')
  const sbpValue = sbpVital?.patient_value ? parseFloat(sbpVital.patient_value) : undefined
  const hrValue = hrVital?.patient_value ? parseFloat(hrVital.patient_value) : undefined

  // Generate case number
  const generateCaseNumber = () => {
    const prefix = formType === 'pediatric_pi' ? 'PED' : 'ADT'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${date}-${random}`
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
        form_type: formType,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      let savedCaseId = caseId

      if (caseId) {
        // Update existing case
        const { error } = await supabase
          .from('transfusion_cases')
          .update(casePayload)
          .eq('id', caseId)

        if (error) throw error
      } else {
        // Create new case
        const { data, error } = await supabase
          .from('transfusion_cases')
          .insert(casePayload)
          .select('id')
          .single()

        if (error) throw error
        savedCaseId = data.id
      }

      // Save vital signs
      if (savedCaseId && vitalSigns.length > 0) {
        // Delete existing vital signs
        await supabase
          .from('vital_signs')
          .delete()
          .eq('case_id', savedCaseId)

        // Insert new vital signs
        const vitalSignsPayload = vitalSigns
          .filter(v => v.vital_type)
          .map(v => ({
            ...v,
            case_id: savedCaseId,
          }))

        if (vitalSignsPayload.length > 0) {
          const { error } = await supabase
            .from('vital_signs')
            .insert(vitalSignsPayload)

          if (error) throw error
        }
      }

      // Save physiologic signs
      if (savedCaseId && physiologicSigns.length > 0) {
        // Delete existing physiologic signs
        await supabase
          .from('physiologic_signs')
          .delete()
          .eq('case_id', savedCaseId)

        // Insert new physiologic signs
        const physiologicSignsPayload = physiologicSigns
          .filter(s => s.sign_type)
          .map(s => ({
            ...s,
            case_id: savedCaseId,
          }))

        if (physiologicSignsPayload.length > 0) {
          const { error } = await supabase
            .from('physiologic_signs')
            .insert(physiologicSignsPayload)

          if (error) throw error
        }
      }

      // Save provenance records
      if (savedCaseId && provenance.size > 0) {
        const provenancePayload = Array.from(provenance.values())
          .filter(p => p.field_value)
          .map(p => ({
            ...p,
            case_id: savedCaseId,
            created_by: user.id,
          }))

        if (provenancePayload.length > 0) {
          const { error } = await supabase
            .from('field_provenance')
            .upsert(provenancePayload, { 
              onConflict: 'case_id,field_name,source,created_at' 
            })

          if (error) throw error
        }
      }

      setIsDirty(false)
      toast.success('Form saved successfully')

      // Redirect to the case if it was newly created
      if (!caseId && savedCaseId) {
        router.push(`/cases/${savedCaseId}`)
      }
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
    // Validate required fields
    const validationErrors: string[] = []
    
    if (!caseData.indication_category) {
      validationErrors.push('Indication for transfusion is required')
    }
    if (!caseData.complication_type) {
      validationErrors.push('Complication status is required')
    }
    if (vitalSigns.filter(v => v.met_status).length === 0) {
      validationErrors.push('At least one vital sign assessment is required')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    // Update status and save
    setCaseData(prev => ({ ...prev, status: 'pending_review' as CaseStatus }))
    await handleSave()
  }

  return (
    <div className="min-h-screen bg-background">
      <FormHeader
        formType={formType}
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

        {/* EMS Import button */}
        {onEmsImport && (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ems-badge/20">
                  <Upload className="h-5 w-5 text-ems-badge-foreground" />
                </div>
                <div>
                  <p className="font-medium">Import from EMS</p>
                  <p className="text-sm text-muted-foreground">
                    Pull patient data from ImageTrend Elite
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={onEmsImport}>
                Import Data
              </Button>
            </CardContent>
          </Card>
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
          provenanceSource={getFieldSource('patient_uid')}
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
          provenanceSource={getFieldSource('event_date')}
        />

        {/* Vital Signs */}
        <VitalSignsSection
          formType={formType}
          vitalSigns={vitalSigns}
          onVitalSignChange={handleVitalSignChange}
          sbpValue={sbpValue}
          hrValue={hrValue}
          patientAge={caseData.age}
          provenanceSource={getFieldSource('vital_signs')}
        />

        {/* Signs of Hypoperfusion */}
        <PhysiologicSignsSection
          formType={formType}
          physiologicSigns={physiologicSigns}
          onPhysiologicSignChange={handlePhysiologicSignChange}
          provenanceSource={getFieldSource('physiologic_signs')}
        />

        {/* Indication */}
        <IndicationSection
          indicationCategory={caseData.indication_category}
          indicationOtherDetails={caseData.indication_other_details}
          onIndicationChange={(v) => updateCaseField('indication_category', v)}
          onOtherDetailsChange={(v) => updateCaseField('indication_other_details', v)}
          provenanceSource={getFieldSource('indication_category')}
        />

        {/* Complications */}
        <ComplicationSection
          complicationType={caseData.complication_type}
          complicationDetails={caseData.complication_details}
          onComplicationChange={(v) => updateCaseField('complication_type', v)}
          onDetailsChange={(v) => updateCaseField('complication_details', v)}
          provenanceSource={getFieldSource('complication_type')}
        />

        {/* Disposition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-chart-2" />
              Disposition
            </CardTitle>
            <CardDescription>
              Patient outcome and blood bank notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="disposition">Patient Disposition</FieldLabel>
              <Select 
                value={caseData.patient_disposition} 
                onValueChange={(v) => updateCaseField('patient_disposition', v)}
              >
                <SelectTrigger id="disposition">
                  <SelectValue placeholder="Select disposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <div className="flex items-center gap-2">
                <FieldLabel>Blood Bank Notified</FieldLabel>
                {getFieldSource('blood_bank_notified') && (
                  <ProvenanceBadgeInline source={getFieldSource('blood_bank_notified')!} />
                )}
              </div>
              <FieldDescription>
                Was the receiving facility blood bank notified of the transfusion?
              </FieldDescription>
              <div className="flex gap-4 mt-2">
                {(['YES', 'NO', 'NOT_INDICATED'] as TriStateAnswer[]).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={caseData.blood_bank_notified === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateCaseField('blood_bank_notified', value)}
                  >
                    {value === 'YES' && <CheckCircle className="h-4 w-4 mr-1.5" />}
                    {value.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </Field>
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
            Submit for Review
          </Button>
        </div>
      </main>
    </div>
  )
}
