'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { 
  Droplet, 
  Check,
  AlertTriangle,
  Minus,
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
  Scan,
  Clock
} from 'lucide-react'
import { generateNEMSISXML, type TransfusionNEMSISData } from '@/lib/nemsis/field-mapping'

// Large touch-friendly toggle button
function TapButton({ 
  selected, 
  onClick, 
  children, 
  className,
  size = 'default'
}: { 
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  size?: 'default' | 'lg' | 'sm'
}) {
  const sizeClasses = {
    sm: 'h-12 text-base px-3',
    default: 'h-14 text-lg px-4',
    lg: 'h-16 text-xl px-6'
  }
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl font-medium transition-all active:scale-95 border-2 flex items-center justify-center',
        sizeClasses[size],
        selected 
          ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
          : 'bg-card text-card-foreground border-border hover:border-primary/50',
        className
      )}
    >
      {children}
    </button>
  )
}

// Number stepper for vitals
function VitalStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 300,
  step = 5,
  unit,
  alert
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  alert?: boolean
}) {
  const increment = () => onChange(Math.min((value || min) + step, max))
  const decrement = () => onChange(Math.max((value || min) - step, min))
  
  return (
    <div className={cn(
      'rounded-xl border-2 p-3 transition-colors',
      alert ? 'border-destructive bg-destructive/5' : 'border-border'
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <Minus className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center">
          <Input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
            className="text-3xl font-bold text-center h-14 border-0 bg-transparent"
            placeholder="--"
          />
        </div>
        <button
          type="button"
          onClick={increment}
          className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

// Collapsible section
function Section({ 
  title, 
  children, 
  defaultOpen = true,
  badge
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full py-4 px-1 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {open && <div className="pb-4 space-y-4">{children}</div>}
    </div>
  )
}

interface FormState {
  // Patient & Event (auto-captured where possible)
  timestamp: Date
  unitId: string
  patientId: string
  
  // Age - quick select
  ageGroup: 'adult' | 'peds_infant' | 'peds_child' | null
  
  // Gender
  gender: 'M' | 'F' | null
  
  // Critical vitals only
  sbp: number | null
  hr: number | null
  
  // Physiologic signs (tap to toggle)
  alteredMental: boolean
  paleSkin: boolean
  
  // Indication (single tap)
  indication: 'trauma' | 'gi_bleed' | 'ob' | 'other' | null
  
  // Blood product (most common is LWBB)
  productType: 'lwbb' | 'prbc' | 'plasma' | 'platelets' | null
  unitsGiven: number
  productIds: string[]
  
  // Complications (default none)
  complication: 'none' | 'reaction' | 'other' | null
  
  // Destination
  destination: string
}

const initialState: FormState = {
  timestamp: new Date(),
  unitId: '',
  patientId: '',
  ageGroup: null,
  gender: null,
  sbp: null,
  hr: null,
  alteredMental: false,
  paleSkin: false,
  indication: null,
  productType: 'lwbb',
  unitsGiven: 1,
  productIds: [''],
  complication: 'none',
  destination: ''
}

export function RapidDocument() {
  const [form, setForm] = useState<FormState>(initialState)
  const [showExport, setShowExport] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Calculate shock index
  const shockIndex = form.sbp && form.hr ? (form.hr / form.sbp).toFixed(1) : null
  const siAlert = shockIndex ? parseFloat(shockIndex) > 1.0 : false
  
  // Check if transfusion criteria met
  const criteriaMet = {
    sbp: form.ageGroup === 'adult' ? (form.sbp !== null && form.sbp < 90) : (form.sbp !== null && form.sbp < 70),
    hr: form.ageGroup === 'adult' ? (form.hr !== null && form.hr > 120) : (form.hr !== null && form.hr > 140),
    si: siAlert,
    physio: form.alteredMental || form.paleSkin
  }
  const totalCriteriaMet = Object.values(criteriaMet).filter(Boolean).length
  
  // Update field helper
  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }
  
  // Add/remove product ID
  const addProductId = () => {
    setForm(prev => ({ ...prev, productIds: [...prev.productIds, ''] }))
  }
  
  const updateProductId = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      productIds: prev.productIds.map((id, i) => i === index ? value : id)
    }))
  }
  
  // Check if form is complete enough
  const isComplete = form.indication && form.productType && form.unitsGiven > 0
  
  // Export to NEMSIS
  const handleExport = useCallback(() => {
    const data: TransfusionNEMSISData = {
      unit_id: form.unitId,
      age: form.ageGroup === 'adult' ? 45 : form.ageGroup === 'peds_infant' ? 0 : 5,
      gender: form.gender === 'M' ? 'Male' : form.gender === 'F' ? 'Female' : undefined,
      vitals_datetime: form.timestamp.toISOString(),
      sbp: form.sbp ?? undefined,
      hr: form.hr ?? undefined,
      altered_mental_status: form.alteredMental,
      pale_skin: form.paleSkin,
      blood_products: form.productIds.filter(Boolean).map(id => ({
        product_type: form.productType?.toUpperCase() || 'LWBB',
        unit_id: id,
        volume_ml: 250,
        start_time: form.timestamp.toISOString()
      })),
      destination_facility: form.destination,
      indication: form.indication === 'trauma' ? 'INJURY' : 
                  form.indication === 'gi_bleed' ? 'GI_BLEED' : 
                  form.indication === 'ob' ? 'OBSTETRIC_GYNECOLOGIC' : 'OTHER',
      patient_disposition: 'Transport'
    }
    
    const xml = generateNEMSISXML(data)
    
    // Download
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transfusion-${form.patientId || 'pt'}-${form.timestamp.toISOString().slice(0,10)}.xml`
    a.click()
    URL.revokeObjectURL(url)
    
    setShowExport(true)
  }, [form])
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header with time */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplet className="h-6 w-6 text-destructive" />
            <span className="font-bold text-lg">Blood Transfusion</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        {/* Criteria status bar */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Criteria:</span>
          <Badge 
            variant={totalCriteriaMet >= 2 ? 'destructive' : 'secondary'}
            className="text-sm"
          >
            {totalCriteriaMet}/4 Met
          </Badge>
          {totalCriteriaMet >= 2 && (
            <Badge variant="outline" className="text-sm border-destructive text-destructive">
              Transfusion Indicated
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4 pb-32 space-y-2">
        {/* Unit ID - quick entry */}
        <Section title="Unit" defaultOpen={!form.unitId}>
          <Input
            value={form.unitId}
            onChange={(e) => update('unitId', e.target.value)}
            placeholder="Unit ID (e.g., M-51)"
            className="h-14 text-xl"
          />
        </Section>
        
        {/* Patient - just age group and gender */}
        <Section 
          title="Patient" 
          badge={form.ageGroup && form.gender ? <Check className="h-4 w-4 text-success" /> : null}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <TapButton
                selected={form.ageGroup === 'adult'}
                onClick={() => update('ageGroup', 'adult')}
                size="lg"
              >
                Adult
              </TapButton>
              <TapButton
                selected={form.ageGroup === 'peds_child'}
                onClick={() => update('ageGroup', 'peds_child')}
                size="lg"
              >
                Peds
              </TapButton>
              <TapButton
                selected={form.ageGroup === 'peds_infant'}
                onClick={() => update('ageGroup', 'peds_infant')}
                size="lg"
              >
                Infant
              </TapButton>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TapButton
                selected={form.gender === 'M'}
                onClick={() => update('gender', 'M')}
              >
                Male
              </TapButton>
              <TapButton
                selected={form.gender === 'F'}
                onClick={() => update('gender', 'F')}
              >
                Female
              </TapButton>
            </div>
          </div>
        </Section>
        
        {/* Vitals - just SBP and HR with steppers */}
        <Section 
          title="Vitals" 
          badge={
            shockIndex ? (
              <Badge variant={siAlert ? 'destructive' : 'secondary'}>
                SI: {shockIndex}
              </Badge>
            ) : null
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <VitalStepper
              label="SBP"
              value={form.sbp}
              onChange={(v) => update('sbp', v)}
              min={40}
              max={200}
              step={5}
              unit="mmHg"
              alert={criteriaMet.sbp}
            />
            <VitalStepper
              label="HR"
              value={form.hr}
              onChange={(v) => update('hr', v)}
              min={30}
              max={220}
              step={5}
              unit="bpm"
              alert={criteriaMet.hr}
            />
          </div>
          
          {/* Quick physiologic signs */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <TapButton
              selected={form.alteredMental}
              onClick={() => update('alteredMental', !form.alteredMental)}
              size="sm"
            >
              {form.alteredMental && <Check className="h-4 w-4 mr-2" />}
              Altered Mental
            </TapButton>
            <TapButton
              selected={form.paleSkin}
              onClick={() => update('paleSkin', !form.paleSkin)}
              size="sm"
            >
              {form.paleSkin && <Check className="h-4 w-4 mr-2" />}
              Pale/Cool
            </TapButton>
          </div>
        </Section>
        
        {/* Indication - single tap */}
        <Section 
          title="Indication" 
          badge={form.indication ? <Check className="h-4 w-4 text-success" /> : null}
        >
          <div className="grid grid-cols-2 gap-2">
            <TapButton
              selected={form.indication === 'trauma'}
              onClick={() => update('indication', 'trauma')}
              className="col-span-2"
              size="lg"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Trauma / Hemorrhage
            </TapButton>
            <TapButton
              selected={form.indication === 'gi_bleed'}
              onClick={() => update('indication', 'gi_bleed')}
            >
              GI Bleed
            </TapButton>
            <TapButton
              selected={form.indication === 'ob'}
              onClick={() => update('indication', 'ob')}
            >
              OB/GYN
            </TapButton>
            <TapButton
              selected={form.indication === 'other'}
              onClick={() => update('indication', 'other')}
              className="col-span-2"
              size="sm"
            >
              Other
            </TapButton>
          </div>
        </Section>
        
        {/* Blood Product - quick select */}
        <Section 
          title="Blood Product" 
          badge={
            form.productType ? (
              <Badge variant="destructive">{form.unitsGiven} unit{form.unitsGiven > 1 ? 's' : ''}</Badge>
            ) : null
          }
        >
          <div className="space-y-3">
            {/* Product type */}
            <div className="grid grid-cols-2 gap-2">
              <TapButton
                selected={form.productType === 'lwbb'}
                onClick={() => update('productType', 'lwbb')}
                size="lg"
                className="col-span-2"
              >
                <Droplet className="h-5 w-5 mr-2 text-destructive" />
                LWBB (Whole Blood)
              </TapButton>
              <TapButton
                selected={form.productType === 'prbc'}
                onClick={() => update('productType', 'prbc')}
              >
                PRBCs
              </TapButton>
              <TapButton
                selected={form.productType === 'plasma'}
                onClick={() => update('productType', 'plasma')}
              >
                Plasma
              </TapButton>
            </div>
            
            {/* Units given - big buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Units:</span>
              <div className="flex-1 flex gap-2">
                {[1, 2, 3, 4].map(n => (
                  <TapButton
                    key={n}
                    selected={form.unitsGiven === n}
                    onClick={() => update('unitsGiven', n)}
                    className="flex-1"
                  >
                    {n}
                  </TapButton>
                ))}
              </div>
            </div>
            
            {/* Product IDs - scan or type */}
            <div className="space-y-2">
              {form.productIds.map((id, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={id}
                    onChange={(e) => updateProductId(i, e.target.value)}
                    placeholder={`Unit ${i + 1} ID`}
                    className="h-12 text-lg flex-1"
                  />
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <Scan className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              {form.productIds.length < form.unitsGiven && (
                <Button 
                  variant="ghost" 
                  onClick={addProductId}
                  className="w-full h-12"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit ID
                </Button>
              )}
            </div>
          </div>
        </Section>
        
        {/* Complications - default none */}
        <Section title="Complications" defaultOpen={false}>
          <div className="grid grid-cols-3 gap-2">
            <TapButton
              selected={form.complication === 'none'}
              onClick={() => update('complication', 'none')}
              className="col-span-2"
            >
              <Check className="h-4 w-4 mr-2" />
              None
            </TapButton>
            <TapButton
              selected={form.complication === 'reaction'}
              onClick={() => update('complication', 'reaction')}
            >
              Reaction
            </TapButton>
          </div>
        </Section>
        
        {/* Destination - common facilities */}
        <Section title="Destination" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {['Level 1 Trauma', 'Community Hospital', 'Pediatric Center', 'Other'].map(dest => (
              <TapButton
                key={dest}
                selected={form.destination === dest}
                onClick={() => update('destination', dest)}
              >
                {dest}
              </TapButton>
            ))}
          </div>
        </Section>
      </div>
      
      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-14 text-lg"
            onClick={() => setForm(initialState)}
          >
            Clear
          </Button>
          <Button 
            className="flex-[2] h-14 text-lg bg-primary"
            disabled={!isComplete}
            onClick={handleExport}
          >
            <Download className="h-5 w-5 mr-2" />
            Export to ePCR
          </Button>
        </div>
      </div>
      
      {/* Success toast */}
      {showExport && (
        <div className="fixed top-20 left-4 right-4 bg-success text-success-foreground p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top">
          <Check className="h-6 w-6" />
          <div>
            <p className="font-semibold">NEMSIS XML Exported</p>
            <p className="text-sm opacity-90">Ready to import to ePCR</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={() => setShowExport(false)}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  )
}
