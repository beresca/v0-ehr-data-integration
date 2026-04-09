'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { ProvenanceBadgeInline } from '@/components/registry/provenance-badge'
import type { VitalSign, MetStatus, DataSource, FormType } from '@/lib/types/registry'
import { Heart, Activity, TrendingDown, TrendingUp, Calculator, Check, X } from 'lucide-react'

interface VitalThreshold {
  id: string
  type: string
  description: string
  threshold: number | string
  operator: '<' | '>' | '='
  unit?: string
  icon: typeof Heart
}

const ADULT_THRESHOLDS: VitalThreshold[] = [
  { 
    id: 'sbp', 
    type: 'sbp', 
    description: 'Systolic Blood Pressure', 
    threshold: 90, 
    operator: '<', 
    unit: 'mmHg',
    icon: TrendingDown
  },
  { 
    id: 'hr', 
    type: 'hr', 
    description: 'Heart Rate', 
    threshold: 120, 
    operator: '>', 
    unit: 'bpm',
    icon: Heart
  },
  { 
    id: 'shock_index', 
    type: 'shock_index', 
    description: 'Shock Index (HR/SBP)', 
    threshold: 1, 
    operator: '>', 
    unit: '',
    icon: Calculator
  },
]

const PEDIATRIC_THRESHOLDS: VitalThreshold[] = [
  { 
    id: 'hr_under1', 
    type: 'hr_pediatric_under1', 
    description: 'Heart Rate (< 1 year)', 
    threshold: 180, 
    operator: '>', 
    unit: 'bpm',
    icon: Heart
  },
  { 
    id: 'hr_2to10', 
    type: 'hr_pediatric_2to10', 
    description: 'Heart Rate (2-10 years)', 
    threshold: 140, 
    operator: '>', 
    unit: 'bpm',
    icon: Heart
  },
  { 
    id: 'sbp_peds', 
    type: 'sbp_pediatric', 
    description: 'SBP < 70 + (2 × age)', 
    threshold: '70 + (2 × age)', 
    operator: '<', 
    unit: 'mmHg',
    icon: TrendingDown
  },
]

interface VitalSignsSectionProps {
  formType: FormType
  vitalSigns: Partial<VitalSign>[]
  onVitalSignChange: (index: number, updates: Partial<VitalSign>) => void
  sbpValue?: number
  hrValue?: number
  patientAge?: number
  provenanceSource?: DataSource
  readOnly?: boolean
}

