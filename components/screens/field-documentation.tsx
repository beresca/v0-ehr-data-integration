'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Scan, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

type Gender = 'male' | 'female' | 'unknown' | null
type ProductType = 'LTOWB' | 'O-Neg WB' | 'pRBC' | 'Liquid Plasma' | 'Dried Plasma' | 'Platelets' | null
type Route = 'iv-small' | 'iv-large' | 'io' | null

export function FieldDocumentation() {
  const [gender, setGender] = useState<Gender>(null)
  const [productType, setProductType] = useState<ProductType>(null)
  const [route, setRoute] = useState<Route>(null)
  const [coldChain, setColdChain] = useState(true)
  const [rhNotification, setRhNotification] = useState<string | null>(null)

  // Vital signs state
  const [vitals, setVitals] = useState({
    sbp: '',
    hr: '',
    shockIndex: '',
    rr: '',
    etco2: '',
  })

  // Physiologic signs state
  const [physioSigns, setPhysioSigns] = useState({
    alteredMental: false,
    paleMucosa: false,
    capRefill: false,
  })

  const productTypes: ProductType[] = ['LTOWB', 'O-Neg WB', 'pRBC', 'Liquid Plasma', 'Dried Plasma', 'Platelets']

  // Calculate if criteria are met
  const isSbpMet = vitals.sbp !== '' && Number(vitals.sbp) < 90
  const isHrMet = vitals.hr !== '' && Number(vitals.hr) > 100
  const isShockMet = vitals.shockIndex !== '' && Number(vitals.shockIndex) > 0.9
  const isRrMet = vitals.rr !== '' && Number(vitals.rr) > 20
  const isEtco2Met = vitals.etco2 !== '' && Number(vitals.etco2) < 25

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Patient & Incident Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Patient & Incident</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wristband">EMS Wristband ID</Label>
              <Input id="wristband" placeholder="Scan or enter ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date of transfusion</Label>
              <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Transporting unit / Helo #</Label>
              <Input id="unit" placeholder="e.g., Medic 42, N911AE" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination facility</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">University Hospital ED</SelectItem>
                  <SelectItem value="memorial">Memorial Regional</SelectItem>
                  <SelectItem value="jackson">Jackson Memorial</SelectItem>
                  <SelectItem value="tampa">Tampa General</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Patient age</Label>
              <Input id="age" type="number" placeholder="Years" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex rounded-md border bg-muted/50 p-1">
                {(['male', 'female', 'unknown'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      'flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                      gender === g
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood Product Section */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Blood Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Product Type */}
          <div className="space-y-2">
            <Label>Product type</Label>
            <div className="grid grid-cols-3 gap-2">
              {productTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProductType(type)}
                  className={cn(
                    'rounded-md border px-3 py-2.5 text-sm font-medium transition-all',
                    productType === type
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitId">Unit ID / barcode</Label>
              <div className="relative">
                <Input id="unitId" placeholder="Scan barcode" className="pr-10" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                >
                  <Scan className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="units">Units administered</Label>
              <Input id="units" type="number" defaultValue={1} min={1} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Route of administration</Label>
            <div className="flex rounded-md border bg-muted/50 p-1">
              {[
                { value: 'iv-small', label: 'IV <18g' },
                { value: 'iv-large', label: 'IV ≥18g' },
                { value: 'io', label: 'IO' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRoute(r.value as Route)}
                  className={cn(
                    'flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                    route === r.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Transfusion start time</Label>
              <Input id="startTime" type="time" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Transfusion end time</Label>
              <Input id="endTime" type="time" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  coldChain ? 'bg-success/20' : 'bg-destructive/20'
                )}
              >
                {coldChain ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Cold chain confirmed</p>
                <p className="text-xs text-muted-foreground">Product maintained at proper temperature</p>
              </div>
            </div>
            <Switch
              checked={coldChain}
              onCheckedChange={setColdChain}
              className={cn(coldChain ? 'data-[state=checked]:bg-success' : 'data-[state=unchecked]:bg-destructive')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Indication Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Indication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Vital Signs */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Vital Signs</h4>
              <div className="space-y-2">
                {[
                  { label: 'SBP < 90', key: 'sbp', met: isSbpMet, placeholder: 'mmHg' },
                  { label: 'HR > 100', key: 'hr', met: isHrMet, placeholder: 'bpm' },
                  { label: 'Shock Index > 0.9', key: 'shockIndex', met: isShockMet, placeholder: 'SI' },
                  { label: 'RR > 20', key: 'rr', met: isRrMet, placeholder: '/min' },
                  { label: 'ETCO2 < 25', key: 'etco2', met: isEtco2Met, placeholder: 'mmHg' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={item.placeholder}
                      className="w-20"
                      value={vitals[item.key as keyof typeof vitals]}
                      onChange={(e) => setVitals({ ...vitals, [item.key]: e.target.value })}
                    />
                    <span className="flex-1 text-sm">{item.label}</span>
                    <Badge
                      variant={
                        vitals[item.key as keyof typeof vitals] === ''
                          ? 'outline'
                          : item.met
                          ? 'default'
                          : 'secondary'
                      }
                      className={cn(
                        'text-xs',
                        vitals[item.key as keyof typeof vitals] !== '' &&
                          item.met &&
                          'bg-success text-success-foreground'
                      )}
                    >
                      {vitals[item.key as keyof typeof vitals] === ''
                        ? '—'
                        : item.met
                        ? 'Met'
                        : 'Not Met'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Physiologic Signs */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Physiologic Signs</h4>
              <div className="space-y-2">
                {[
                  { label: 'Altered mental status', key: 'alteredMental' },
                  { label: 'Pale mucosa', key: 'paleMucosa' },
                  { label: 'Capillary refill > 2 sec', key: 'capRefill' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <Switch
                      checked={physioSigns[item.key as keyof typeof physioSigns]}
                      onCheckedChange={(checked) =>
                        setPhysioSigns({ ...physioSigns, [item.key]: checked })
                      }
                    />
                    <span className="flex-1 text-sm">{item.label}</span>
                    <Badge
                      variant={physioSigns[item.key as keyof typeof physioSigns] ? 'default' : 'secondary'}
                      className={cn(
                        'text-xs',
                        physioSigns[item.key as keyof typeof physioSigns] &&
                          'bg-success text-success-foreground'
                      )}
                    >
                      {physioSigns[item.key as keyof typeof physioSigns] ? 'Present' : 'Not Present'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: 'EMS Medical Director',
              sublabel: 'Order signature required',
              status: 'pending',
              action: true,
            },
            { label: 'EMS Chief', sublabel: 'Notification sent', status: 'sent' },
            { label: 'Blood Bank', sublabel: 'University Hospital ED', status: 'sent' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sublabel}</p>
              </div>
              {item.action ? (
                <Button size="sm" className="bg-accent hover:bg-accent/90">
                  Sign Order
                </Button>
              ) : (
                <Badge
                  variant={item.status === 'sent' ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    item.status === 'sent' && 'bg-success text-success-foreground'
                  )}
                >
                  {item.status === 'sent' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Sent
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rh Flag - Only show for female patients */}
      {gender === 'female' && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-foreground" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="font-medium text-warning-foreground">Female patient</p>
                  <p className="text-sm text-warning-foreground/80">
                    Blood bank notification required for Rh-negative follow-up.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-warning-foreground">Blood bank notified</Label>
                  <div className="flex gap-2">
                    {['Yes', 'No', 'Not Indicated'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRhNotification(option)}
                        className={cn(
                          'rounded-md border px-4 py-2 text-sm font-medium transition-all',
                          rhNotification === option
                            ? 'border-warning-foreground bg-warning-foreground text-warning'
                            : 'border-warning-foreground/30 text-warning-foreground hover:border-warning-foreground/60'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
        Submit & Notify
      </Button>
    </div>
  )
}
