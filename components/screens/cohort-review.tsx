'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  Activity,
  Droplet,
  CheckCircle,
  Thermometer,
  Plus,
  Users,
  FileText,
  Filter,
  ChevronRight,
  Clock,
  Building2,
  Stethoscope,
  X,
} from 'lucide-react'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts'
import { EPCRViewer } from '@/components/epcr-viewer'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const kpiData = [
  {
    label: 'Total transfusions (YTD)',
    value: '156',
    trend: 12,
    trendUp: true,
    icon: Droplet,
    color: 'text-primary',
  },
  {
    label: 'SEMSTAR survival rate',
    value: '84.2%',
    trend: 2.1,
    trendUp: true,
    icon: Activity,
    color: 'text-success',
  },
  {
    label: 'Outcome form completion',
    value: '91%',
    trend: -3,
    trendUp: false,
    icon: CheckCircle,
    color: 'text-warning',
    warning: true,
  },
  {
    label: 'Avg cold chain compliance',
    value: '98.7%',
    trend: 0.5,
    trendUp: true,
    icon: Thermometer,
    color: 'text-success',
  },
]

const indicationData = [
  { indication: 'Trauma', count: 89 },
  { indication: 'GI Bleed', count: 42 },
  { indication: 'Obstetric', count: 18 },
  { indication: 'Other', count: 7 },
]

const survivalTrendData = [
  { month: 'Oct', rate: 78.5, national: 82 },
  { month: 'Nov', rate: 80.2, national: 82 },
  { month: 'Dec', rate: 79.8, national: 82 },
  { month: 'Jan', rate: 82.4, national: 82 },
  { month: 'Feb', rate: 83.1, national: 82 },
  { month: 'Mar', rate: 84.2, national: 82 },
]

const agencyData = [
  { agency: 'Hillsborough County Fire Rescue', cases: 32, completion: 96, responseTime: '8.2 min', quality: 98 },
  { agency: 'Miami-Dade Fire Rescue', cases: 28, completion: 88, responseTime: '9.1 min', quality: 87 },
  { agency: 'Orange County Fire Rescue', cases: 24, completion: 78, responseTime: '8.5 min', quality: 76 },
  { agency: 'Broward Sheriff Fire Rescue', cases: 22, completion: 94, responseTime: '7.8 min', quality: 92 },
  { agency: 'Palm Beach County Fire Rescue', cases: 18, completion: 91, responseTime: '8.0 min', quality: 89 },
  { agency: 'Pinellas County EMS', cases: 16, completion: 100, responseTime: '6.9 min', quality: 99 },
  { agency: 'Duval County Fire Rescue', cases: 12, completion: 83, responseTime: '9.4 min', quality: 81 },
]

// Saved cohorts
const savedCohorts = [
  { id: 'c1', name: 'Trauma SI > 1.0', patients: 42, created: 'Mar 15, 2026', filters: ['Indication: Trauma', 'Shock Index > 1.0'] },
  { id: 'c2', name: 'GI Bleed - LTOWB', patients: 18, created: 'Mar 8, 2026', filters: ['Indication: GI Bleed', 'Product: LTOWB'] },
  { id: 'c3', name: 'OB Hemorrhage Q1', patients: 11, created: 'Feb 22, 2026', filters: ['Indication: Obstetric', 'Date: Jan-Mar 2026'] },
  { id: 'c4', name: 'Non-survivors Review', patients: 24, created: 'Feb 10, 2026', filters: ['Outcome: Deceased', 'All indications'] },
]

