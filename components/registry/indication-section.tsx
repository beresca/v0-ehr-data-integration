'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { ProvenanceBadgeInline } from '@/components/registry/provenance-badge'
import type { IndicationCategory, DataSource } from '@/lib/types/registry'
import { FileText, Syringe, Droplets, Baby, HelpCircle } from 'lucide-react'

interface IndicationOption {
  value: IndicationCategory
  label: string
  description: string
  icon: typeof FileText
}

const INDICATION_OPTIONS: IndicationOption[] = [
  {
    value: 'INJURY',
    label: 'Injury / Trauma',
    description: 'Traumatic injury with hemorrhage',
    icon: Syringe,
  },
  {
    value: 'GI_BLEED',
    label: 'GI Bleed',
    description: 'Gastrointestinal hemorrhage',
    icon: Droplets,
  },
  {
    value: 'OBSTETRIC_GYNECOLOGIC',
    label: 'Obstetric / Gynecologic',
    description: 'Obstetric or gynecologic hemorrhage',
    icon: Baby,
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Specify the indication',
    icon: HelpCircle,
  },
]

interface IndicationSectionProps {
  indicationCategory?: IndicationCategory
  indicationOtherDetails?: string
  onIndicationChange: (category: IndicationCategory) => void
  onOtherDetailsChange: (details: string) => void
  provenanceSource?: DataSource
  readOnly?: boolean
}

export function IndicationSection({
  indicationCategory,
  indicationOtherDetails,
  onIndicationChange,
  onOtherDetailsChange,
  provenanceSource,
  readOnly = false,
}: IndicationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-chart-3" />
              Indication for Transfusion
            </CardTitle>
            <CardDescription>
              Primary reason for initiating blood product transfusion
            </CardDescription>
          </div>
          {provenanceSource && <ProvenanceBadgeInline source={provenanceSource} />}
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={indicationCategory}
          onValueChange={(value) => onIndicationChange(value as IndicationCategory)}
          disabled={readOnly}
          className="grid gap-3"
        >
          {INDICATION_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = indicationCategory === option.value

            return (
              <div key={option.value}>
                <label
                  htmlFor={`indication-${option.value}`}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                    readOnly && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={`indication-${option.value}`}
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

                {option.value === 'OTHER' && isSelected && (
                  <div className="mt-3 ml-14">
                    <Field>
                      <FieldLabel>Specify other indication</FieldLabel>
                      <Textarea
                        value={indicationOtherDetails || ''}
                        onChange={(e) => onOtherDetailsChange(e.target.value)}
                        placeholder="Describe the indication for transfusion..."
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
