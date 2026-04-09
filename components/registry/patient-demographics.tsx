'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { ProvenanceBadgeInline } from '@/components/registry/provenance-badge'
import type { DataSource } from '@/lib/types/registry'
import { User } from 'lucide-react'

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'U', label: 'Unknown' },
]

const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'UNK', label: 'Unknown' },
]

interface PatientDemographicsProps {
  patientUid?: string
  patientMrn?: string
  age?: number
  gender?: string
  bloodType?: string
  onPatientUidChange: (value: string) => void
  onPatientMrnChange: (value: string) => void
  onAgeChange: (value: number | undefined) => void
  onGenderChange: (value: string) => void
  onBloodTypeChange: (value: string) => void
  provenanceSource?: DataSource
  readOnly?: boolean
}

export function PatientDemographics({
  patientUid,
  patientMrn,
  age,
  gender,
  bloodType,
  onPatientUidChange,
  onPatientMrnChange,
  onAgeChange,
  onGenderChange,
  onBloodTypeChange,
  provenanceSource,
  readOnly = false,
}: PatientDemographicsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient Demographics
            </CardTitle>
            <CardDescription>
              Patient identification and demographic information
            </CardDescription>
          </div>
          {provenanceSource && <ProvenanceBadgeInline source={provenanceSource} />}
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="patient-uid">Patient UID</FieldLabel>
              <Input
                id="patient-uid"
                value={patientUid || ''}
                onChange={(e) => onPatientUidChange(e.target.value)}
                placeholder="Unique identifier"
                disabled={readOnly}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="patient-mrn">MRN</FieldLabel>
              <Input
                id="patient-mrn"
                value={patientMrn || ''}
                onChange={(e) => onPatientMrnChange(e.target.value)}
                placeholder="Medical record number"
                disabled={readOnly}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field>
              <FieldLabel htmlFor="patient-age">Age</FieldLabel>
              <Input
                id="patient-age"
                type="number"
                min={0}
                max={150}
                value={age !== undefined ? age : ''}
                onChange={(e) => onAgeChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Years"
                disabled={readOnly}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="patient-gender">Gender</FieldLabel>
              <Select value={gender} onValueChange={onGenderChange} disabled={readOnly}>
                <SelectTrigger id="patient-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="blood-type">Blood Type</FieldLabel>
              <Select value={bloodType} onValueChange={onBloodTypeChange} disabled={readOnly}>
                <SelectTrigger id="blood-type">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
