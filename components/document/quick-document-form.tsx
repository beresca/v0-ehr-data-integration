'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertTriangle,
  Droplet,
  Heart,
  Activity,
  FileDown,
  Save,
  Ambulance,
  Clock,
  User,
  Building2,
  Plus,
  Trash2,
  FileCode,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BLOOD_PRODUCT_TYPES, generateNEMSISXML, type TransfusionNEMSISData } from '@/lib/nemsis/field-mapping'

// Steps for rapid documentation
const STEPS = [
  { id: 'event', title: 'Event Info', icon: Ambulance, description: 'Unit & timing' },
  { id: 'patient', title: 'Patient', icon: User, description: 'Demographics' },
  { id: 'vitals', title: 'Vitals', icon: Heart, description: 'Signs & thresholds' },
  { id: 'product', title: 'Blood Product', icon: Droplet, description: 'Transfusion details' },
  { id: 'outcome', title: 'Outcome', icon: Activity, description: 'Complications & disposition' },
  { id: 'review', title: 'Review & Export', icon: FileDown, description: 'NEMSIS export' },
]

interface BloodProduct {
  id: string
  product_type: string
  unit_id: string
  volume_ml: number
  start_time: string
  response?: string
  complication?: string
}

interface FormData {
  // Event
  event_date: string
  event_time: string
  agency: string
  unit_id: string
  
  // Patient
  patient_uid: string
  age: string
  age_unit: 'years' | 'months'
  gender: string
  blood_type: string
  
  // Vitals
  sbp: string
  hr: string
  rr: string
  etco2: string
  gcs: string
  shock_index: string
  
  // Physiologic signs
  altered_mental_status: boolean
  pale_skin: boolean
  capillary_refill_delayed: boolean
  
  // Blood products
  blood_products: BloodProduct[]
  
  // Indication
  indication: string
  indication_other: string
  
  // Outcome
  complication: string
  complication_details: string
  destination_facility: string
  patient_disposition: string
  blood_bank_notified: string
}

const initialFormData: FormData = {
  event_date: new Date().toISOString().split('T')[0],
  event_time: new Date().toTimeString().slice(0, 5),
  agency: '',
  unit_id: '',
  patient_uid: '',
  age: '',
  age_unit: 'years',
  gender: '',
  blood_type: '',
  sbp: '',
  hr: '',
  rr: '',
  etco2: '',
  gcs: '',
  shock_index: '',
  altered_mental_status: false,
  pale_skin: false,
  capillary_refill_delayed: false,
  blood_products: [],
  indication: '',
  indication_other: '',
  complication: 'NONE',
  complication_details: '',
  destination_facility: '',
  patient_disposition: '',
  blood_bank_notified: '',
}