// Meeting notes — linked to cohorts by ID
const meetingNotes = [
  {
    id: 'm1',
    date: 'Apr 10, 2026',
    title: 'Q1 Review - Miami-Dade Fire Rescue',
    attendees: ['Dr. Sarah Chen (Medical Director)', 'Chief Marcus Thompson', 'Blood Bank: Lisa Park'],
    cohortId: 'c1', // Trauma SI > 1.0
    summary: 'Reviewed 12 high-acuity trauma cases. Identified opportunity to reduce scene time for penetrating trauma. Action: Update protocol to mandate departure within 5 min for GSW/stab wounds.',
    nextSteps: ['Draft protocol revision by Apr 20', 'Schedule training for May shifts', 'Follow-up meeting: May 15'],
  },
  {
    id: 'm2',
    date: 'Mar 28, 2026',
    title: 'Blood Bank Coordination - OneBlood',
    attendees: ['OneBlood: Jennifer Martinez', 'FL DOH: Program Team', 'Hospital Liaisons (6)'],
    cohortId: null, // General meeting, not tied to a cohort
    summary: 'Quarterly sync on inventory and wastage. LTOWB wastage down 15% from Q4. Discussed expansion to 3 additional agencies in Q2.',
    nextSteps: ['Finalize MOU for new agencies', 'Update cold chain monitoring SOP', 'Next meeting: Jun 28'],
  },
  {
    id: 'm3',
    date: 'Mar 15, 2026',
    title: 'Non-survivor Case Review',
    attendees: ['Dr. James Wilson (Trauma Surgery)', 'EMS Medical Directors (4)', 'QI Coordinators'],
    cohortId: 'c4', // Non-survivors Review
    summary: 'Deep dive on 8 non-survivor cases. 3 cases had delayed recognition of hemorrhagic shock. 2 cases had cold chain deviations. Recommended enhanced vital sign trending in ePCR.',
    nextSteps: ['ImageTrend to add SI auto-calculate', 'Develop shock recognition CBT module', 'Schedule individual agency follow-ups'],
  },
  {
    id: 'm4',
    date: 'Feb 22, 2026',
    title: 'GI Bleed Protocol Discussion',
    attendees: ['Dr. Robert Kim (GI)', 'Tampa General ED: Dr. Amy Foster', 'Hillsborough FR: Chief Davis'],
    cohortId: 'c2', // GI Bleed - LTOWB
    summary: 'Reviewed GI bleed cases receiving LTOWB. Discussed timing of transfusion initiation. Agreed on SI > 1.0 threshold for earlier activation.',
    nextSteps: ['Update triage criteria', 'Create quick reference card', 'Follow-up in 60 days'],
  },
  {
    id: 'm5',
    date: 'Feb 8, 2026',
    title: 'OB Hemorrhage Case Series',
    attendees: ['Dr. Maria Santos (OB-GYN)', 'Orlando Health: L&D Team', 'Orange County FR: Capt. Williams'],
    cohortId: 'c3', // OB Hemorrhage Q1
    summary: 'Reviewed Q1 postpartum hemorrhage cases. All 3 patients survived. Discussed earlier activation criteria and coordination with receiving L&D units.',
    nextSteps: ['Develop OB-specific checklist', 'Hospital notification protocol update', 'Next review: May'],
  },
]

// Cohort patients keyed by cohort ID
const cohortPatientsMap: Record<string, typeof cohortPatientsBase> = {
  c1: [ // Trauma SI > 1.0
    { id: 'PT-2026-0142', age: 34, sex: 'M', indication: 'Trauma - MVC', agency: 'Miami-Dade FR', date: 'Mar 12', product: 'LTOWB x2', outcome: 'Survived', si: 1.4 },
    { id: 'PT-2026-0156', age: 28, sex: 'M', indication: 'Trauma - GSW', agency: 'Miami-Dade FR', date: 'Mar 14', product: 'LTOWB x1', outcome: 'Survived', si: 1.2 },
    { id: 'PT-2026-0178', age: 45, sex: 'F', indication: 'Trauma - Fall', agency: 'Broward Sheriff FR', date: 'Mar 18', product: 'pRBC x2', outcome: 'Survived', si: 1.1 },
    { id: 'PT-2026-0201', age: 52, sex: 'M', indication: 'Trauma - MVC', agency: 'Hillsborough FR', date: 'Mar 22', product: 'LTOWB x1', outcome: 'Deceased', si: 1.8 },
    { id: 'PT-2026-0234', age: 19, sex: 'M', indication: 'Trauma - Stab', agency: 'Orange County FR', date: 'Mar 28', product: 'LTOWB x2', outcome: 'Survived', si: 1.3 },
  ],
  c2: [ // GI Bleed - LTOWB
    { id: 'PT-2026-0089', age: 68, sex: 'M', indication: 'GI Bleed - Upper', agency: 'Hillsborough FR', date: 'Mar 5', product: 'LTOWB x1', outcome: 'Survived', si: 1.1 },
    { id: 'PT-2026-0112', age: 72, sex: 'F', indication: 'GI Bleed - Variceal', agency: 'Palm Beach FR', date: 'Mar 9', product: 'LTOWB x2', outcome: 'Survived', si: 1.3 },
    { id: 'PT-2026-0134', age: 55, sex: 'M', indication: 'GI Bleed - Upper', agency: 'Broward Sheriff FR', date: 'Mar 11', product: 'LTOWB x1', outcome: 'Survived', si: 0.9 },
  ],
  c3: [ // OB Hemorrhage Q1
    { id: 'PT-2026-0067', age: 32, sex: 'F', indication: 'OB - Postpartum', agency: 'Miami-Dade FR', date: 'Jan 18', product: 'LTOWB x2', outcome: 'Survived', si: 1.5 },
    { id: 'PT-2026-0098', age: 28, sex: 'F', indication: 'OB - Placenta Previa', agency: 'Orange County FR', date: 'Feb 4', product: 'pRBC x2, Plasma x1', outcome: 'Survived', si: 1.2 },
    { id: 'PT-2026-0145', age: 35, sex: 'F', indication: 'OB - Postpartum', agency: 'Hillsborough FR', date: 'Mar 12', product: 'LTOWB x1', outcome: 'Survived', si: 1.0 },
  ],
  c4: [ // Non-survivors Review — ALL deceased
    { id: 'PT-2026-0023', age: 78, sex: 'M', indication: 'Trauma - Fall', agency: 'Pinellas EMS', date: 'Jan 8', product: 'LTOWB x2', outcome: 'Deceased', si: 1.9 },
    { id: 'PT-2026-0056', age: 42, sex: 'M', indication: 'Trauma - MVC', agency: 'Duval County FR', date: 'Jan 22', product: 'LTOWB x3', outcome: 'Deceased', si: 2.1 },
    { id: 'PT-2026-0087', age: 65, sex: 'F', indication: 'GI Bleed - Variceal', agency: 'Miami-Dade FR', date: 'Feb 3', product: 'pRBC x2, Plasma x2', outcome: 'Deceased', si: 1.6 },
    { id: 'PT-2026-0124', age: 58, sex: 'M', indication: 'Trauma - GSW', agency: 'Broward Sheriff FR', date: 'Feb 19', product: 'LTOWB x4', outcome: 'Deceased', si: 2.4 },
    { id: 'PT-2026-0201', age: 52, sex: 'M', indication: 'Trauma - MVC', agency: 'Hillsborough FR', date: 'Mar 22', product: 'LTOWB x1', outcome: 'Deceased', si: 1.8 },
  ],
}

