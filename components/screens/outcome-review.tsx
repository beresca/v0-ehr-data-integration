'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  Droplet,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Pencil,
  Check,
  X,
  ChevronsDown,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type AbnormalStatus = 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high'

interface LabRow {
  key: string
  test: string
  ehrValue: string | null     // value pulled from EHR
  manualValue: string | null  // value entered manually
  accepted: boolean           // user has accepted EHR value
  overridden: boolean         // user overrode with manual
  unit: string
  refRange: string
  criticalLow?: number
  criticalHigh?: number
  normalLow?: number
  normalHigh?: number
  isCategorical?: boolean
  requiresManual?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseNumeric(val: string | null): number | null {
  if (!val) return null
  const n = parseFloat(val.replace(/[^\d.-]/g, ''))
  return isNaN(n) ? null : n
}

function getAbnormalStatus(lab: LabRow): AbnormalStatus {
  if (lab.isCategorical) return 'normal'
  const displayVal = lab.overridden ? lab.manualValue : lab.ehrValue
  const n = parseNumeric(displayVal)
  if (n === null) return 'normal'
  if (lab.criticalLow !== undefined && n <= lab.criticalLow) return 'critical-low'
  if (lab.criticalHigh !== undefined && n >= lab.criticalHigh) return 'critical-high'
  if (lab.normalLow !== undefined && n < lab.normalLow) return 'low'
  if (lab.normalHigh !== undefined && n > lab.normalHigh) return 'high'
  return 'normal'
}

function statusConfig(status: AbnormalStatus) {
  switch (status) {
    case 'critical-low':
    case 'critical-high':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-700 border-red-300',
        icon: <AlertCircle className="h-3.5 w-3.5 text-red-600" />,
        label: status === 'critical-low' ? 'Critical Low' : 'Critical High',
      }
    case 'low':
    case 'high':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-300',
        badge: 'bg-amber-100 text-amber-700 border-amber-300',
        icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
        label: status === 'low' ? 'Low' : 'High',
      }
    default:
      return {
        bg: '',
        text: '',
        border: '',
        badge: '',
        icon: null,
        label: '',
      }
  }
}

function AutoFilledBadge() {
  return (
    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 text-xs gap-1">
      <Sparkles className="h-3 w-3" />
      EHR
    </Badge>
  )
}

// ─── Initial Lab Data ─────────────────────────────────────────────────────────

const INITIAL_LABS: LabRow[] = [
  {
    key: 'hgb',
    test: 'Hemoglobin',
    ehrValue: '7.2',
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: 'g/dL',
    refRange: '12.0 – 17.5',
    normalLow: 12.0,
    normalHigh: 17.5,
    criticalLow: 7.0,
    criticalHigh: 20.0,
  },
  {
    key: 'inr',
    test: 'INR',
    ehrValue: '1.8',
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: '',
    refRange: '0.8 – 1.2',
    normalLow: 0.8,
    normalHigh: 1.2,
    criticalLow: 0.5,
    criticalHigh: 3.0,
  },
  {
    key: 'plt',
    test: 'Platelets',
    ehrValue: '89',
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: 'k/uL',
    refRange: '150 – 400',
    normalLow: 150,
    normalHigh: 400,
    criticalLow: 50,
    criticalHigh: 1000,
  },
  {
    key: 'lac',
    test: 'Lactate',
    ehrValue: '4.2',
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: 'mmol/L',
    refRange: '0.5 – 2.0',
    normalLow: 0.5,
    normalHigh: 2.0,
    criticalLow: 0,
    criticalHigh: 10.0,
  },
  {
    key: 'ica',
    test: 'Ionized Calcium',
    ehrValue: '0.98',
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: 'mmol/L',
    refRange: '1.12 – 1.32',
    normalLow: 1.12,
    normalHigh: 1.32,
    criticalLow: 0.75,
    criticalHigh: 1.58,
  },
  {
    key: 'fibrinogen',
    test: 'Fibrinogen',
    ehrValue: '148',
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: 'mg/dL',
    refRange: '200 – 400',
    normalLow: 200,
    normalHigh: 400,
    criticalLow: 100,
    criticalHigh: 700,
  },
  {
    key: 'btype',
    test: 'Blood Type / Rh',
    ehrValue: 'O Positive',
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: '',
    refRange: '—',
    isCategorical: true,
  },
  {
    key: 'hcg',
    test: 'hCG Qualitative',
    ehrValue: 'Negative',
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: '',
    refRange: 'Negative',
    isCategorical: true,
  },
  {
    key: 'teg',
    test: 'TEG / ROTEM',
    ehrValue: null,
    manualValue: null,
    accepted: false,
    overridden: false,
    unit: '',
    refRange: 'See report',
    isCategorical: true,
    requiresManual: true,
  },
]