export function QuickDocumentForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportedXML, setExportedXML] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Calculate shock index when HR and SBP change
  const calculateShockIndex = useCallback((hr: string, sbp: string) => {
    const hrNum = parseFloat(hr)
    const sbpNum = parseFloat(sbp)
    if (hrNum && sbpNum && sbpNum > 0) {
      return (hrNum / sbpNum).toFixed(2)
    }
    return ''
  }, [])

  // Update form data
  const updateField = useCallback((field: keyof FormData, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-calculate shock index
      if (field === 'hr' || field === 'sbp') {
        const hr = field === 'hr' ? value as string : prev.hr
        const sbp = field === 'sbp' ? value as string : prev.sbp
        newData.shock_index = calculateShockIndex(hr, sbp)
      }
      
      return newData
    })
  }, [calculateShockIndex])

  // Add blood product
  const addBloodProduct = useCallback(() => {
    const newProduct: BloodProduct = {
      id: `bp-${Date.now()}`,
      product_type: 'LWBB',
      unit_id: '',
      volume_ml: 250,
      start_time: formData.event_time,
    }
    updateField('blood_products', [...formData.blood_products, newProduct])
  }, [formData.blood_products, formData.event_time, updateField])

  // Update blood product
  const updateBloodProduct = useCallback((id: string, field: keyof BloodProduct, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      blood_products: prev.blood_products.map(bp => 
        bp.id === id ? { ...bp, [field]: value } : bp
      )
    }))
  }, [])

  // Remove blood product
  const removeBloodProduct = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      blood_products: prev.blood_products.filter(bp => bp.id !== id)
    }))
  }, [])

  // Check if current step is valid
  const isStepValid = useCallback((step: number) => {
    switch (step) {
      case 0: // Event
        return formData.event_date && formData.agency && formData.unit_id
      case 1: // Patient
        return formData.age && formData.gender
      case 2: // Vitals
        return formData.sbp || formData.hr // At least one vital
      case 3: // Blood Product
        return formData.blood_products.length > 0 && formData.indication
      case 4: // Outcome
        return formData.destination_facility && formData.patient_disposition
      default:
        return true
    }
  }, [formData])

  // Check vital thresholds
  const getVitalStatus = useCallback(() => {
    const age = parseInt(formData.age) || 0
    const sbp = parseInt(formData.sbp) || 0
    const hr = parseInt(formData.hr) || 0
    const si = parseFloat(formData.shock_index) || 0
    
    const isAdult = formData.age_unit === 'years' && age >= 18
    const isPediatric = !isAdult
    
    const thresholds: { label: string; met: boolean; value: string }[] = []
    
    if (isAdult) {
      if (formData.sbp) thresholds.push({ label: 'SBP < 90', met: sbp < 90, value: `${sbp} mmHg` })
      if (formData.hr) thresholds.push({ label: 'HR > 120', met: hr > 120, value: `${hr} bpm` })
      if (formData.shock_index) thresholds.push({ label: 'SI > 1.0', met: si > 1.0, value: si.toString() })
    } else {
      if (formData.sbp) thresholds.push({ label: `SBP < ${70 + age * 2}`, met: sbp < (70 + age * 2), value: `${sbp} mmHg` })
      if (formData.hr && age < 1) thresholds.push({ label: 'HR > 180', met: hr > 180, value: `${hr} bpm` })
      if (formData.hr && age >= 2 && age <= 10) thresholds.push({ label: 'HR > 140', met: hr > 140, value: `${hr} bpm` })
    }
    
    return thresholds
  }, [formData])

  // Generate NEMSIS XML
  const handleExportNEMSIS = useCallback(() => {
    const nemsisData: TransfusionNEMSISData = {
      agency_name: formData.agency,
      unit_id: formData.unit_id,
      age: parseInt(formData.age) || undefined,
      gender: formData.gender,
      vitals_datetime: `${formData.event_date}T${formData.event_time}:00`,
      sbp: parseInt(formData.sbp) || undefined,
      hr: parseInt(formData.hr) || undefined,
      rr: parseInt(formData.rr) || undefined,
      etco2: parseInt(formData.etco2) || undefined,
      gcs: parseInt(formData.gcs) || undefined,
      altered_mental_status: formData.altered_mental_status,
      pale_skin: formData.pale_skin,
      capillary_refill_delayed: formData.capillary_refill_delayed,
      blood_products: formData.blood_products.map(bp => ({
        product_type: bp.product_type,
        unit_id: bp.unit_id,
        volume_ml: bp.volume_ml,
        start_time: `${formData.event_date}T${bp.start_time}:00`,
        response: bp.response,
        complication: bp.complication,
      })),
      destination_facility: formData.destination_facility,
      patient_disposition: formData.patient_disposition,
      indication: formData.indication === 'OTHER' ? formData.indication_other : formData.indication,
      blood_bank_notified: formData.blood_bank_notified,
    }
    
    const xml = generateNEMSISXML(nemsisData)
    setExportedXML(xml)
    setShowExportDialog(true)
  }, [formData])

  // Download XML file
  const downloadXML = useCallback(() => {
    const blob = new Blob([exportedXML], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transfusion-${formData.patient_uid || 'unknown'}-${formData.event_date}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [exportedXML, formData.patient_uid, formData.event_date])

  // Save to database (demo mode)
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert('Saved! (Demo mode - would save to Supabase)')
  }, [])

  // Navigation
  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep])

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Event Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => updateField('event_date', e.target.value)}
                  className="text-lg h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_time">Event Time</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => updateField('event_time', e.target.value)}
                  className="text-lg h-12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agency">Agency</Label>
              <Select value={formData.agency} onValueChange={(v) => updateField('agency', v)}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Metro Fire EMS">Metro Fire EMS</SelectItem>
                  <SelectItem value="County EMS">County EMS</SelectItem>
                  <SelectItem value="Air Medical Transport">Air Medical Transport</SelectItem>
                  <SelectItem value="University Hospital EMS">University Hospital EMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit_id">Unit / Aircraft ID</Label>
              <Input
                id="unit_id"
                value={formData.unit_id}
                onChange={(e) => updateField('unit_id', e.target.value)}
                placeholder="e.g., M-51, HEMS-1"
                className="text-lg h-12"
              />
            </div>
          </div>
        )

      case 1: // Patient
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patient_uid">Patient UID (Wristband)</Label>
              <Input
                id="patient_uid"
                value={formData.patient_uid}
                onChange={(e) => updateField('patient_uid', e.target.value)}
                placeholder="Scan or enter patient ID"
                className="text-lg h-12"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="Age"
                  className="text-lg h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={formData.age_unit} onValueChange={(v: 'years' | 'months') => updateField('age_unit', v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">Years</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup 
                value={formData.gender} 
                onValueChange={(v) => updateField('gender', v)}
                className="flex gap-4"
              >
                <div className="flex-1">
                  <RadioGroupItem value="Male" id="male" className="peer sr-only" />
                  <Label
                    htmlFor="male"
                    className="flex items-center justify-center h-14 rounded-lg border-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted transition-colors"
                  >
                    Male
                  </Label>
                </div>
                <div className="flex-1">
                  <RadioGroupItem value="Female" id="female" className="peer sr-only" />
                  <Label
                    htmlFor="female"
                    className="flex items-center justify-center h-14 rounded-lg border-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted transition-colors"
                  >
                    Female
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Blood Type (if known)</Label>
              <div className="grid grid-cols-4 gap-2">
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(type => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.blood_type === type ? 'default' : 'outline'}
                    className="h-12"
                    onClick={() => updateField('blood_type', type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2: // Vitals
        const vitalStatus = getVitalStatus()
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sbp">SBP (mmHg)</Label>
                <Input
                  id="sbp"
                  type="number"
                  value={formData.sbp}
                  onChange={(e) => updateField('sbp', e.target.value)}
                  placeholder="Systolic BP"
                  className="text-lg h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hr">HR (bpm)</Label>
                <Input
                  id="hr"
                  type="number"
                  value={formData.hr}
                  onChange={(e) => updateField('hr', e.target.value)}
                  placeholder="Heart rate"
                  className="text-lg h-12"
                />
              </div>
            </div>
            
            {formData.shock_index && (
              <div className="p-3 rounded-lg bg-muted flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calculated Shock Index</span>
                <Badge variant={parseFloat(formData.shock_index) > 1 ? 'destructive' : 'secondary'} className="text-lg px-3">
                  {formData.shock_index}
                </Badge>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rr">RR</Label>
                <Input
                  id="rr"
                  type="number"
                  value={formData.rr}
                  onChange={(e) => updateField('rr', e.target.value)}
                  placeholder="Resp rate"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="etco2">ETCO2</Label>
                <Input
                  id="etco2"
                  type="number"
                  value={formData.etco2}
                  onChange={(e) => updateField('etco2', e.target.value)}
                  placeholder="mmHg"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gcs">GCS</Label>
                <Input
                  id="gcs"
                  type="number"
                  value={formData.gcs}
                  onChange={(e) => updateField('gcs', e.target.value)}
                  placeholder="3-15"
                  min={3}
                  max={15}
                  className="h-12"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label>Physiologic Signs of Hypoperfusion</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id="altered_mental" 
                    checked={formData.altered_mental_status}
                    onCheckedChange={(c) => updateField('altered_mental_status', c)}
                  />
                  <Label htmlFor="altered_mental" className="flex-1 cursor-pointer">Altered mental status</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id="pale_skin" 
                    checked={formData.pale_skin}
                    onCheckedChange={(c) => updateField('pale_skin', c)}
                  />
                  <Label htmlFor="pale_skin" className="flex-1 cursor-pointer">Pale skin/mucous membranes</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id="cap_refill" 
                    checked={formData.capillary_refill_delayed}
                    onCheckedChange={(c) => updateField('capillary_refill_delayed', c)}
                  />
                  <Label htmlFor="cap_refill" className="flex-1 cursor-pointer">{"Capillary refill > 2 seconds"}</Label>
                </div>
              </div>
            </div>
            
            {vitalStatus.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Threshold Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {vitalStatus.map((t, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "p-2 rounded-lg border text-sm flex items-center justify-between",
                          t.met ? "border-destructive bg-destructive/10" : "border-muted"
                        )}
                      >
                        <span>{t.label}</span>
                        <Badge variant={t.met ? 'destructive' : 'secondary'} className="ml-2">
                          {t.met ? 'MET' : 'NOT MET'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )

      case 3: // Blood Product
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base">Blood Products Administered</Label>
              <Button type="button" variant="outline" size="sm" onClick={addBloodProduct}>
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </div>
            
            {formData.blood_products.length === 0 ? (
              <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                <Droplet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No blood products added</p>
                <Button type="button" variant="link" onClick={addBloodProduct}>
                  Add first product
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.blood_products.map((bp, index) => (
                  <Card key={bp.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeBloodProduct(bp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Product #{index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Product Type</Label>
                          <Select 
                            value={bp.product_type} 
                            onValueChange={(v) => updateBloodProduct(bp.id, 'product_type', v)}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BLOOD_PRODUCT_TYPES.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Unit ID</Label>
                          <Input
                            value={bp.unit_id}
                            onChange={(e) => updateBloodProduct(bp.id, 'unit_id', e.target.value)}
                            placeholder="Scan barcode"
                            className="h-12"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Volume (mL)</Label>
                          <Input
                            type="number"
                            value={bp.volume_ml}
                            onChange={(e) => updateBloodProduct(bp.id, 'volume_ml', parseInt(e.target.value) || 0)}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={bp.start_time}
                            onChange={(e) => updateBloodProduct(bp.id, 'start_time', e.target.value)}
                            className="h-12"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-3">
              <Label>Indication for Transfusion</Label>
              <RadioGroup 
                value={formData.indication}
                onValueChange={(v) => updateField('indication', v)}
                className="grid grid-cols-2 gap-2"
              >
                {[
                  { value: 'INJURY', label: 'Injury/Trauma' },
                  { value: 'GI_BLEED', label: 'GI Bleed' },
                  { value: 'OBSTETRIC_GYNECOLOGIC', label: 'OB/GYN' },
                  { value: 'OTHER', label: 'Other' },
                ].map(opt => (
                  <div key={opt.value}>
                    <RadioGroupItem value={opt.value} id={`ind-${opt.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`ind-${opt.value}`}
                      className="flex items-center justify-center h-12 rounded-lg border-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted transition-colors"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {formData.indication === 'OTHER' && (
                <Input
                  value={formData.indication_other}
                  onChange={(e) => updateField('indication_other', e.target.value)}
                  placeholder="Specify other indication"
                  className="mt-2"
                />
              )}
            </div>
          </div>
        )

      case 4: // Outcome
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Complications</Label>
              <RadioGroup 
                value={formData.complication}
                onValueChange={(v) => updateField('complication', v)}
                className="space-y-2"
              >
                {[
                  { value: 'NONE', label: 'None', color: 'border-green-500' },
                  { value: 'TRANSFUSION_REACTION', label: 'Transfusion Reaction', color: 'border-amber-500' },
                  { value: 'OTHER', label: 'Other', color: 'border-muted' },
                ].map(opt => (
                  <div key={opt.value}>
                    <RadioGroupItem value={opt.value} id={`comp-${opt.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`comp-${opt.value}`}
                      className={cn(
                        "flex items-center h-14 px-4 rounded-lg border-2 cursor-pointer transition-colors",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted",
                        formData.complication === opt.value && opt.value === 'NONE' && "border-green-500 bg-green-50",
                        formData.complication === opt.value && opt.value === 'TRANSFUSION_REACTION' && "border-amber-500 bg-amber-50"
                      )}
                    >
                      {opt.value === 'NONE' && <Check className="h-5 w-5 mr-2 text-green-600" />}
                      {opt.value === 'TRANSFUSION_REACTION' && <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />}
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {formData.complication !== 'NONE' && (
                <Textarea
                  value={formData.complication_details}
                  onChange={(e) => updateField('complication_details', e.target.value)}
                  placeholder="Describe complication details..."
                  className="mt-2"
                  rows={3}
                />
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="destination">Destination Facility</Label>
              <Select value={formData.destination_facility} onValueChange={(v) => updateField('destination_facility', v)}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regional Medical Center">Regional Medical Center</SelectItem>
                  <SelectItem value="Trauma Center">Trauma Center</SelectItem>
                  <SelectItem value="University Hospital">University Hospital</SelectItem>
                  <SelectItem value="Children's Hospital">{"Children's Hospital"}</SelectItem>
                  <SelectItem value="Community Hospital">Community Hospital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="disposition">Patient Disposition</Label>
              <Select value={formData.patient_disposition} onValueChange={(v) => updateField('patient_disposition', v)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select disposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emergency Department">Emergency Department</SelectItem>
                  <SelectItem value="Operating Room">Operating Room</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Labor & Delivery">Labor & Delivery</SelectItem>
                  <SelectItem value="Trauma Bay">Trauma Bay</SelectItem>
                  <SelectItem value="Cath Lab">Cath Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.gender === 'Female' && parseInt(formData.age) < 55 && (
              <div className="space-y-2">
                <Label>Blood Bank Notified (Female under 55)</Label>
                <RadioGroup 
                  value={formData.blood_bank_notified}
                  onValueChange={(v) => updateField('blood_bank_notified', v)}
                  className="flex gap-2"
                >
                  {['YES', 'NO', 'NOT_INDICATED'].map(opt => (
                    <div key={opt} className="flex-1">
                      <RadioGroupItem value={opt} id={`bbn-${opt}`} className="peer sr-only" />
                      <Label
                        htmlFor={`bbn-${opt}`}
                        className="flex items-center justify-center h-12 rounded-lg border-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted transition-colors text-sm"
                      >
                        {opt === 'NOT_INDICATED' ? 'N/A' : opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
        )

      case 5: // Review & Export
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-muted-foreground">Event Date/Time</div>
                  <div>{formData.event_date} {formData.event_time}</div>
                  
                  <div className="text-muted-foreground">Agency/Unit</div>
                  <div>{formData.agency} - {formData.unit_id}</div>
                  
                  <div className="text-muted-foreground">Patient</div>
                  <div>{formData.age} {formData.age_unit}, {formData.gender}</div>
                  
                  <div className="text-muted-foreground">Blood Type</div>
                  <div>{formData.blood_type || 'Unknown'}</div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-muted-foreground mb-2">Vitals at Transfusion</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.sbp && <Badge variant="outline">SBP: {formData.sbp}</Badge>}
                    {formData.hr && <Badge variant="outline">HR: {formData.hr}</Badge>}
                    {formData.shock_index && (
                      <Badge variant={parseFloat(formData.shock_index) > 1 ? 'destructive' : 'outline'}>
                        SI: {formData.shock_index}
                      </Badge>
                    )}
                    {formData.rr && <Badge variant="outline">RR: {formData.rr}</Badge>}
                    {formData.etco2 && <Badge variant="outline">ETCO2: {formData.etco2}</Badge>}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-muted-foreground mb-2">Blood Products ({formData.blood_products.length})</div>
                  {formData.blood_products.map((bp, i) => (
                    <div key={bp.id} className="flex items-center gap-2 text-sm">
                      <Droplet className="h-4 w-4 text-destructive" />
                      <span>{BLOOD_PRODUCT_TYPES.find(t => t.value === bp.product_type)?.label}</span>
                      <span className="text-muted-foreground">- {bp.volume_ml}mL</span>
                      {bp.unit_id && <Badge variant="secondary" className="text-xs">{bp.unit_id}</Badge>}
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-muted-foreground">Indication</div>
                  <div>{formData.indication === 'OTHER' ? formData.indication_other : formData.indication}</div>
                  
                  <div className="text-muted-foreground">Complications</div>
                  <div className={cn(
                    formData.complication === 'NONE' ? 'text-green-600' : 'text-amber-600'
                  )}>
                    {formData.complication}
                  </div>
                  
                  <div className="text-muted-foreground">Destination</div>
                  <div>{formData.destination_facility}</div>
                  
                  <div className="text-muted-foreground">Disposition</div>
                  <div>{formData.patient_disposition}</div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col gap-3">
              <Button 
                type="button" 
                size="lg" 
                className="h-14 text-lg"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-5 w-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save to Registry'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                className="h-14"
                onClick={handleExportNEMSIS}
              >
                <FileCode className="h-5 w-5 mr-2" />
                Export NEMSIS XML
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-6 w-6 text-destructive" />
              <span className="font-semibold">Quick Document</span>
            </div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formData.event_date}
            </Badge>
          </div>
        </div>
      </header>
      
      {/* Progress Steps */}
      <div className="border-b bg-muted/30">
        <div className="container max-w-3xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isComplete = index < currentStep
              const isValid = isStepValid(index)
              
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 py-1 min-w-[60px] transition-colors",
                    isActive && "text-primary",
                    isComplete && "text-muted-foreground",
                    !isActive && !isComplete && "text-muted-foreground/50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isComplete && isValid && "border-green-500 bg-green-500 text-white",
                    isComplete && !isValid && "border-amber-500 bg-amber-500 text-white",
                    !isActive && !isComplete && "border-muted"
                  )}>
                    {isComplete ? (
                      isValid ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Form Content */}
      <main className="container max-w-3xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => { const Icon = STEPS[currentStep].icon; return <Icon className="h-5 w-5" /> })()}
              {STEPS[currentStep].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </main>
      
      {/* Navigation Footer */}
      <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              disabled={currentStep === 0}
              className="h-12 px-6"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </div>
            
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={goNext}
                className="h-12 px-6"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-12 px-6"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
      </footer>
      
      {/* NEMSIS Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>NEMSIS XML Export</DialogTitle>
            <DialogDescription>
              Generated NEMSIS 3.5 compliant XML for ePCR integration
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[400px] bg-muted p-4 rounded-lg">
            <pre className="text-xs font-mono whitespace-pre-wrap">{exportedXML}</pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Close
            </Button>
            <Button onClick={downloadXML}>
              <FileDown className="h-4 w-4 mr-2" />
              Download XML
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
