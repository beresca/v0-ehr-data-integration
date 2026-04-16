'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  Check,
  ChevronsDown,
  Info,
  ChevronRight,
  User,
  FileText,
  X,
} from 'lucide-react'
import { EPCRViewer } from '@/components/epcr-viewer'

// ─── Case Queue Data ──────────────────────────────────────────────────────────

interface CaseRecord {
  patientId: string
  incidentId: string
  patientName: string
  age: number
  gender: 'M' | 'F'
  agency: string
  date: string
  time: string // Run time
  destination: string
  product: string
  scannedProducts: { unitId: string; productType: string; scannedAt: string; startTime?: string; stopTime?: string }[]
  epcrImported: boolean
  bloodScanned: boolean
  status: 'overdue' | 'due-today' | 'in-review' | 'complete'
  dueIn?: string
  chief: string
  vitals?: { sbp: number; hr: number; gcs?: number }
  transfusionReaction?: { reported: boolean; type?: string; severity?: string }
}

const CASE_QUEUE: CaseRecord[] = [
  {
    patientId: 'PT-2026-0892',
    incidentId: 'INC-2026-78432',
    patientName: 'Robert Chen',
    age: 45,
    gender: 'M',
    agency: 'Miami-Dade Fire Rescue',
    date: 'Apr 8, 2026',
    time: '13:42',
    destination: 'Jackson Memorial',
    product: '2 units LTOWB',
    scannedProducts: [
      { unitId: 'W26-089234', productType: 'LTOWB', scannedAt: '2026-04-08 14:08', startTime: '14:12', stopTime: '14:28' },
      { unitId: 'W26-089235', productType: 'LTOWB', scannedAt: '2026-04-08 14:22', startTime: '14:30' },
    ],
    epcrImported: true,
    bloodScanned: true,
    status: 'overdue',
    dueIn: '12h overdue',
    chief: 'MVC - Trauma',
    vitals: { sbp: 72, hr: 128, gcs: 11 },
    transfusionReaction: { reported: true, type: 'Febrile', severity: 'Mild' },
  },
  {
    patientId: 'PT-2026-0901',
    incidentId: 'INC-2026-78398',
    patientName: 'Sarah Martinez',
    age: 32,
    gender: 'F',
    agency: 'Orange County EMS',
    date: 'Apr 10, 2026',
    time: '22:05',
    destination: 'Orlando Regional',
    product: '1 unit Plasma',
    scannedProducts: [
      { unitId: 'P26-112233', productType: 'Plasma', scannedAt: '2026-04-10 22:18', startTime: '22:24', stopTime: '22:45' },
    ],
    epcrImported: true,
    bloodScanned: true,
    status: 'due-today',
    dueIn: '6h remaining',
    chief: 'Stabbing - Abdomen',
    vitals: { sbp: 88, hr: 112, gcs: 15 },
  },
  {
    patientId: 'PT-2026-0915',
    incidentId: 'INC-2026-78415',
    patientName: 'Marcus Thompson',
    age: 28,
    gender: 'M',
    agency: 'Hillsborough County FR',
    date: 'Apr 9, 2026',
    time: '11:18',
    destination: 'Tampa General',
    product: '1 unit pRBC',
    scannedProducts: [
      { unitId: 'R26-445521', productType: 'pRBC', scannedAt: '2026-04-09 11:35', startTime: '11:42' },
    ],
    epcrImported: true,
    bloodScanned: true,
    status: 'in-review',
    chief: 'GSW - Chest',
    vitals: { sbp: 64, hr: 142, gcs: 8 },
  },
  {
    patientId: 'PT-2026-0923',
    incidentId: 'INC-2026-78301',
    patientName: 'Linda Williams',
    age: 67,
    gender: 'F',
    agency: 'Broward Sheriff Fire',
    date: 'Apr 7, 2026',
    time: '08:22',
    destination: 'Memorial Regional',
    product: '1 unit LTOWB',
    scannedProducts: [
      { unitId: 'W26-089234', productType: 'LTOWB', scannedAt: '2026-04-07 08:45', startTime: '08:52', stopTime: '09:15' },
    ],
    epcrImported: true,
    bloodScanned: true,
    status: 'complete',
    chief: 'MVC - Ejection',
    vitals: { sbp: 78, hr: 118, gcs: 13 },
  },
]

