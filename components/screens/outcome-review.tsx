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
import { cn } from '@/lib/utils'
import { CheckCircle, Droplet, MapPin, Clock, Sparkles } from 'lucide-react'

function AutoFilledBadge() {
  return (
    <Badge variant="outline" className="border-info/50 bg-info/10 text-info text-xs gap-1">
      <Sparkles className="h-3 w-3" />
      Auto-filled from EHR
    </Badge>
  )
}

export function OutcomeReview() {
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

  const labResults = [
    { test: 'Hemoglobin', result: '7.2 g/dL', autoFilled: true },
    { test: 'INR', result: '1.8', autoFilled: true },
    { test: 'Platelets', result: '89 k/uL', autoFilled: true },
    { test: 'Lactate', result: '4.2 mmol/L', autoFilled: true },
    { test: 'Ionized Calcium', result: '0.98 mmol/L', autoFilled: true },
    { test: 'Blood Type / Rh', result: 'O Positive', autoFilled: true },
    { test: 'hCG Qualitative', result: 'Negative', autoFilled: true },
    { test: 'TEG', result: null, autoFilled: false },
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
                March 15, 2024 • Hillsborough County Fire Rescue
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-primary-foreground/20 text-primary-foreground">
                <Droplet className="mr-1 h-3 w-3" />
                1 unit LTOWB
              </Badge>
              <Badge className="bg-primary-foreground/20 text-primary-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                University Hospital ED
              </Badge>
              <Badge className="bg-accent text-accent-foreground">
                <Clock className="mr-1 h-3 w-3" />
                Review due: 49hr post-arrival
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hospital Encounter Section */}
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

      {/* Admission Labs Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Admission Labs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labResults.map((lab) => (
                <TableRow key={lab.test}>
                  <TableCell className="font-medium">{lab.test}</TableCell>
                  <TableCell>
                    {lab.autoFilled ? (
                      lab.result
                    ) : (
                      <Input placeholder="Enter value" className="h-8 w-32" />
                    )}
                  </TableCell>
                  <TableCell>
                    {lab.autoFilled ? (
                      <AutoFilledBadge />
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Manual entry required
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SEMSTAR Survival Section */}
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
                    <div
                      className={cn(
                        'absolute right-full h-0.5 w-16',
                        survivalMilestones[index - 1].complete ? 'bg-success' : 'bg-border'
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2',
                      milestone.complete
                        ? 'border-success bg-success text-success-foreground'
                        : 'border-border bg-muted text-muted-foreground'
                    )}
                  >
                    {milestone.complete ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-medium">{milestone.time}</span>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs',
                    milestone.complete ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {milestone.label}
                </span>
                {!milestone.complete && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    Pending
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hospital Interventions Section */}
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
                    setInterventions({ ...interventions, [item.key]: checked })
                  }
                />
                <label
                  htmlFor={item.key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">MTP Recipient</p>
              <Badge variant="outline" className="mt-1 text-xs text-muted-foreground">
                Manual entry required
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">No</span>
              <Switch checked={mtpRecipient} onCheckedChange={setMtpRecipient} />
              <span className="text-sm text-muted-foreground">Yes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Outcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Neurological outcome</Label>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Manual entry required
              </Badge>
            </div>
            <Select>
              <SelectTrigger>
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
            <Label>Alive at 30 days</Label>
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

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="text-muted-foreground">
          Save Draft
        </Button>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          Confirm & Submit to Registry
        </Button>
      </div>
    </div>
  )
}
