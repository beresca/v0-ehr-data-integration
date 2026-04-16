'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import {
  Download,
  Filter,
  ShieldCheck,
  TrendingUp,
  Droplet,
  Clock,
  Activity,
  Users,
  Thermometer,
  AlertTriangle,
} from 'lucide-react'

// ─── Aggregate / de-identified mock data — Registry Analytics ─────────────────

const SUMMARY_STATS = [
  { label: 'Total cases (registry)', value: '1,284', sub: 'Jan 2024 – Apr 2026', icon: Users,      color: '#1B2B4B' },
  { label: 'Overall survival (ED)',  value: '81.4%', sub: '+2.3% vs prior period', icon: Activity,   color: '#22C55E' },
  { label: 'Median time to transfusion', value: '11.2 min', sub: 'Scene to first unit', icon: Clock, color: '#F59E0B' },
  { label: 'Cold chain compliance',  value: '97.9%', sub: 'All agencies, all products', icon: Thermometer, color: '#3B82F6' },
]

// Product type distribution
const PRODUCT_MIX = [
  { name: 'LTOWB',  value: 612, pct: 47.7 },
  { name: 'pRBC',   value: 398, pct: 31.0 },
  { name: 'Plasma', value: 186, pct: 14.5 },
  { name: 'Other',  value: 88,  pct: 6.8  },
]
const PRODUCT_COLORS = ['#DC2626', '#B91C1C', '#1B2B4B', '#6B7280']

// Survival by indication
const SURVIVAL_BY_INDICATION = [
  { indication: 'Trauma - MVC',    survived: 78, total: 98,  rate: 79.6 },
  { indication: 'Trauma - Penetrating', survived: 156, total: 214, rate: 72.9 },
  { indication: 'Trauma - Other',  survived: 87,  total: 104, rate: 83.7 },
  { indication: 'GI Hemorrhage',   survived: 156, total: 178, rate: 87.6 },
  { indication: 'Obstetric',       survived: 102, total: 108, rate: 94.4 },
  { indication: 'Medical Other',   survived: 64,  total: 78,  rate: 82.1 },
]

// Monthly volume trend (last 15 months)
const VOLUME_TREND = [
  { month: 'Jan 25', cases: 52, ltowb: 28, prbc: 17, plasma: 7  },
  { month: 'Feb 25', cases: 48, ltowb: 24, prbc: 15, plasma: 9  },
  { month: 'Mar 25', cases: 61, ltowb: 31, prbc: 20, plasma: 10 },
  { month: 'Apr 25', cases: 55, ltowb: 27, prbc: 17, plasma: 11 },
  { month: 'May 25', cases: 63, ltowb: 32, prbc: 21, plasma: 10 },
  { month: 'Jun 25', cases: 58, ltowb: 29, prbc: 18, plasma: 11 },
  { month: 'Jul 25', cases: 71, ltowb: 36, prbc: 23, plasma: 12 },
  { month: 'Aug 25', cases: 68, ltowb: 34, prbc: 22, plasma: 12 },
  { month: 'Sep 25', cases: 59, ltowb: 30, prbc: 19, plasma: 10 },
  { month: 'Oct 25', cases: 74, ltowb: 38, prbc: 24, plasma: 12 },
  { month: 'Nov 25', cases: 67, ltowb: 33, prbc: 22, plasma: 12 },
  { month: 'Dec 25', cases: 72, ltowb: 37, prbc: 23, plasma: 12 },
  { month: 'Jan 26', cases: 78, ltowb: 40, prbc: 25, plasma: 13 },
  { month: 'Feb 26', cases: 81, ltowb: 42, prbc: 26, plasma: 13 },
  { month: 'Mar 26', cases: 77, ltowb: 39, prbc: 25, plasma: 13 },
]

// Time-to-transfusion distribution (minutes)
const TIME_TO_TRANSFUSION = [
  { bin: '0–5',   count: 48  },
  { bin: '6–10',  count: 214 },
  { bin: '11–15', count: 398 },
  { bin: '16–20', count: 287 },
  { bin: '21–30', count: 198 },
  { bin: '31–45', count: 98  },
  { bin: '>45',   count: 41  },
]

