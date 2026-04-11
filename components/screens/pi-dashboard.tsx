'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts'

const kpiData = [
  {
    label: 'Total transfusions this month',
    value: '47',
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
  { indication: 'Trauma', count: 28 },
  { indication: 'GI Bleed', count: 11 },
  { indication: 'Obstetric', count: 5 },
  { indication: 'Other', count: 3 },
]

const survivalTrendData = [
  { month: 'Oct', rate: 78.5, national: 82 },
  { month: 'Nov', rate: 80.2, national: 82 },
  { month: 'Dec', rate: 79.8, national: 82 },
  { month: 'Jan', rate: 82.4, national: 82 },
  { month: 'Feb', rate: 83.1, national: 82 },
  { month: 'Mar', rate: 84.2, national: 82 },
]

const caseQueueData = [
  {
    patientId: 'PT-2026-0892',
    agency: 'Miami-Dade Fire Rescue',
    date: 'Apr 8, 2026',
    destination: 'Jackson Memorial',
    product: '2 units pRBC',
    status: 'overdue',
  },
  {
    patientId: 'PT-2026-0901',
    agency: 'Orange County EMS',
    date: 'Apr 10, 2026',
    destination: 'Orlando Regional',
    product: '1 unit LTOWB',
    status: 'due-today',
  },
  {
    patientId: 'PT-2026-0915',
    agency: 'Hillsborough County FR',
    date: 'Apr 9, 2026',
    destination: 'Tampa General',
    product: '1 unit LTOWB',
    status: 'in-review',
  },
  {
    patientId: 'PT-2026-0923',
    agency: 'Broward Sheriff Fire',
    date: 'Apr 7, 2026',
    destination: 'Memorial Regional',
    product: '2 units Plasma',
    status: 'complete',
  },
  {
    patientId: 'PT-2026-0931',
    agency: 'Palm Beach County FR',
    date: 'Apr 6, 2026',
    destination: 'St. Mary&apos;s Medical',
    product: '1 unit LTOWB',
    status: 'complete',
  },
]

const agencyData = [
  {
    agency: 'Hillsborough County Fire Rescue',
    state: 'FL',
    cases: 18,
    completion: 96,
    responseTime: '8.2 min',
    quality: 98,
  },
  {
    agency: 'Houston Fire Department',
    state: 'TX',
    cases: 24,
    completion: 92,
    responseTime: '7.8 min',
    quality: 95,
  },
  {
    agency: 'Miami-Dade Fire Rescue',
    state: 'FL',
    cases: 15,
    completion: 88,
    responseTime: '9.1 min',
    quality: 87,
  },
  {
    agency: 'Austin-Travis County EMS',
    state: 'TX',
    cases: 12,
    completion: 100,
    responseTime: '6.9 min',
    quality: 99,
  },
  {
    agency: 'Orange County Fire Rescue',
    state: 'FL',
    cases: 9,
    completion: 78,
    responseTime: '8.5 min',
    quality: 76,
  },
  {
    agency: 'San Antonio Fire Department',
    state: 'TX',
    cases: 11,
    completion: 94,
    responseTime: '7.4 min',
    quality: 92,
  },
]

const barChartConfig = {
  count: {
    label: 'Count',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig

const lineChartConfig = {
  rate: {
    label: 'Survival Rate',
    color: 'var(--color-accent)',
  },
  national: {
    label: 'National Avg',
    color: 'var(--color-muted-foreground)',
  },
} satisfies ChartConfig

function getStatusBadge(status: string) {
  switch (status) {
    case 'overdue':
      return <Badge className="bg-destructive text-destructive-foreground">Overdue</Badge>
    case 'due-today':
      return <Badge className="bg-warning text-warning-foreground">Due today</Badge>
    case 'in-review':
      return <Badge className="bg-info text-info-foreground">In review</Badge>
    case 'complete':
      return <Badge className="bg-success text-success-foreground">Complete</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getQualityDot(score: number) {
  if (score >= 95) return 'bg-success'
  if (score >= 80) return 'bg-warning'
  return 'bg-destructive'
}

export function PIDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-1">Prehospital Blood Transfusion Registry</h1>
        <p className="text-sm opacity-90">Program Director: Alison Bereschak</p>
      </div>
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
              <div
                className={cn(
                  'mt-3 flex items-center gap-1 text-sm',
                  kpi.trendUp ? 'text-success' : 'text-destructive'
                )}
              >
                {kpi.trendUp ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {kpi.trendUp ? '+' : ''}
                  {kpi.trend}% vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Transfusions by Indication */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Transfusions by indication</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[240px] w-full">
              <BarChart data={indicationData} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="indication" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* SEMSTAR Survival Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">SEMSTAR survival by month</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[240px] w-full">
              <LineChart data={survivalTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[75, 90]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  y={82}
                  stroke="var(--color-muted-foreground)"
                  strokeDasharray="5 5"
                  label={{ value: 'National avg.', position: 'insideTopRight', fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-accent)', r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Last 30 days
        </Button>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="FL">Florida</SelectItem>
            <SelectItem value="TX">Texas</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="due-today">Due today</SelectItem>
            <SelectItem value="in-review">In review</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patients, agencies..." className="pl-9" />
        </div>
      </div>

      {/* Case Queue */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Pending outcome reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Incident Date</TableHead>
                <TableHead>Destination ED</TableHead>
                <TableHead>Blood Product</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseQueueData.map((row) => (
                <TableRow key={row.patientId} className={cn(row.status === 'overdue' && 'bg-destructive/5')}>
                  <TableCell className="font-medium">{row.patientId}</TableCell>
                  <TableCell>{row.agency}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.destination}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Agency Performance */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Agency Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Cases</TableHead>
                <TableHead className="text-right">Completion rate</TableHead>
                <TableHead className="text-right">Avg response time</TableHead>
                <TableHead className="text-right">Data quality score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencyData.map((row) => (
                <TableRow key={row.agency}>
                  <TableCell className="font-medium">{row.agency}</TableCell>
                  <TableCell>{row.state}</TableCell>
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
    </div>
  )
}
