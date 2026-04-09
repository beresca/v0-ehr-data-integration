'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Field, FieldLabel, FieldDescription, FieldError, FieldContent } from '@/components/ui/field'
import { ProvenanceBadgeInline } from '@/components/registry/provenance-badge'
import type { DataSource, ProvenanceField as ProvenanceFieldType } from '@/lib/types/registry'
import { AlertTriangle } from 'lucide-react'

interface BaseProvenanceFieldProps {
  label: string
  description?: string
  error?: string
  required?: boolean
  source?: DataSource
  hasConflict?: boolean
  className?: string
  disabled?: boolean
}

interface ProvenanceInputFieldProps extends BaseProvenanceFieldProps {
  type: 'text' | 'number' | 'date' | 'datetime-local'
  value: string | number | undefined
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
}

interface ProvenanceSelectFieldProps extends BaseProvenanceFieldProps {
  type: 'select'
  value: string | undefined
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

interface ProvenanceCheckboxFieldProps extends BaseProvenanceFieldProps {
  type: 'checkbox'
  checked: boolean | undefined
  onChange: (checked: boolean) => void
}

interface ProvenanceRadioFieldProps extends BaseProvenanceFieldProps {
  type: 'radio'
  value: string | undefined
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

interface ProvenanceTriStateFieldProps extends BaseProvenanceFieldProps {
  type: 'tristate'
  value: 'YES' | 'NO' | 'NOT_INDICATED' | undefined
  onChange: (value: 'YES' | 'NO' | 'NOT_INDICATED') => void
}

export type ProvenanceFieldProps = 
  | ProvenanceInputFieldProps
  | ProvenanceSelectFieldProps
  | ProvenanceCheckboxFieldProps
  | ProvenanceRadioFieldProps
  | ProvenanceTriStateFieldProps

export function ProvenanceFieldWrapper({
  label,
  description,
  error,
  required,
  source,
  hasConflict,
  className,
  disabled,
  children,
}: BaseProvenanceFieldProps & { children: React.ReactNode }) {
  return (
    <Field 
      data-invalid={!!error} 
      data-disabled={disabled}
      className={cn(
        hasConflict && 'ring-2 ring-warning ring-offset-2 rounded-lg p-2',
        className
      )}
    >
      <FieldContent>
        <div className="flex items-center gap-2">
          <FieldLabel className="flex items-center gap-1.5">
            {label}
            {required && <span className="text-destructive">*</span>}
          </FieldLabel>
          {source && <ProvenanceBadgeInline source={source} />}
          {hasConflict && (
            <span className="inline-flex items-center gap-1 text-warning text-xs">
              <AlertTriangle className="h-3 w-3" />
              Conflict
            </span>
          )}
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
        {children}
        {error && <FieldError>{error}</FieldError>}
      </FieldContent>
    </Field>
  )
}

export function ProvenanceInputField({
  type,
  value,
  onChange,
  placeholder,
  min,
  max,
  ...wrapperProps
}: ProvenanceInputFieldProps) {
  const id = useId()
  
  return (
    <ProvenanceFieldWrapper {...wrapperProps}>
      <Input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={wrapperProps.disabled}
        className={cn(
          wrapperProps.source === 'EMS' && 'border-ems-badge/50',
          wrapperProps.source === 'EHR' && 'border-ehr-badge/50',
        )}
      />
    </ProvenanceFieldWrapper>
  )
}

export function ProvenanceSelectField({
  value,
  onChange,
  options,
  placeholder,
  ...wrapperProps
}: ProvenanceSelectFieldProps) {
  const id = useId()
  
  return (
    <ProvenanceFieldWrapper {...wrapperProps}>
      <Select value={value} onValueChange={onChange} disabled={wrapperProps.disabled}>
        <SelectTrigger 
          id={id}
          className={cn(
            wrapperProps.source === 'EMS' && 'border-ems-badge/50',
            wrapperProps.source === 'EHR' && 'border-ehr-badge/50',
          )}
        >
          <SelectValue placeholder={placeholder || 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ProvenanceFieldWrapper>
  )
}

export function ProvenanceCheckboxField({
  checked,
  onChange,
  ...wrapperProps
}: ProvenanceCheckboxFieldProps) {
  const id = useId()
  
  return (
    <Field 
      orientation="horizontal"
      data-invalid={!!wrapperProps.error}
      data-disabled={wrapperProps.disabled}
      className={cn(
        wrapperProps.hasConflict && 'ring-2 ring-warning ring-offset-2 rounded-lg p-2',
        wrapperProps.className
      )}
    >
      <Checkbox
        id={id}
        checked={checked ?? false}
        onCheckedChange={onChange}
        disabled={wrapperProps.disabled}
      />
      <FieldContent>
        <div className="flex items-center gap-2">
          <FieldLabel htmlFor={id} className="cursor-pointer">
            {wrapperProps.label}
            {wrapperProps.required && <span className="text-destructive">*</span>}
          </FieldLabel>
          {wrapperProps.source && <ProvenanceBadgeInline source={wrapperProps.source} />}
        </div>
        {wrapperProps.description && <FieldDescription>{wrapperProps.description}</FieldDescription>}
        {wrapperProps.error && <FieldError>{wrapperProps.error}</FieldError>}
      </FieldContent>
    </Field>
  )
}

export function ProvenanceRadioField({
  value,
  onChange,
  options,
  ...wrapperProps
}: ProvenanceRadioFieldProps) {
  return (
    <ProvenanceFieldWrapper {...wrapperProps}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={wrapperProps.disabled}
        className="flex flex-wrap gap-4"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={`${wrapperProps.label}-${option.value}`} />
            <label 
              htmlFor={`${wrapperProps.label}-${option.value}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup>
    </ProvenanceFieldWrapper>
  )
}

export function ProvenanceTriStateField({
  value,
  onChange,
  ...wrapperProps
}: ProvenanceTriStateFieldProps) {
  return (
    <ProvenanceRadioField
      {...wrapperProps}
      type="radio"
      value={value}
      onChange={onChange as (value: string) => void}
      options={[
        { value: 'YES', label: 'Yes' },
        { value: 'NO', label: 'No' },
        { value: 'NOT_INDICATED', label: 'Not Indicated' },
      ]}
    />
  )
}

// A wrapper to make any field provenance-aware by tracking the source
export function withProvenance<T>(
  fieldValue: T | undefined,
  source: DataSource | undefined,
  onValueChange: (value: T, source: DataSource) => void
): {
  value: T | undefined
  source: DataSource | undefined
  onChange: (value: T) => void
} {
  return {
    value: fieldValue,
    source,
    onChange: (value: T) => onValueChange(value, source || 'MANUAL'),
  }
}