// Shock index at time of transfusion
const SHOCK_INDEX_DIST = [
  { bin: '< 0.6',    count: 38,  label: 'Normal'   },
  { bin: '0.6–0.9',  count: 186, label: 'Borderline' },
  { bin: '1.0–1.3',  count: 412, label: 'Elevated'  },
  { bin: '1.4–1.7',  count: 384, label: 'High'      },
  { bin: '> 1.7',    count: 264, label: 'Critical'  },
]

// Survival by pre-transfusion SBP range
const SURVIVAL_BY_SBP = [
  { sbp: '< 50',   rate: 42.1, n: 57  },
  { sbp: '50–69',  rate: 61.8, n: 212 },
  { sbp: '70–89',  rate: 74.3, n: 318 },
  { sbp: '90–109', rate: 86.2, n: 287 },
  { sbp: '≥ 110',  rate: 92.4, n: 148 },
]

// Units administered per case
const UNITS_PER_CASE = [
  { units: '1', count: 598 },
  { units: '2', count: 387 },
  { units: '3', count: 178 },
  { units: '4+', count: 121 },
]

// ─── Chart configs ─────────────────────────────────────────────────────────────

const volumeConfig = {
  ltowb:  { label: 'LTOWB',  color: '#DC2626' },
  prbc:   { label: 'pRBC',   color: '#B91C1C' },
  plasma: { label: 'Plasma', color: '#1B2B4B' },
} satisfies ChartConfig

const survivalConfig = {
  rate: { label: 'Survival %', color: '#22C55E' },
} satisfies ChartConfig

const timeConfig = {
  count: { label: 'Cases', color: '#1B2B4B' },
} satisfies ChartConfig

const sbpConfig = {
  rate: { label: 'Survival %', color: '#22C55E' },
} satisfies ChartConfig

const unitsConfig = {
  count: { label: 'Cases', color: '#DC2626' },
} satisfies ChartConfig