export function VitalSignsSection({
  formType,
  vitalSigns,
  onVitalSignChange,
  sbpValue,
  hrValue,
  patientAge,
  provenanceSource,
  readOnly = false,
}: VitalSignsSectionProps) {
  const thresholds = formType === 'pediatric_pi' ? PEDIATRIC_THRESHOLDS : ADULT_THRESHOLDS
  
  // Calculate shock index automatically if we have both HR and SBP
  const calculatedShockIndex = useMemo(() => {
    if (hrValue && sbpValue && sbpValue > 0) {
      return (hrValue / sbpValue).toFixed(2)
    }
    return null
  }, [hrValue, sbpValue])

  // Calculate pediatric SBP threshold
  const pediatricSbpThreshold = useMemo(() => {
    if (patientAge !== undefined && patientAge >= 0) {
      return 70 + (2 * patientAge)
    }
    return null
  }, [patientAge])

  const getVitalSign = (thresholdType: string): Partial<VitalSign> => {
    return vitalSigns.find(v => v.vital_type === thresholdType) || { vital_type: thresholdType as VitalSign['vital_type'] }
  }

  const updateVitalSign = (thresholdType: string, updates: Partial<VitalSign>) => {
    const index = vitalSigns.findIndex(v => v.vital_type === thresholdType)
    if (index >= 0) {
      onVitalSignChange(index, updates)
    } else {
      onVitalSignChange(vitalSigns.length, { vital_type: thresholdType as VitalSign['vital_type'], ...updates })
    }
  }

  const evaluateThreshold = (threshold: VitalThreshold, value: number | undefined): boolean | null => {
    if (value === undefined || value === null) return null
    
    let thresholdValue: number
    if (threshold.type === 'sbp_pediatric' && pediatricSbpThreshold !== null) {
      thresholdValue = pediatricSbpThreshold
    } else if (typeof threshold.threshold === 'number') {
      thresholdValue = threshold.threshold
    } else {
      return null
    }

    switch (threshold.operator) {
      case '<': return value < thresholdValue
      case '>': return value > thresholdValue
      case '=': return value === thresholdValue
      default: return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-chart-1" />
              Vital Signs Assessment
            </CardTitle>
            <CardDescription>
              {formType === 'pediatric_pi' 
                ? 'Age-specific criteria for pediatric patients'
                : 'Adult vital sign thresholds for transfusion indication'}
            </CardDescription>
          </div>
          {provenanceSource && <ProvenanceBadgeInline source={provenanceSource} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Auto-calculated values display */}
          {formType === 'adult_pi' && calculatedShockIndex && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Calculated Shock Index: <strong>{calculatedShockIndex}</strong>
                {parseFloat(calculatedShockIndex) > 1 && (
                  <Badge variant="destructive" className="ml-2">Elevated</Badge>
                )}
              </span>
            </div>
          )}

          {formType === 'pediatric_pi' && pediatricSbpThreshold !== null && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Calculated SBP threshold (70 + 2×{patientAge}): <strong>{pediatricSbpThreshold} mmHg</strong>
              </span>
            </div>
          )}

          {/* Vital sign threshold rows */}
          <div className="space-y-4">
            {thresholds.map((threshold) => {
              const vital = getVitalSign(threshold.type)
              const Icon = threshold.icon
              const patientValue = vital.patient_value ? parseFloat(vital.patient_value) : undefined
              const autoEvaluation = evaluateThreshold(threshold, patientValue)
              
              // For shock index, use calculated value
              const displayValue = threshold.type === 'shock_index' && calculatedShockIndex
                ? calculatedShockIndex
                : vital.patient_value

              return (
                <div 
                  key={threshold.id}
                  className={cn(
                    'grid grid-cols-1 md:grid-cols-[1fr,120px,180px] gap-4 p-4 rounded-lg border',
                    vital.met_status === 'MET' && 'border-chart-1 bg-chart-1/5',
                    vital.met_status === 'NOT_MET' && 'border-muted'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      vital.met_status === 'MET' ? 'bg-chart-1/20 text-chart-1' : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{threshold.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Threshold: {threshold.operator} {threshold.threshold} {threshold.unit}
                      </p>
                    </div>
                  </div>

                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Patient Value</FieldLabel>
                    {threshold.type === 'shock_index' ? (
                      <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm font-mono">
                        {displayValue || '—'}
                      </div>
                    ) : (
                      <Input
                        type="number"
                        value={vital.patient_value || ''}
                        onChange={(e) => updateVitalSign(threshold.type, { 
                          patient_value: e.target.value,
                          threshold_description: `${threshold.description} ${threshold.operator} ${threshold.threshold}`
                        })}
                        placeholder={threshold.unit}
                        disabled={readOnly}
                        className="font-mono"
                      />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Criteria Met?</FieldLabel>
                    <RadioGroup
                      value={vital.met_status || ''}
                      onValueChange={(value) => updateVitalSign(threshold.type, { 
                        met_status: value as MetStatus,
                        threshold_description: `${threshold.description} ${threshold.operator} ${threshold.threshold}`
                      })}
                      disabled={readOnly}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="MET" id={`${threshold.id}-met`} />
                        <label htmlFor={`${threshold.id}-met`} className="flex items-center gap-1 text-sm cursor-pointer">
                          <Check className="h-3.5 w-3.5 text-success" />
                          Met
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="NOT_MET" id={`${threshold.id}-not-met`} />
                        <label htmlFor={`${threshold.id}-not-met`} className="flex items-center gap-1 text-sm cursor-pointer">
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                          Not Met
                        </label>
                      </div>
                    </RadioGroup>
                    {autoEvaluation !== null && vital.met_status && autoEvaluation !== (vital.met_status === 'MET') && (
                      <p className="text-xs text-warning mt-1">
                        Auto-calculation suggests: {autoEvaluation ? 'Met' : 'Not Met'}
                      </p>
                    )}
                  </Field>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
