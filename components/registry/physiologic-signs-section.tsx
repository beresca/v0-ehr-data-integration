'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ProvenanceBadgeInline } from '@/components/registry/provenance-badge'
import type { PhysiologicSign, PresentStatus, DataSource, FormType } from '@/lib/types/registry'
import { Stethoscope, Brain, Eye, Clock, Wind, Check, X } from 'lucide-react'

interface PhysiologicSignDefinition {
  id: string
  type: PhysiologicSign['sign_type']
  description: string
  hasValue: boolean
  valueLabel?: string
  valuePlaceholder?: string
  icon: typeof Stethoscope
  pediatricOnly?: boolean
}

const PHYSIOLOGIC_SIGNS: PhysiologicSignDefinition[] = [
  { 
    id: 'rr', 
    type: 'rr', 
    description: 'RR < 10 or > 29', 
    hasValue: true,
    valueLabel: 'RR',
    valuePlaceholder: 'breaths/min',
    icon: Wind
  },
  { 
    id: 'etco2', 
    type: 'etco2', 
    description: 'ETCO₂ < 25 mmHg', 
    hasValue: true,
    valueLabel: 'ETCO₂',
    valuePlaceholder: 'mmHg',
    icon: Wind
  },
  { 
    id: 'altered_mental_status', 
    type: 'altered_mental_status', 
    description: 'Altered mental status', 
    hasValue: false,
    icon: Brain
  },
  { 
    id: 'pale_mucosa', 
    type: 'pale_mucosa', 
    description: 'Pale skin and/or mucous membranes', 
    hasValue: false,
    icon: Eye
  },
  { 
    id: 'capillary_refill', 
    type: 'capillary_refill', 
    description: 'Capillary refill > 2 seconds', 
    hasValue: true,
    valueLabel: 'Cap Refill',
    valuePlaceholder: 'seconds',
    icon: Clock
  },
  { 
    id: 'age_specific_tachypnea', 
    type: 'age_specific_tachypnea', 
    description: 'Age-specific tachypnea', 
    hasValue: true,
    valueLabel: 'RR',
    valuePlaceholder: 'breaths/min',
    icon: Wind,
    pediatricOnly: true
  },
]

interface PhysiologicSignsSectionProps {
  formType: FormType
  physiologicSigns: Partial<PhysiologicSign>[]
  onPhysiologicSignChange: (index: number, updates: Partial<PhysiologicSign>) => void
  provenanceSource?: DataSource
  readOnly?: boolean
}

export function PhysiologicSignsSection({
  formType,
  physiologicSigns,
  onPhysiologicSignChange,
  provenanceSource,
  readOnly = false,
}: PhysiologicSignsSectionProps) {
  const applicableSigns = PHYSIOLOGIC_SIGNS.filter(sign => 
    !sign.pediatricOnly || formType === 'pediatric_pi'
  )

  const getPhysiologicSign = (signType: string): Partial<PhysiologicSign> => {
    return physiologicSigns.find(s => s.sign_type === signType) || { sign_type: signType as PhysiologicSign['sign_type'] }
  }

  const updatePhysiologicSign = (signType: string, updates: Partial<PhysiologicSign>) => {
    const index = physiologicSigns.findIndex(s => s.sign_type === signType)
    if (index >= 0) {
      onPhysiologicSignChange(index, updates)
    } else {
      onPhysiologicSignChange(physiologicSigns.length, { 
        sign_type: signType as PhysiologicSign['sign_type'], 
        ...updates 
      })
    }
  }

  const presentCount = physiologicSigns.filter(s => s.present_status === 'PRESENT').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-chart-2" />
              Signs of Hypoperfusion
              {presentCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-chart-1/10 px-2.5 py-0.5 text-xs font-medium text-chart-1">
                  {presentCount} Present
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Clinical signs indicating physiologic compromise
            </CardDescription>
          </div>
          {provenanceSource && <ProvenanceBadgeInline source={provenanceSource} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applicableSigns.map((signDef) => {
            const sign = getPhysiologicSign(signDef.type)
            const Icon = signDef.icon

            return (
              <div 
                key={signDef.id}
                className={cn(
                  'grid grid-cols-1 md:grid-cols-[1fr,100px,180px] gap-4 p-4 rounded-lg border',
                  sign.present_status === 'PRESENT' && 'border-chart-1 bg-chart-1/5',
                  sign.present_status === 'NOT_PRESENT' && 'border-muted'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    sign.present_status === 'PRESENT' ? 'bg-chart-1/20 text-chart-1' : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{signDef.description}</p>
                    {signDef.pediatricOnly && (
                      <span className="text-xs text-muted-foreground">Pediatric assessment</span>
                    )}
                  </div>
                </div>

                {signDef.hasValue ? (
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">{signDef.valueLabel}</FieldLabel>
                    <Input
                      type="text"
                      value={sign.patient_value || ''}
                      onChange={(e) => updatePhysiologicSign(signDef.type, { 
                        patient_value: e.target.value,
                        description: signDef.description
                      })}
                      placeholder={signDef.valuePlaceholder}
                      disabled={readOnly}
                      className="font-mono"
                    />
                  </Field>
                ) : (
                  <div />
                )}

                <Field>
                  <FieldLabel className="text-xs text-muted-foreground">Present?</FieldLabel>
                  <RadioGroup
                    value={sign.present_status || ''}
                    onValueChange={(value) => updatePhysiologicSign(signDef.type, { 
                      present_status: value as PresentStatus,
                      description: signDef.description
                    })}
                    disabled={readOnly}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="PRESENT" id={`${signDef.id}-present`} />
                      <label htmlFor={`${signDef.id}-present`} className="flex items-center gap-1 text-sm cursor-pointer">
                        <Check className="h-3.5 w-3.5 text-success" />
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="NOT_PRESENT" id={`${signDef.id}-not-present`} />
                      <label htmlFor={`${signDef.id}-not-present`} className="flex items-center gap-1 text-sm cursor-pointer">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                        No
                      </label>
                    </div>
                  </RadioGroup>
                </Field>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
