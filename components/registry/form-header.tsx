'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { FormType, CaseStatus } from '@/lib/types/registry'
import { 
  Droplet, 
  Baby, 
  AlertCircle, 
  Building2, 
  ArrowLeft, 
  Save, 
  Send,
  FileCheck,
  Clock,
  CheckCircle
} from 'lucide-react'

interface FormHeaderProps {
  formType: FormType
  caseNumber?: string
  status: CaseStatus
  onBack?: () => void
  onSave?: () => void
  onSubmit?: () => void
  isSaving?: boolean
  isDirty?: boolean
}

const FORM_CONFIG: Record<FormType, { 
  title: string
  subtitle: string
  icon: typeof Droplet
  color: string
}> = {
  adult_pi: {
    title: 'Adult Prehospital Blood Transfusion',
    subtitle: 'Performance Improvement Form',
    icon: Droplet,
    color: 'text-chart-1',
  },
  pediatric_pi: {
    title: 'Pediatric Prehospital Blood Transfusion',
    subtitle: 'Performance Improvement Form',
    icon: Baby,
    color: 'text-chart-4',
  },
  emergency_release: {
    title: 'Emergency Release',
    subtitle: 'Prehospital Blood Product Request',
    icon: AlertCircle,
    color: 'text-destructive',
  },
  blood_bank: {
    title: 'Blood Bank Follow-up',
    subtitle: 'Rh-Negative Patient Documentation',
    icon: Building2,
    color: 'text-chart-2',
  },
}

const STATUS_CONFIG: Record<CaseStatus, {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
  icon: typeof Clock
}> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    icon: Clock,
  },
  pending_review: {
    label: 'Pending Review',
    variant: 'outline',
    icon: FileCheck,
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    icon: CheckCircle,
  },
  submitted_to_rac: {
    label: 'Submitted to RAC',
    variant: 'default',
    icon: Send,
  },
}

export function FormHeader({
  formType,
  caseNumber,
  status,
  onBack,
  onSave,
  onSubmit,
  isSaving = false,
  isDirty = false,
}: FormHeaderProps) {
  const formConfig = FORM_CONFIG[formType]
  const statusConfig = STATUS_CONFIG[status]
  const Icon = formConfig.icon
  const StatusIcon = statusConfig.icon

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {onBack && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="shrink-0 mt-1"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            )}
            <div className="flex items-start gap-3">
              <div className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10',
                formConfig.color
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-balance">
                  {formConfig.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {formConfig.subtitle}
                  </span>
                  {caseNumber && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {caseNumber}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-16 md:ml-0">
            <Badge variant={statusConfig.variant} className="gap-1.5">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
            
            {isDirty && (
              <span className="text-xs text-muted-foreground">Unsaved changes</span>
            )}

            <div className="flex items-center gap-2">
              {onSave && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onSave}
                  disabled={isSaving || !isDirty}
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Draft
                </Button>
              )}
              {onSubmit && status !== 'submitted_to_rac' && (
                <Button 
                  size="sm" 
                  onClick={onSubmit}
                  disabled={isSaving}
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