// ─── Lab Row Component ────────────────────────────────────────────────────────

function LabTableRow({
  lab,
  onAccept,
  onOverride,
  onManualChange,
  onCancelOverride,
}: {
  lab: LabRow
  onAccept: (key: string) => void
  onOverride: (key: string) => void
  onManualChange: (key: string, val: string) => void
  onCancelOverride: (key: string) => void
}) {
  const [editingManual, setEditingManual] = useState(lab.requiresManual || false)
  const status = getAbnormalStatus(lab)
  const cfg = statusConfig(status)
  const hasEHR = lab.ehrValue !== null
  const displayVal = lab.overridden ? lab.manualValue : lab.ehrValue
  const isResolved = lab.accepted || lab.overridden || lab.requiresManual

  return (
    <TableRow className={cn(
      'transition-colors',
      status !== 'normal' && !lab.accepted && !lab.overridden ? cfg.bg : '',
      lab.accepted ? 'bg-green-50/50' : '',
    )}>
      {/* Test name */}
      <TableCell className="font-medium py-2">
        <div className="flex items-center gap-1.5">
          {status !== 'normal' && cfg.icon}
          <span className={cn(status !== 'normal' && !lab.accepted ? cfg.text : '')}>{lab.test}</span>
        </div>
      </TableCell>

      {/* Result */}
      <TableCell className="py-2">
        {lab.overridden || lab.requiresManual ? (
          <div className="flex items-center gap-2">
            <Input
              value={lab.manualValue ?? ''}
              onChange={(e) => onManualChange(lab.key, e.target.value)}
              placeholder="Enter value"
              className={cn('h-7 w-28 text-sm', lab.overridden ? 'border-amber-400 focus-visible:ring-amber-400' : '')}
              autoFocus={editingManual}
            />
            {lab.overridden && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onCancelOverride(lab.key)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Restore EHR value</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : hasEHR ? (
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-mono text-sm font-semibold',
              status === 'critical-low' || status === 'critical-high' ? 'text-red-700' : '',
              status === 'low' || status === 'high' ? 'text-amber-700' : '',
              lab.accepted ? 'text-green-700' : '',
            )}>
              {displayVal} <span className="font-normal text-muted-foreground text-xs">{lab.unit}</span>
            </span>
            {status !== 'normal' && !lab.accepted && (
              <Badge variant="outline" className={cn('text-xs border', cfg.badge)}>
                {cfg.label}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm italic">No EHR value</span>
        )}
      </TableCell>

      {/* Reference Range */}
      <TableCell className="py-2 text-xs text-muted-foreground font-mono">
        {lab.refRange}
      </TableCell>

      {/* Source */}
      <TableCell className="py-2">
        {lab.overridden ? (
          <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-700 gap-1">
            <Pencil className="h-2.5 w-2.5" />
            Manual override
          </Badge>
        ) : hasEHR ? (
          <AutoFilledBadge />
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Manual entry
          </Badge>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-2">
        {lab.accepted ? (
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <Check className="h-3.5 w-3.5" />
            Accepted
          </div>
        ) : hasEHR && !lab.overridden ? (
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 border-green-300 text-green-700 hover:bg-green-50 text-xs"
                    onClick={() => onAccept(lab.key)}
                  >
                    <Check className="h-3 w-3" />
                    Accept
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Accept EHR value as-is</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-amber-700"
                    onClick={() => { onOverride(lab.key); setEditingManual(true) }}
                  >
                    <Pencil className="h-3 w-3" />
                    Override
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enter a different value</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : null}
      </TableCell>
    </TableRow>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OutcomeReview() {
  const [labs, setLabs] = useState<LabRow[]>(INITIAL_LABS)
  const [interventions, setInterventions] = useState({
    laparotomy: true,
    intubation: true,
    thoracotomy: false,
    reboa: false,
    angiography: false,
    txa: false,
    acReversal: false,
  })
  const [mtpRecipient, setMtpRecipient] = useState(false)
  const [alive30Days, setAlive30Days] = useState<boolean | null>(true)
  const [neuroOutcome, setNeuroOutcome] = useState<string>('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // ── Lab handlers ────────────────────────────────────────────────────────────
  function acceptLab(key: string) {
    setLabs((prev) => prev.map((l) => l.key === key ? { ...l, accepted: true, overridden: false } : l))
  }

  function overrideLab(key: string) {
    setLabs((prev) => prev.map((l) => l.key === key ? { ...l, overridden: true, accepted: false } : l))
  }

  function manualChange(key: string, val: string) {
    setLabs((prev) => prev.map((l) => l.key === key ? { ...l, manualValue: val } : l))
  }

  function cancelOverride(key: string) {
    setLabs((prev) => prev.map((l) => l.key === key ? { ...l, overridden: false, manualValue: null } : l))
  }

  function acceptAllEHR() {
    setLabs((prev) => prev.map((l) => l.ehrValue && !l.overridden ? { ...l, accepted: true } : l))
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const criticalUnresolved = labs.filter((l) => {
    const s = getAbnormalStatus(l)
    return (s === 'critical-low' || s === 'critical-high') && !l.accepted && !l.overridden
  })

  const abnormalUnresolved = labs.filter((l) => {
    const s = getAbnormalStatus(l)
    return (s === 'low' || s === 'high') && !l.accepted && !l.overridden
  })

  const ehrUnreviewed = labs.filter((l) => l.ehrValue && !l.accepted && !l.overridden)
  const manualMissing = labs.filter((l) => l.requiresManual && !l.manualValue)

  const canSubmit =
    criticalUnresolved.length === 0 &&
    ehrUnreviewed.length === 0 &&
    neuroOutcome !== '' &&
    alive30Days !== null

  const blockingIssues = [
    ...criticalUnresolved.map((l) => ({
      type: 'critical' as const,
      message: `${l.test} has a critical value that must be accepted or overridden`,
    })),
    ...ehrUnreviewed.slice(0, 2).map((l) => ({
      type: 'warning' as const,
      message: `${l.test} has an unreviewed EHR value — accept or override`,
    })),
    ...(ehrUnreviewed.length > 2 ? [{
      type: 'warning' as const,
      message: `${ehrUnreviewed.length - 2} more lab values need review`,
    }] : []),
    ...manualMissing.map((l) => ({
      type: 'info' as const,
      message: `${l.test} has no value entered`,
    })),
    ...(neuroOutcome === '' ? [{ type: 'warning' as const, message: 'Neurological outcome is required' }] : []),
    ...(alive30Days === null ? [{ type: 'warning' as const, message: '30-day survival status is required' }] : []),
  ]

  const survivalMilestones = [
    { label: 'Hospital Arrival', time: '0hr', complete: true },
    { label: '6 hr', time: '6hr', complete: true },
    { label: '24 hr', time: '24hr', complete: true },
    { label: '72 hr', time: '72hr', complete: true },
    { label: '30 days', time: '30d', complete: false },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Marcus Thompson</h2>
              <p className="text-sm text-primary-foreground/70">
                Apr 9, 2026 &bull; Hillsborough County Fire Rescue
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary-foreground/20 text-primary-foreground">
                <Droplet className="mr-1 h-3 w-3" />
                1 unit LTOWB
              </Badge>
              <Badge className="bg-primary-foreground/20 text-primary-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                University Hospital ED
              </Badge>
              <Badge className="bg-amber-400/90 text-white">
                <Clock className="mr-1 h-3 w-3" />
                Review due: 49hr post-arrival
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hospital Encounter */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Hospital Encounter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'ED arrival time', value: '14:32' },
              { label: 'Discharge disposition', value: 'Home' },
              { label: 'Hospital LOS', value: '3 days' },
              { label: 'ICU admission', value: 'No' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <Label className="text-muted-foreground">{item.label}</Label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">{item.value}</p>
                  <AutoFilledBadge />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admission Labs */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Admission Labs</CardTitle>
            <div className="flex items-center gap-2">
              {/* Status summary pills */}
              {criticalUnresolved.length > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                  <AlertCircle className="h-3 w-3" />
                  {criticalUnresolved.length} critical
                </span>
              )}
              {abnormalUnresolved.length > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <AlertTriangle className="h-3 w-3" />
                  {abnormalUnresolved.length} abnormal
                </span>
              )}
              {ehrUnreviewed.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {ehrUnreviewed.length} unreviewed
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-50"
                onClick={acceptAllEHR}
              >
                <ChevronsDown className="h-3.5 w-3.5" />
                Accept All EHR
              </Button>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 text-red-600" /> Critical value
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-amber-500" /> Abnormal
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-blue-500" /> Auto-filled from EHR
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Test</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Reference Range</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.map((lab) => (
                <LabTableRow
                  key={lab.key}
                  lab={lab}
                  onAccept={acceptLab}
                  onOverride={overrideLab}
                  onManualChange={manualChange}
                  onCancelOverride={cancelOverride}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SEMSTAR Survival */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">SEMSTAR Survival</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {survivalMilestones.map((milestone, index) => (
              <div key={milestone.label} className="flex flex-col items-center">
                <div className="relative flex items-center">
                  {index > 0 && (
                    <div className={cn(
                      'absolute right-full h-0.5 w-16',
                      survivalMilestones[index - 1].complete ? 'bg-green-400' : 'bg-border'
                    )} />
                  )}
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2',
                    milestone.complete
                      ? 'border-green-400 bg-green-400 text-white'
                      : 'border-border bg-muted text-muted-foreground'
                  )}>
                    {milestone.complete
                      ? <CheckCircle className="h-5 w-5" />
                      : <span className="text-xs font-medium">{milestone.time}</span>}
                  </div>
                </div>
                <span className={cn(
                  'mt-2 text-xs',
                  milestone.complete ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {milestone.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hospital Interventions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Hospital Interventions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'laparotomy', label: 'Exploratory laparotomy' },
              { key: 'intubation', label: 'Intubation' },
              { key: 'thoracotomy', label: 'Thoracotomy' },
              { key: 'reboa', label: 'REBOA' },
              { key: 'angiography', label: 'Angiography' },
              { key: 'txa', label: 'TXA' },
              { key: 'acReversal', label: 'AC Reversal' },
            ].map((item) => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={item.key}
                  checked={interventions[item.key as keyof typeof interventions]}
                  onCheckedChange={(checked) =>
                    setInterventions({ ...interventions, [item.key]: !!checked })
                  }
                />
                <label htmlFor={item.key} className="text-sm font-medium leading-none">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <p className="text-sm font-medium">MTP Recipient</p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">No</span>
              <Switch checked={mtpRecipient} onCheckedChange={setMtpRecipient} />
              <span className="text-sm text-muted-foreground">Yes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Outcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className={cn(submitAttempted && neuroOutcome === '' ? 'text-red-600' : '')}>
              Neurological outcome <span className="text-red-500">*</span>
            </Label>
            <Select value={neuroOutcome} onValueChange={setNeuroOutcome}>
              <SelectTrigger className={cn(submitAttempted && neuroOutcome === '' ? 'border-red-400' : '')}>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full recovery</SelectItem>
                <SelectItem value="impaired">Impaired</SelectItem>
                <SelectItem value="severe">Severe impairment</SelectItem>
                <SelectItem value="death">Death</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={cn(submitAttempted && alive30Days === null ? 'text-red-600' : '')}>
              Alive at 30 days <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {[
                { value: true, label: 'Yes' },
                { value: false, label: 'No' },
                { value: null, label: 'Unknown' },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => setAlive30Days(option.value)}
                  className={cn(
                    'flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-all',
                    alive30Days === option.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocking issues panel — shown after attempted submit */}
      {submitAttempted && blockingIssues.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <AlertCircle className="h-4 w-4" />
              {blockingIssues.length} item{blockingIssues.length > 1 ? 's' : ''} need attention before submitting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {blockingIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {issue.type === 'critical' && <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />}
                  {issue.type === 'warning' && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />}
                  {issue.type === 'info' && <span className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400">i</span>}
                  <span className={cn(
                    issue.type === 'critical' ? 'text-red-700' : 'text-amber-700'
                  )}>
                    {issue.message}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pb-8">
        <Button variant="ghost" className="text-muted-foreground">
          Save Draft
        </Button>
        <div className="flex items-center gap-3">
          {canSubmit && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check className="h-3.5 w-3.5" />
              All items reviewed
            </span>
          )}
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              setSubmitAttempted(true)
              if (canSubmit) alert('Submitted to registry!')
            }}
          >
            Confirm & Submit to Registry
          </Button>
        </div>
      </div>
    </div>
  )
}