const cohortPatientsBase = [
  { id: 'PT-2026-0142', age: 34, sex: 'M', indication: 'Trauma - MVC', agency: 'Miami-Dade FR', date: 'Mar 12', product: 'LTOWB x2', outcome: 'Survived', si: 1.4 },
]

const barChartConfig = {
  count: { label: 'Count', color: 'hsl(221, 83%, 53%)' },
} satisfies ChartConfig

const lineChartConfig = {
  rate: { label: 'Survival Rate', color: 'hsl(142, 76%, 36%)' },
  national: { label: 'National Avg', color: 'hsl(220, 9%, 46%)' },
} satisfies ChartConfig

function getQualityDot(score: number) {
  if (score >= 95) return 'bg-success'
  if (score >= 80) return 'bg-warning'
  return 'bg-destructive'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CohortReview() {
  const [activeTab, setActiveTab] = useState<'cohorts' | 'meetings'>('cohorts')
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null)
  const [showNewCohort, setShowNewCohort] = useState(false)
  const [showNewMeeting, setShowNewMeeting] = useState(false)
  const [selectedPatientForEPCR, setSelectedPatientForEPCR] = useState<string | null>(null)

  // Cohort builder state
  const [cohortName, setCohortName] = useState('')
  const [cohortFilters, setCohortFilters] = useState<string[]>([])

  // Meeting note state
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingAttendees, setMeetingAttendees] = useState('')
  const [meetingCohort, setMeetingCohort] = useState('')
  const [meetingSummary, setMeetingSummary] = useState('')
  const [meetingNextSteps, setMeetingNextSteps] = useState('')

  const addFilter = (filter: string) => {
    if (!cohortFilters.includes(filter)) {
      setCohortFilters([...cohortFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setCohortFilters(cohortFilters.filter(f => f !== filter))
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label} className={cn(kpi.warning && 'border-warning')}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-3xl font-bold">{kpi.value}</p>
                </div>
                <div className={cn('rounded-lg bg-muted p-2', kpi.color)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <div className={cn('mt-3 flex items-center gap-1 text-sm', kpi.trendUp ? 'text-success' : 'text-destructive')}>
                {kpi.trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{kpi.trendUp ? '+' : ''}{kpi.trend}% vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Transfusions by indication</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[200px] w-full">
              <BarChart data={indicationData} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="indication" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">SEMSTAR survival trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[200px] w-full">
              <LineChart data={survivalTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[75, 90]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={82} stroke="hsl(220, 9%, 46%)" strokeDasharray="5 5" label={{ value: 'National avg.', position: 'insideTopRight', fontSize: 11 }} />
                <Line type="monotone" dataKey="rate" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ fill: 'hsl(142, 76%, 36%)', r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cohorts & Meetings Tabs */}
      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => { setActiveTab('cohorts'); setSelectedCohort(null) }}
          className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === 'cohorts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          <Users className="h-4 w-4" />
          Patient Cohorts
        </button>
        <button
          onClick={() => { setActiveTab('meetings'); setSelectedCohort(null) }}
          className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === 'meetings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          <FileText className="h-4 w-4" />
          Meeting Notes
        </button>
      </div>

      {/* Cohorts Tab Content */}
      {activeTab === 'cohorts' && !selectedCohort && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Saved Cohorts</h2>
            <Dialog open={showNewCohort} onOpenChange={setShowNewCohort}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Cohort
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Patient Cohort</DialogTitle>
                  <DialogDescription>Define filters to group patients for review and analysis.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Cohort Name</label>
                    <Input value={cohortName} onChange={e => setCohortName(e.target.value)} placeholder="e.g., Trauma SI > 1.2" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Add Filters</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Select onValueChange={val => addFilter(`Indication: ${val}`)}>
                        <SelectTrigger><SelectValue placeholder="Indication" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Trauma">Trauma</SelectItem>
                          <SelectItem value="GI Bleed">GI Bleed</SelectItem>
                          <SelectItem value="Obstetric">Obstetric</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select onValueChange={val => addFilter(`Product: ${val}`)}>
                        <SelectTrigger><SelectValue placeholder="Blood Product" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LTOWB">LTOWB</SelectItem>
                          <SelectItem value="pRBC">pRBC</SelectItem>
                          <SelectItem value="Plasma">Plasma</SelectItem>
                          <SelectItem value="Platelets">Platelets</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select onValueChange={val => addFilter(`Outcome: ${val}`)}>
                        <SelectTrigger><SelectValue placeholder="Outcome" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Survived">Survived</SelectItem>
                          <SelectItem value="Deceased">Deceased</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select onValueChange={val => addFilter(`SI: ${val}`)}>
                        <SelectTrigger><SelectValue placeholder="Shock Index" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="> 0.9">&gt; 0.9</SelectItem>
                          <SelectItem value="> 1.0">&gt; 1.0</SelectItem>
                          <SelectItem value="> 1.2">&gt; 1.2</SelectItem>
                          <SelectItem value="> 1.4">&gt; 1.4</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select onValueChange={val => addFilter(`Agency: ${val}`)}>
                        <SelectTrigger><SelectValue placeholder="Agency" /></SelectTrigger>
                        <SelectContent>
                          {agencyData.map(a => <SelectItem key={a.agency} value={a.agency}>{a.agency}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select onValueChange={val => addFilter(`Date: ${val}`)}>
                        <SelectTrigger><SelectValue placeholder="Date Range" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                          <SelectItem value="Last 90 days">Last 90 days</SelectItem>
                          <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                          <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {cohortFilters.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Active Filters</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {cohortFilters.map(f => (
                          <Badge key={f} variant="secondary" className="gap-1 pr-1">
                            {f}
                            <button onClick={() => removeFilter(f)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewCohort(false)}>Cancel</Button>
                  <Button onClick={() => { setShowNewCohort(false); setCohortName(''); setCohortFilters([]) }}>Create Cohort</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {savedCohorts.map(cohort => (
              <Card key={cohort.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedCohort(cohort.id)}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{cohort.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cohort.patients} patients</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cohort.filters.map(f => (
                      <Badge key={f} variant="outline" className="text-xs font-normal">{f}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Created {cohort.created}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Cohort Detail */}
      {activeTab === 'cohorts' && selectedCohort && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCohort(null)}>
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Back
            </Button>
            <h2 className="text-lg font-semibold">{savedCohorts.find(c => c.id === selectedCohort)?.name}</h2>
            <Badge variant="secondary">{(cohortPatientsMap[selectedCohort] || []).length} patients</Badge>
          </div>

          {/* Patient Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Age/Sex</TableHead>
                    <TableHead>Indication</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SI</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(cohortPatientsMap[selectedCohort] || []).map(p => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedPatientForEPCR(p.id)}>
                      <TableCell className="font-medium text-primary">{p.id}</TableCell>
                      <TableCell>{p.age}{p.sex}</TableCell>
                      <TableCell>{p.indication}</TableCell>
                      <TableCell>{p.agency}</TableCell>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.product}</TableCell>
                      <TableCell className={cn(p.si >= 1.4 && 'text-destructive font-semibold')}>{p.si}</TableCell>
                      <TableCell>
                        <Badge variant={p.outcome === 'Survived' ? 'default' : 'destructive'} className={p.outcome === 'Survived' ? 'bg-success text-success-foreground' : ''}>
                          {p.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedPatientForEPCR(p.id) }}>
                          <FileText className="h-3 w-3 mr-1" />
                          ePCR
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cohort Meeting Notes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Meeting Notes for this Cohort</CardTitle>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => { setMeetingCohort(selectedCohort); setShowNewMeeting(true) }}>
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const cohortMeetings = meetingNotes.filter(m => m.cohortId === selectedCohort)
                if (cohortMeetings.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No meeting notes yet for this cohort</p>
                      <Button size="sm" variant="link" className="mt-1" onClick={() => { setMeetingCohort(selectedCohort); setShowNewMeeting(true) }}>
                        Document a meeting
                      </Button>
                    </div>
                  )
                }
                return (
                  <div className="space-y-4">
                    {cohortMeetings.map(meeting => (
                      <div key={meeting.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{meeting.title}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{meeting.date}</span>
                              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{meeting.attendees.length} attendees</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Attendees</p>
                            <div className="flex flex-wrap gap-1.5">
                              {meeting.attendees.map(a => (
                                <Badge key={a} variant="secondary" className="text-xs font-normal">{a}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Summary</p>
                            <p className="text-sm">{meeting.summary}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Next Steps</p>
                            <ul className="text-sm space-y-1">
                              {meeting.nextSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Meetings Tab Content */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Meeting Notes</h2>
            <Dialog open={showNewMeeting} onOpenChange={setShowNewMeeting}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Meeting Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Document Meeting</DialogTitle>
                  <DialogDescription>Record notes from QI meetings with agencies, hospitals, and blood banks.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="text-sm font-medium">Meeting Title</label>
                    <Input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="e.g., Q1 Review - Miami-Dade Fire Rescue" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Attendees</label>
                    <Input value={meetingAttendees} onChange={e => setMeetingAttendees(e.target.value)} placeholder="Names and roles, separated by commas" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Related Cohort</label>
                    <Select value={meetingCohort} onValueChange={setMeetingCohort}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select a cohort" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific cohort (general meeting)</SelectItem>
                        {savedCohorts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Meeting Summary</label>
                    <Textarea value={meetingSummary} onChange={e => setMeetingSummary(e.target.value)} placeholder="Key discussion points and decisions..." className="mt-1 min-h-[100px]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Next Steps / Action Items</label>
                    <Textarea value={meetingNextSteps} onChange={e => setMeetingNextSteps(e.target.value)} placeholder="One per line..." className="mt-1 min-h-[80px]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewMeeting(false)}>Cancel</Button>
                  <Button onClick={() => { setShowNewMeeting(false); setMeetingTitle(''); setMeetingAttendees(''); setMeetingCohort(''); setMeetingSummary(''); setMeetingNextSteps('') }}>Save Meeting Note</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {meetingNotes.map(meeting => (
              <Card key={meeting.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{meeting.title}</h3>
                        {meeting.cohortId && <Badge variant="outline" className="text-xs">{savedCohorts.find(c => c.id === meeting.cohortId)?.name || meeting.cohortId}</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{meeting.date}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{meeting.attendees.length} attendees</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Attendees</p>
                      <div className="flex flex-wrap gap-1.5">
                        {meeting.attendees.map(a => (
                          <Badge key={a} variant="secondary" className="text-xs font-normal">{a}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Summary</p>
                      <p className="text-sm">{meeting.summary}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Next Steps</p>
                      <ul className="text-sm space-y-1">
                        {meeting.nextSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Agency Performance */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Agency Performance — Florida</CardTitle>
            <Badge variant="outline" className="text-xs">{agencyData.length} agencies</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead className="text-right">Cases (YTD)</TableHead>
                <TableHead className="text-right">Completion rate</TableHead>
                <TableHead className="text-right">Avg response time</TableHead>
                <TableHead className="text-right">Data quality score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencyData.map((row) => (
                <TableRow key={row.agency}>
                  <TableCell className="font-medium">{row.agency}</TableCell>
                  <TableCell className="text-right">{row.cases}</TableCell>
                  <TableCell className="text-right">{row.completion}%</TableCell>
                  <TableCell className="text-right">{row.responseTime}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={cn('h-2 w-2 rounded-full', getQualityDot(row.quality))} />
                      {row.quality}%
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ePCR Viewer Modal */}
      {selectedPatientForEPCR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedPatientForEPCR(null)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto m-4 rounded-lg shadow-xl">
            <button
              onClick={() => setSelectedPatientForEPCR(null)}
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
            <EPCRViewer patientId={selectedPatientForEPCR} />
          </div>
        </div>
      )}
    </div>
  )
}