const shockConfig = {
  count: { label: 'Cases', color: '#F59E0B' },
} satisfies ChartConfig

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: typeof SUMMARY_STATS[0] }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground leading-snug">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: stat.color + '18' }}>
            <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function RegistryAnalytics() {
  const [dateRange, setDateRange] = useState('all')
  const [region, setRegion] = useState('all')

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">Program Analytics</h1>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <ShieldCheck className="h-3 w-3 text-green-600" />
              De-identified
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Aggregate data across all participating agencies — no patient identifiers included
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
            <SelectItem value="12mo">Last 12 months</SelectItem>
            <SelectItem value="6mo">Last 6 months</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            <SelectItem value="FL">Florida</SelectItem>
            <SelectItem value="TX">Texas</SelectItem>
            <SelectItem value="CA">California</SelectItem>
            <SelectItem value="NY">New York</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Product type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            <SelectItem value="ltowb">LTOWB</SelectItem>
            <SelectItem value="prbc">pRBC</SelectItem>
            <SelectItem value="plasma">Plasma</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Indication" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All indications</SelectItem>
            <SelectItem value="trauma">Trauma</SelectItem>
            <SelectItem value="gi">GI Hemorrhage</SelectItem>
            <SelectItem value="ob">Obstetric</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SUMMARY_STATS.map((s) => <StatCard key={s.label} stat={s} />)}
      </div>

      {/* Row 1: Volume trend + Product mix */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly case volume by product type</CardTitle>
            <CardDescription>Jan 2025 – Mar 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={volumeConfig} className="h-[240px] w-full">
              <BarChart data={VOLUME_TREND} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="ltowb"  stackId="a" fill="#DC2626" radius={[0,0,0,0]} />
                <Bar dataKey="prbc"   stackId="a" fill="#B91C1C" radius={[0,0,0,0]} />
                <Bar dataKey="plasma" stackId="a" fill="#1B2B4B" radius={[4,4,0,0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Product mix</CardTitle>
            <CardDescription>All time, n=1,284</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={{}} className="h-[180px] w-full">
              <PieChart>
                <Pie
                  data={PRODUCT_MIX}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {PRODUCT_MIX.map((_, i) => (
                    <Cell key={i} fill={PRODUCT_COLORS[i]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 text-sm shadow">
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-muted-foreground">{d.value.toLocaleString()} cases ({d.pct}%)</p>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 w-full">
              {PRODUCT_MIX.map((p, i) => (
                <div key={p.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: PRODUCT_COLORS[i] }} />
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-auto">{p.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Survival by indication + SBP */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Survival rate by indication</CardTitle>
            <CardDescription>ED arrival survival, all cases</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={survivalConfig} className="h-[260px] w-full">
              <BarChart data={SURVIVAL_BY_INDICATION} layout="vertical" barSize={14}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="indication" type="category" width={148} tick={{ fontSize: 11 }} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 text-sm shadow">
                        <p className="font-semibold">{d.indication}</p>
                        <p className="text-muted-foreground">{d.survived}/{d.total} survived ({d.rate}%)</p>
                      </div>
                    )
                  }}
                />
                <ReferenceLine x={81.4} stroke="#9CA3AF" strokeDasharray="4 4" label={{ value: 'Overall avg', position: 'top', fontSize: 10, fill: '#6B7280' }} />
                <Bar dataKey="rate" fill="#22C55E" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Survival rate by pre-transfusion SBP</CardTitle>
            <CardDescription>Field systolic BP at time of first unit</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sbpConfig} className="h-[260px] w-full">
              <BarChart data={SURVIVAL_BY_SBP} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="sbp" tick={{ fontSize: 12 }} label={{ value: 'SBP (mmHg)', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 text-sm shadow">
                        <p className="font-semibold">SBP {d.sbp} mmHg</p>
                        <p className="text-muted-foreground">Survival: {d.rate}%</p>
                        <p className="text-muted-foreground">n = {d.n}</p>
                      </div>
                    )
                  }}
                />
                <Bar
                  dataKey="rate"
                  radius={[4,4,0,0]}
                >
                  {SURVIVAL_BY_SBP.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.rate >= 85 ? '#22C55E' : d.rate >= 70 ? '#F59E0B' : '#DC2626'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Time to transfusion + Shock index + Units per case */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Time to transfusion</CardTitle>
            <CardDescription>Scene to first unit administered (min)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={timeConfig} className="h-[220px] w-full">
              <BarChart data={TIME_TO_TRANSFUSION} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine x="11–15" stroke="#1B2B4B" strokeDasharray="3 3" />
                <Bar dataKey="count" fill="#1B2B4B" radius={[4,4,0,0]} />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground text-center mt-1">Median: 11.2 min &nbsp;|&nbsp; 75th pct: 22 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Shock index at transfusion</CardTitle>
            <CardDescription>Field shock index distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={shockConfig} className="h-[220px] w-full">
              <BarChart data={SHOCK_INDEX_DIST} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 text-sm shadow">
                        <p className="font-semibold">SI {d.bin} — {d.label}</p>
                        <p className="text-muted-foreground">{d.count} cases</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {SHOCK_INDEX_DIST.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.label === 'Normal'     ? '#22C55E' :
                        d.label === 'Borderline' ? '#86EFAC' :
                        d.label === 'Elevated'   ? '#F59E0B' :
                        d.label === 'High'       ? '#F97316' : '#DC2626'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {Math.round((648 + 264) / 12.84)}% had SI ≥ 1.0 at time of transfusion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Units administered per case</CardTitle>
            <CardDescription>All product types combined</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={unitsConfig} className="h-[220px] w-full">
              <BarChart data={UNITS_PER_CASE} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="units" tick={{ fontSize: 12 }} label={{ value: 'Units', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#DC2626" radius={[4,4,0,0]} />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground text-center mt-1">Mean: 1.7 units &nbsp;|&nbsp; Max on record: 8</p>
          </CardContent>
        </Card>
      </div>

      {/* De-identification notice */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">De-identified aggregate data only</p>
          <p className="text-amber-700 mt-0.5">
            All data on this page is aggregated across agencies and contains no patient identifiers.
            Case-level records with identifiers are accessible only through the Outcomes review workflow
            by authorized program personnel.
          </p>
        </div>
      </div>

    </div>
  )
}
