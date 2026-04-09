'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel } from '@/components/ui/field'
import { ProvenanceBadgeInline } from '@/components/registry/provenance-badge'
import type { ComplicationType, DataSource } from '@/lib/types/registry'
import { AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react'

interface ComplicationOption {
  value: ComplicationType
  label: string
  description: string
  icon: typeof AlertTriangle
  iconColor: string
}

const COMPLICATION_OPTIONS: ComplicationOption[] = [
  {
    value: 'NONE',
    label: 'None',
    description: 'No complications observed',
    icon: CheckCircle,
    iconColor: 'text-success',
  },
  {
    value: 'TRANSFUSION_REACTION',
    label: 'Transfusion Reaction',
    description: 'Adverse reaction to blood product',
    icon: XCircle,
    iconColor: 'text-destructive',
  },
  {
    value: 'OTHER',
    label: 'Other Complication',
    description: 'Specify the complication',
    icon: HelpCircle,
    iconColor: 'text-warning',
  },
]

interface ComplicationSectionProps {
  complicationType?: ComplicationType
  complicationDetails?: string
  onComplicationChange: (type: ComplicationType) => void
  onDetailsChange: (details: string) => void
  provenanceSource?: DataSource
  readOnly?: boolean
}

export function ComplicationSection({
  complicationType,
  complicationDetails,
  onComplicationChange,
  onDetailsChange,
  provenanceSource,
  readOnly = false,
}: ComplicationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Complications
            </CardTitle>
            <CardDescription>
              Document any complications during or after transfusion
            </CardDescription>
          </div>
          {provenanceSource && <ProvenanceBadgeInline source={provenanceSource} />}
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={complicationType}
          onValueChange={(value) => onComplicationChange(value as ComplicationType)}
          disabled={readOnly}
          className="grid gap-3"
        >
          {COMPLICATION_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = complicationType === option.value

            return (
              <div key={option.value}>
                <label
                  htmlFor={`complication-${option.value}`}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                    readOnly && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={`complication-${option.value}`}
                    className="mt-0.5"
                  />
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    isSelected ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Icon className={cn('h-5 w-5', option.iconColor)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </label>

                {(option.value === 'TRANSFUSION_REACTION' || option.value === 'OTHER') && isSelected && (
                  <div className="mt-3 ml-14">
                    <Field>
                      <FieldLabel>
                        {option.value === 'TRANSFUSION_REACTION' 
                          ? 'Describe the transfusion reaction'
                          : 'Describe the complication'}
                      </FieldLabel>
                      <Textarea
                        value={complicationDetails || ''}
                        onChange={(e) => onDetailsChange(e.target.value)}
                        placeholder={
                          option.value === 'TRANSFUSION_REACTION'
                            ? 'Signs, symptoms, timing, interventions...'
                            : 'Describe the complication...'
                        }
                        disabled={readOnly}
                        rows={3}
                      />
                    </Field>
                  </div>
                )}
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