function getStatusColor(status: CaseRecord['status']) {
  switch (status) {
    case 'overdue': return 'bg-red-500'
    case 'due-today': return 'bg-amber-500'
    case 'in-review': return 'bg-blue-500'
    case 'complete': return 'bg-green-500'
  }
}

function getStatusLabel(status: CaseRecord['status']) {
  switch (status) {
    case 'overdue': return 'Overdue'
    case 'due-today': return 'Due Today'
    case 'in-review': return 'In Review'
    case 'complete': return 'Complete'
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AbnormalStatus = 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high'

interface LabRow {
  key: string
  panel: string
  test: string
  ehrValue: string | null
  ehrTimestamp: string | null
  editedValue: string | null   // user-modified value; original EHR preserved for audit
  accepted: boolean
  unit: string
  refRange: string
  criticalLow?: number
  criticalHigh?: number
  normalLow?: number
  normalHigh?: number
  isCategorical?: boolean
  requiresManual?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNumeric(val: string | null): number | null {
  if (!val) return null
  const n = parseFloat(val.replace(/[^\d.-]/g, ''))
  return isNaN(n) ? null : n
}

function getStatus(lab: LabRow): AbnormalStatus {
  if (lab.isCategorical) return 'normal'
  const displayVal = lab.editedValue ?? lab.ehrValue
  const n = parseNumeric(displayVal)
  if (n === null) return 'normal'
  if (lab.criticalLow !== undefined && n <= lab.criticalLow) return 'critical-low'
  if (lab.criticalHigh !== undefined && n >= lab.criticalHigh) return 'critical-high'
  if (lab.normalLow !== undefined && n < lab.normalLow) return 'low'
  if (lab.normalHigh !== undefined && n > lab.normalHigh) return 'high'
  return 'normal'
}

// Row background only — no badges in result column
function rowBg(status: AbnormalStatus, accepted: boolean): string {
  if (accepted) return ''
  switch (status) {
    case 'critical-low':
    case 'critical-high': return 'bg-red-50'
    case 'low':           return 'bg-blue-50'   // low = blue, clinician convention
    case 'high':          return 'bg-amber-50'  // high = amber/orange
    default:              return ''
  }
}

// Result text color only
function resultColor(status: AbnormalStatus, accepted: boolean): string {
  if (accepted) return 'text-green-700'
  switch (status) {
    case 'critical-low':
    case 'critical-high': return 'text-red-700'
    case 'low':           return 'text-blue-700'
    case 'high':          return 'text-amber-700'
    default:              return ''
  }
}

function AutoFilledBadge() {
  return (
    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 text-xs gap-1 shrink-0">
      <Sparkles className="h-3 w-3" />
      EHR
    </Badge>
  )
}

// ─── Lab Template — structure only, no values ─────────────────────────────────

function makeLabTemplate(): LabRow[] {
  return [
    { key: 'hgb',        panel: 'CBC',           test: 'Hemoglobin',       ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'g/dL',   refRange: '12.0 – 17.5', normalLow: 12.0, normalHigh: 17.5, criticalLow: 7.0,  criticalHigh: 20.0 },
    { key: 'hct',        panel: 'CBC',           test: 'Hematocrit',       ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: '%',      refRange: '36 – 52',     normalLow: 36,   normalHigh: 52,   criticalLow: 21,   criticalHigh: 65   },
    { key: 'plt',        panel: 'CBC',           test: 'Platelets',        ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'k/uL',   refRange: '150 – 400',   normalLow: 150,  normalHigh: 400,  criticalLow: 50,   criticalHigh: 1000 },
    { key: 'wbc',        panel: 'CBC',           test: 'WBC',              ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'k/uL',   refRange: '4.5 – 11.0',  normalLow: 4.5,  normalHigh: 11.0, criticalLow: 2.0,  criticalHigh: 30.0 },
    { key: 'inr',        panel: 'Coag',          test: 'INR',              ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: '',       refRange: '0.8 – 1.2',   normalLow: 0.8,  normalHigh: 1.2,  criticalLow: 0.5,  criticalHigh: 3.0  },
    { key: 'pt',         panel: 'Coag',          test: 'PT',               ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'sec',    refRange: '11 – 13.5',   normalLow: 11,   normalHigh: 13.5, criticalLow: 0,    criticalHigh: 25   },
    { key: 'ptt',        panel: 'Coag',          test: 'aPTT',             ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'sec',    refRange: '25 – 35',     normalLow: 25,   normalHigh: 35,   criticalLow: 0,    criticalHigh: 70   },
    { key: 'fibrinogen', panel: 'Coag',          test: 'Fibrinogen',       ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'mg/dL',  refRange: '200 – 400',   normalLow: 200,  normalHigh: 400,  criticalLow: 100,  criticalHigh: 700  },
    { key: 'lac',        panel: 'Chemistry',     test: 'Lactate',          ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'mmol/L', refRange: '0.5 – 2.0',   normalLow: 0.5,  normalHigh: 2.0,  criticalLow: 0,    criticalHigh: 10.0 },
    { key: 'ica',        panel: 'Chemistry',     test: 'Ionized Calcium',  ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'mmol/L', refRange: '1.12 – 1.32', normalLow: 1.12, normalHigh: 1.32, criticalLow: 0.75, criticalHigh: 1.58 },
    { key: 'ph',         panel: 'Chemistry',     test: 'pH (ABG)',         ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: '',       refRange: '7.35 – 7.45', normalLow: 7.35, normalHigh: 7.45, criticalLow: 7.2,  criticalHigh: 7.6  },
    { key: 'be',         panel: 'Chemistry',     test: 'Base Excess',      ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: 'mEq/L',  refRange: '-2 to +2',    normalLow: -2,   normalHigh: 2,    criticalLow: -10,  criticalHigh: 10   },
    { key: 'btype',      panel: 'Type & Screen', test: 'Blood Type / Rh',  ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: '',       refRange: '—',           isCategorical: true },
    { key: 'hcg',        panel: 'Type & Screen', test: 'hCG Qualitative',  ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: '',       refRange: 'Negative',    isCategorical: true },
    { key: 'teg',        panel: 'Viscoelastic',  test: 'TEG / ROTEM',      ehrValue: null, ehrTimestamp: null, editedValue: null, accepted: false, unit: '',       refRange: 'See report',  isCategorical: true, requiresManual: true },
  ]
}

// ─── Per-patient EHR lab values ───────────────────────────────────────────────
// Keyed by patientId → labKey → { value, timestamp }
const PATIENT_LABS: Record<string, Record<string, { value: string; timestamp: string }>> = {
  'PT-2026-0892': { // Robert Chen — MVC, severe hemorrhagic shock, 2 units LTOWB
    hgb:        { value: '5.8',        timestamp: '04/08/2026 15:14' },
    hct:        { value: '18',         timestamp: '04/08/2026 15:14' },
    plt:        { value: '72',         timestamp: '04/08/2026 15:14' },
    wbc:        { value: '14.6',       timestamp: '04/08/2026 15:14' },
    inr:        { value: '2.4',        timestamp: '04/08/2026 15:20' },
    pt:         { value: '24.1',       timestamp: '04/08/2026 15:20' },
    ptt:        { value: '58',         timestamp: '04/08/2026 15:20' },
    fibrinogen: { value: '102',        timestamp: '04/08/2026 15:20' },
    lac:        { value: '6.8',        timestamp: '04/08/2026 15:18' },
    ica:        { value: '0.88',       timestamp: '04/08/2026 15:18' },
    ph:         { value: '7.18',       timestamp: '04/08/2026 15:22' },
    be:         { value: '-12.4',      timestamp: '04/08/2026 15:22' },
    btype:      { value: 'O Negative', timestamp: '04/08/2026 15:10' },
    hcg:        { value: 'N/A (Male)', timestamp: '04/08/2026 15:10' },
  },
  'PT-2026-0901': { // Sarah Martinez — stab abdomen, 1 unit Plasma
    hgb:        { value: '9.4',        timestamp: '04/10/2026 23:02' },
    hct:        { value: '28',         timestamp: '04/10/2026 23:02' },
    plt:        { value: '198',        timestamp: '04/10/2026 23:02' },
    wbc:        { value: '16.2',       timestamp: '04/10/2026 23:02' },
    inr:        { value: '1.6',        timestamp: '04/10/2026 23:08' },
    pt:         { value: '16.2',       timestamp: '04/10/2026 23:08' },
    ptt:        { value: '44',         timestamp: '04/10/2026 23:08' },
    fibrinogen: { value: '172',        timestamp: '04/10/2026 23:08' },
    lac:        { value: '3.1',        timestamp: '04/10/2026 23:05' },
    ica:        { value: '1.02',       timestamp: '04/10/2026 23:05' },
    ph:         { value: '7.31',       timestamp: '04/10/2026 23:10' },
    be:         { value: '-5.1',       timestamp: '04/10/2026 23:10' },
    btype:      { value: 'A Positive', timestamp: '04/10/2026 22:58' },
    hcg:        { value: 'Negative',   timestamp: '04/10/2026 22:58' },
  },
  'PT-2026-0915': { // Marcus Thompson — GSW chest, 1 unit pRBC (in-review)
    hgb:        { value: '7.2',        timestamp: '04/09/2026 12:04' },
    hct:        { value: '22',         timestamp: '04/09/2026 12:04' },
    plt:        { value: '89',         timestamp: '04/09/2026 12:04' },
    wbc:        { value: '11.2',       timestamp: '04/09/2026 12:04' },
    inr:        { value: '1.8',        timestamp: '04/09/2026 12:10' },
    pt:         { value: '18.4',       timestamp: '04/09/2026 12:10' },
    ptt:        { value: '34',         timestamp: '04/09/2026 12:10' },
    fibrinogen: { value: '148',        timestamp: '04/09/2026 12:10' },
    lac:        { value: '4.2',        timestamp: '04/09/2026 12:08' },
    ica:        { value: '0.98',       timestamp: '04/09/2026 12:08' },
    ph:         { value: '7.28',       timestamp: '04/09/2026 12:12' },
    be:         { value: '-7.2',       timestamp: '04/09/2026 12:12' },
    btype:      { value: 'O Positive', timestamp: '04/09/2026 12:05' },
    hcg:        { value: 'N/A (Male)', timestamp: '04/09/2026 12:05' },
  },
  'PT-2026-0923': { // Linda Williams — MVC ejection, 1 unit LTOWB (complete)
    hgb:        { value: '10.1',       timestamp: '04/07/2026 09:15' },
    hct:        { value: '30',         timestamp: '04/07/2026 09:15' },
    plt:        { value: '142',        timestamp: '04/07/2026 09:15' },
    wbc:        { value: '9.8',        timestamp: '04/07/2026 09:15' },
    inr:        { value: '1.3',        timestamp: '04/07/2026 09:22' },
    pt:         { value: '14.2',       timestamp: '04/07/2026 09:22' },
    ptt:        { value: '38',         timestamp: '04/07/2026 09:22' },
    fibrinogen: { value: '221',        timestamp: '04/07/2026 09:22' },
    lac:        { value: '2.8',        timestamp: '04/07/2026 09:18' },
    ica:        { value: '1.08',       timestamp: '04/07/2026 09:18' },
    ph:         { value: '7.33',       timestamp: '04/07/2026 09:24' },
    be:         { value: '-3.8',       timestamp: '04/07/2026 09:24' },
    btype:      { value: 'B Positive', timestamp: '04/07/2026 09:10' },
    hcg:        { value: 'Negative',   timestamp: '04/07/2026 09:10' },
  },
}

// Build the initial labs for a given patient, merging template + patient values
function buildLabsForPatient(patientId: string): LabRow[] {
  const patientValues = PATIENT_LABS[patientId] ?? {}
  return makeLabTemplate().map((lab) => {
    const patientLab = patientValues[lab.key]
    return patientLab
      ? { ...lab, ehrValue: patientLab.value, ehrTimestamp: patientLab.timestamp }
      : lab
  })
}

const PANELS = ['CBC', 'Coag', 'Chemistry', 'Type & Screen', 'Viscoelastic']

// ─── Editable Result Cell ─────────────────────────────────────────────────────

function EditableResultCell({
  lab,
  onChange,
}: {
  lab: LabRow
  onChange: (key: string, val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const status = getStatus(lab)
  const displayVal = lab.editedValue ?? lab.ehrValue
  const isEdited = lab.editedValue !== null && lab.editedValue !== lab.ehrValue
  const color = resultColor(status, lab.accepted)

  if (lab.requiresManual || editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          autoFocus={editing}
          value={displayVal ?? ''}
          onChange={(e) => onChange(lab.key, e.target.value)}
          onBlur={() => setEditing(false)}
          placeholder="Enter value"
          className="h-7 w-28 text-sm"
        />
        {lab.unit && <span className="text-xs text-muted-foreground">{lab.unit}</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={cn(
                'font-mono text-sm font-semibold rounded px-1 -mx-1 hover:bg-white/80 hover:ring-1 hover:ring-border transition-all text-left',
                color
              )}
            >
              {displayVal
                ? <>{displayVal} <span className="font-normal text-muted-foreground text-xs">{lab.unit}</span></>
                : <span className="font-normal text-muted-foreground italic">No EHR value — tap to add</span>
              }
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs space-y-1 text-xs">
            {isEdited ? (
              <>
                <p className="font-semibold">Manually edited</p>
                <p>Original EHR value: <span className="font-mono">{lab.ehrValue}</span></p>
                {lab.ehrTimestamp && <p className="text-muted-foreground">Pulled: {lab.ehrTimestamp}</p>}
                <p className="text-muted-foreground">Audit trail preserved</p>
              </>
            ) : lab.ehrValue ? (
              <>
                <p className="font-semibold">Auto-filled from EHR</p>
                {lab.ehrTimestamp && <p className="text-muted-foreground">Result time: {lab.ehrTimestamp}</p>}
                <p className="text-muted-foreground">Click to edit / override</p>
              </>
            ) : (
              <p>Click to enter value manually</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {isEdited && (
        <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-700 shrink-0">
          Edited
        </Badge>
      )}
    </div>
  )
}

// ─── Lab Table for one panel ──────────────────────────────────────────────────

function LabPanel({
  panelName,
  labs,
  onAccept,
  onChange,
}: {
  panelName: string
  labs: LabRow[]
  onAccept: (key: string) => void
  onChange: (key: string, val: string) => void
}) {
  return (
    <>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableCell colSpan={6} className="py-1.5 pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {panelName}
        </TableCell>
      </TableRow>
      {labs.map((lab) => {
        const status = getStatus(lab)
        const bg = rowBg(status, lab.accepted)
        return (
          <TableRow key={lab.key} className={cn('transition-colors', bg)}>
            {/* Test */}
            <TableCell className="py-2 pl-6 font-medium text-sm w-40">
              <div className="flex items-center gap-1.5">
                {status === 'critical-low' || status === 'critical-high'
                  ? <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  : (status === 'low' || status === 'high')
                    ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    : <span className="w-3.5" />
                }
                {lab.test}
              </div>
            </TableCell>

            {/* Result — click to edit */}
            <TableCell className="py-2">
              <EditableResultCell lab={lab} onChange={onChange} />
            </TableCell>

            {/* Reference Range */}
            <TableCell className="py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
              {lab.refRange}
            </TableCell>

            {/* Date / Time */}
            <TableCell className="py-2 text-xs text-muted-foreground whitespace-nowrap">
              {lab.ehrTimestamp ?? (lab.requiresManual ? <span className="italic">Manual entry</span> : '—')}
            </TableCell>

            {/* Source */}
            <TableCell className="py-2">
              {lab.editedValue !== null && lab.editedValue !== lab.ehrValue ? (
                <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-700">
                  Override
                </Badge>
              ) : lab.ehrValue ? (
                <AutoFilledBadge />
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">Manual</Badge>
              )}
            </TableCell>

            {/* Accept */}
            <TableCell className="py-2">
              {lab.accepted ? (
                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Check className="h-3.5 w-3.5" /> Accepted
                </span>
              ) : (lab.ehrValue || lab.editedValue) ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 border-green-300 text-green-700 hover:bg-green-50 text-xs"
                  onClick={() => onAccept(lab.key)}
                >
                  <Check className="h-3 w-3" />
                  Accept
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        )
      })}
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OutcomeReview() {
  const searchParams = useSearchParams()
  const initialCaseId = searchParams.get('id') || CASE_QUEUE.find(c => c.status !== 'complete')?.patientId || CASE_QUEUE[0].patientId
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'due-today' | 'complete'>('pending')
  const [showFullEPCR, setShowFullEPCR] = useState(false)
  const selectedCase = CASE_QUEUE.find(c => c.patientId === selectedCaseId) || CASE_QUEUE[0]
  
  // Filter cases based on status filter
  const filteredCases = CASE_QUEUE.filter(c => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'pending') return c.status !== 'complete'
    return c.status === statusFilter
  })

  const [labs, setLabs] = useState<LabRow[]>(() => buildLabsForPatient(initialCaseId))
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

  // ── Reset all form state when patient changes ─────────────────────────────────
  useEffect(() => {
    setLabs(buildLabsForPatient(selectedCaseId))
    setInterventions({ laparotomy: false, intubation: false, thoracotomy: false, reboa: false, angiography: false, txa: false, acReversal: false })
    setMtpRecipient(false)
    setAlive30Days(null)
    setNeuroOutcome('')
    setSubmitAttempted(false)
  }, [selectedCaseId])

  // ── Lab handlers ─────────────────────────────────────────────────────────────
  function acceptLab(key: string) {
    setLabs((prev) => prev.map((l) => l.key === key ? { ...l, accepted: true } : l))
  }

  function changeLabValue(key: string, val: string) {
    setLabs((prev) => prev.map((l) =>
      l.key === key ? { ...l, editedValue: val, accepted: false } : l
    ))
  }

  function acceptAllEHR() {
    setLabs((prev) => prev.map((l) =>
      (l.ehrValue && !l.requiresManual) ? { ...l, accepted: true } : l
    ))
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  const criticalUnresolved = labs.filter((l) => {
    const s = getStatus(l)
    return (s === 'critical-low' || s === 'critical-high') && !l.accepted
  })

  const ehrUnreviewed = labs.filter((l) =>
    l.ehrValue && !l.accepted && !(l.editedValue !== null && l.editedValue !== l.ehrValue)
  )

  const manualMissing = labs.filter((l) => l.requiresManual && !l.editedValue && !l.ehrValue)

  const canSubmit =
    criticalUnresolved.length === 0 &&
    ehrUnreviewed.length === 0 &&
    neuroOutcome !== '' &&
    alive30Days !== null

  const blockingIssues = [
    ...criticalUnresolved.map((l) => ({
      type: 'critical' as const,
      message: `${l.test} has a critical value — accept or override before submitting`,
    })),
    ...ehrUnreviewed.slice(0, 3).map((l) => ({
      type: 'warning' as const,
      message: `${l.test} EHR value has not been reviewed`,
    })),
    ...(ehrUnreviewed.length > 3 ? [{
      type: 'warning' as const,
      message: `${ehrUnreviewed.length - 3} more lab values need review`,
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

  // Summary counts for header pills
  const criticalCount = labs.filter((l) => { const s = getStatus(l); return s === 'critical-low' || s === 'critical-high' }).length
  const abnormalCount = labs.filter((l) => { const s = getStatus(l); return s === 'low' || s === 'high' }).length
  const unreviewedCount = ehrUnreviewed.length

  // Overview stats for this hospital
  const hospitalStats = {
    totalCases: CASE_QUEUE.length,
    pendingReviews: CASE_QUEUE.filter(c => c.status !== 'complete').length,
    overdueCount: CASE_QUEUE.filter(c => c.status === 'overdue').length,
    dueTodayCount: CASE_QUEUE.filter(c => c.status === 'due-today').length,
    completedThisMonth: CASE_QUEUE.filter(c => c.status === 'complete').length,
    survivalRate: 75, // Mock percentage
    avgTimeToReview: '18h', // Mock
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics — clickable to filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card 
          className={cn("col-span-1 cursor-pointer transition-all hover:border-primary/50", statusFilter === 'pending' && "ring-2 ring-primary border-primary")}
          onClick={() => setStatusFilter(s => s === 'pending' ? 'all' : 'pending')}
        >
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{hospitalStats.pendingReviews}</div>
            <div className="text-xs text-muted-foreground">Pending Reviews</div>
          </CardContent>
        </Card>
        <Card 
          className={cn("col-span-1 cursor-pointer transition-all hover:border-primary/50", hospitalStats.overdueCount > 0 && "border-destructive/50 bg-destructive/5", statusFilter === 'overdue' && "ring-2 ring-destructive")}
          onClick={() => setStatusFilter(s => s === 'overdue' ? 'all' : 'overdue')}
        >
          <CardContent className="pt-4 pb-3">
            <div className={cn("text-2xl font-bold", hospitalStats.overdueCount > 0 && "text-destructive")}>{hospitalStats.overdueCount}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card 
          className={cn("col-span-1 cursor-pointer transition-all hover:border-primary/50", hospitalStats.dueTodayCount > 0 && "border-amber-500/50 bg-amber-50", statusFilter === 'due-today' && "ring-2 ring-amber-500")}
          onClick={() => setStatusFilter(s => s === 'due-today' ? 'all' : 'due-today')}
        >
          <CardContent className="pt-4 pb-3">
            <div className={cn("text-2xl font-bold", hospitalStats.dueTodayCount > 0 && "text-amber-600")}>{hospitalStats.dueTodayCount}</div>
            <div className="text-xs text-muted-foreground">Due Today</div>
          </CardContent>
        </Card>
        <Card 
          className={cn("col-span-1 cursor-pointer transition-all hover:border-primary/50", statusFilter === 'complete' && "ring-2 ring-green-500")}
          onClick={() => setStatusFilter(s => s === 'complete' ? 'all' : 'complete')}
        >
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-green-600">{hospitalStats.completedThisMonth}</div>
            <div className="text-xs text-muted-foreground">Completed (Apr)</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{hospitalStats.survivalRate}%</div>
            <div className="text-xs text-muted-foreground">Survival Rate</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{hospitalStats.avgTimeToReview}</div>
            <div className="text-xs text-muted-foreground">Avg Review Time</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-w-0">
        {/* Case List Sidebar */}
        <div className="w-full lg:w-72 lg:shrink-0">
          <div className="lg:sticky lg:top-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {statusFilter === 'all' ? 'All Cases' : statusFilter === 'pending' ? 'Pending Reviews' : statusFilter === 'overdue' ? 'Overdue' : statusFilter === 'due-today' ? 'Due Today' : 'Completed'} ({filteredCases.length})
              </h2>
              {statusFilter !== 'all' && (
                <button onClick={() => setStatusFilter('all')} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                  Show all
                </button>
              )}
            </div>
          <div className="space-y-2">
            {filteredCases.map((caseItem) => (
              <button
                key={caseItem.patientId}
                onClick={() => setSelectedCaseId(caseItem.patientId)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  selectedCaseId === caseItem.patientId
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full shrink-0', getStatusColor(caseItem.status))} />
                    <span className="font-mono text-sm font-semibold">{caseItem.patientId}</span>
                  </div>
                  <ChevronRight className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    selectedCaseId === caseItem.patientId && 'text-primary'
                  )} />
                </div>
                <div className="mt-1.5 pl-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {caseItem.patientName}
                    <span className="text-muted-foreground font-normal">
                      {caseItem.age}{caseItem.gender}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {caseItem.date} &bull; {caseItem.chief}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {caseItem.agency}
                  </div>
                  {/* Source badges */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {caseItem.epcrImported && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z" />
                        </svg>
                        ePCR
                      </span>
                    )}
                    {caseItem.bloodScanned && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                        <Droplet className="w-2.5 h-2.5" />
                        {caseItem.scannedProducts.length} unit{caseItem.scannedProducts.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {caseItem.transfusionReaction?.reported && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Reaction
                      </span>
                    )}
                  </div>
                  {caseItem.dueIn && (
                    <div className={cn(
                      'text-xs font-medium mt-1',
                      caseItem.status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                    )}>
                      {caseItem.dueIn}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">

      {/* Header Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{selectedCase.patientName}</h2>
                  <span className="font-mono text-sm opacity-70">{selectedCase.incidentId}</span>
                </div>
                <p className="text-sm text-primary-foreground/70 mt-0.5 flex flex-wrap gap-x-2">
                  <span>{selectedCase.date}</span>
                  <span>{selectedCase.time}</span>
                  <span>&bull; {selectedCase.agency}</span>
                  <span>&bull; {selectedCase.chief}</span>
                </p>
              </div>
              <Badge className={cn(
                'text-white shrink-0',
                selectedCase.status === 'overdue' ? 'bg-red-500' :
                selectedCase.status === 'due-today' ? 'bg-amber-500' :
                selectedCase.status === 'in-review' ? 'bg-blue-500' : 'bg-green-500'
              )}>
                <Clock className="mr-1 h-3 w-3" />
                {getStatusLabel(selectedCase.status)}
                {selectedCase.dueIn && ` (${selectedCase.dueIn})`}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary-foreground/20 text-primary-foreground">
                <Droplet className="mr-1 h-3 w-3" />
                {selectedCase.product}
              </Badge>
              <Badge className="bg-primary-foreground/20 text-primary-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {selectedCase.destination}
              </Badge>
            </div>
          </div>

          {/* View Full ePCR Button */}
          <div className="mt-4 pt-4 border-t border-primary-foreground/20">
            <button
              onClick={() => setShowFullEPCR(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-sm font-medium"
            >
              <FileText className="h-4 w-4" />
              View Full ePCR Documentation
              <div className="flex gap-1.5 ml-2">
                {selectedCase.epcrImported && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/30 text-blue-100">NEMSIS</span>
                )}
                {selectedCase.bloodScanned && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-400/30 text-red-100">{selectedCase.scannedProducts.length} units</span>
                )}
              </div>
            </button>
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
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Admission Labs</CardTitle>
              {/* Lab window notice */}
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3 shrink-0" />
                Only labs drawn within the configured window (default: 6 hrs of ED arrival) are auto-populated.
                Values outside this window require manual entry.
                <span className="ml-1 text-blue-600 underline cursor-pointer">Settings</span>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 h-8 gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-50"
              onClick={acceptAllEHR}
            >
              <ChevronsDown className="h-3.5 w-3.5" />
              Accept All EHR
            </Button>
          </div>

          {/* Status summary + legend row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                <AlertCircle className="h-3 w-3" /> {criticalCount} critical
              </span>
            )}
            {abnormalCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <AlertTriangle className="h-3 w-3" /> {abnormalCount} abnormal
              </span>
            )}
            {unreviewedCount > 0 && (
              <span className="text-xs text-muted-foreground">{unreviewedCount} unreviewed</span>
            )}
            <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-300" /> Critical</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-50 border border-amber-200" /> High</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-50 border border-blue-200" /> Low</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-40">Test</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="font-mono text-xs">Reference Range</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Accept</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PANELS.map((panel) => {
                const panelLabs = labs.filter((l) => l.panel === panel)
                if (panelLabs.length === 0) return null
                return (
                  <LabPanel
                    key={panel}
                    panelName={panel}
                    labs={panelLabs}
                    onAccept={acceptLab}
                    onChange={changeLabValue}
                  />
                )
              })}
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

      {/* Transfusion Reaction */}
      <Card className={cn(selectedCase.transfusionReaction?.reported && "border-amber-500/50 bg-amber-50/30")}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Transfusion Reaction
              {selectedCase.transfusionReaction?.reported && (
                <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-100">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Reported
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {selectedCase.transfusionReaction?.reported ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Reaction Type</Label>
                  <p className="font-medium">{selectedCase.transfusionReaction.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Severity</Label>
                  <Badge variant={selectedCase.transfusionReaction.severity === 'Severe' ? 'destructive' : selectedCase.transfusionReaction.severity === 'Moderate' ? 'default' : 'secondary'}>
                    {selectedCase.transfusionReaction.severity}
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t">
                This case will be flagged in cohort reports and can be filtered for QI review.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No transfusion reaction reported</p>
              <Button variant="outline" size="sm" className="text-xs">
                Report Reaction
              </Button>
            </div>
          )}
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

      {/* Blocking Issues — shown on failed submit */}
      {submitAttempted && blockingIssues.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <AlertCircle className="h-4 w-4" />
              {blockingIssues.length} item{blockingIssues.length !== 1 ? 's' : ''} must be addressed before submitting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {blockingIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {issue.type === 'critical' && <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />}
                  {issue.type === 'warning' && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />}
                  {issue.type === 'info' && <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />}
                  <span className={cn(
                    issue.type === 'critical' ? 'text-red-700' :
                    issue.type === 'warning'  ? 'text-amber-700' : 'text-blue-700'
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

      </div>{/* End main content */}
      </div>{/* End flex row */}

      {/* Full ePCR Viewer Modal */}
      {showFullEPCR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFullEPCR(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto m-4 rounded-lg shadow-xl">
            <button
              onClick={() => setShowFullEPCR(false)}
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
            <EPCRViewer patientId={selectedCase.patientId} />
          </div>
        </div>
      )}
    </div>
  )
}
