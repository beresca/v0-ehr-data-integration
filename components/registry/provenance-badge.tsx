'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import type { DataSource, FieldProvenance } from '@/lib/types/registry'
import { Ambulance, Hospital, PencilLine, Clock, User, Info } from 'lucide-react'

interface ProvenanceBadgeProps {
  source: DataSource
  sourceSystem?: string
  recordedAt?: string
  createdBy?: string
  className?: string
  showDetails?: boolean
  provenanceHistory?: FieldProvenance[]
}

const sourceConfig: Record<DataSource, { 
  label: string
  icon: typeof Ambulance
  className: string
}> = {
  EMS: {
    label: 'EMS',
    icon: Ambulance,
    className: 'bg-ems-badge text-ems-badge-foreground',
  },
  EHR: {
    label: 'EHR',
    icon: Hospital,
    className: 'bg-ehr-badge text-ehr-badge-foreground',
  },
  MANUAL: {
    label: 'Manual',
    icon: PencilLine,
    className: 'bg-manual-badge text-manual-badge-foreground',
  },
}

export function ProvenanceBadge({
  source,
  sourceSystem,
  recordedAt,
  createdBy,
  className,
  showDetails = true,
  provenanceHistory,
}: ProvenanceBadgeProps) {
  const [open, setOpen] = useState(false)
  const config = sourceConfig[source]
  const Icon = config.icon

  const formattedDate = recordedAt
    ? new Date(recordedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null

  if (!showDetails) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
          config.className,
          className
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-80',
            config.className,
            className
          )}
          aria-label={`Data source: ${config.label}. Click for details.`}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              config.className
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">Data Source: {config.label}</p>
              {sourceSystem && (
                <p className="text-xs text-muted-foreground">{sourceSystem}</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {formattedDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>
          )}
          {createdBy && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{createdBy}</span>
            </div>
          )}
        </div>
        {provenanceHistory && provenanceHistory.length > 1 && (
          <div className="border-t p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Change History ({provenanceHistory.length} entries)
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {provenanceHistory.slice(0, 5).map((entry, idx) => (
                <div key={entry.id || idx} className="flex items-start gap-2 text-xs">
                  <span className={cn(
                    'inline-flex items-center gap-0.5 rounded px-1 py-0.5 shrink-0',
                    sourceConfig[entry.source].className
                  )}>
                    {entry.source}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {entry.field_value || '(empty)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Compact inline badge for form fields
export function ProvenanceBadgeInline({
  source,
  className,
}: {
  source: DataSource
  className?: string
}) {
  const config = sourceConfig[source]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium leading-none',
        config.className,
        className
      )}
      title={`Source: ${config.label}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  )
}
