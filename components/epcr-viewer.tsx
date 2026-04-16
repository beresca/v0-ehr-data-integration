'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  MapPin,
  Activity,
  Stethoscope,
  Syringe,
  FileText,
  AlertTriangle,
  Heart,
  Droplet,
  Clipboard,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EPCRData {
  // ePatient
  patient: {
    age: number
    gender: 'M' | 'F'
    weight?: number // eExam.01
    biologicalSex?: string // ePatient.25
  }
  // eTimes
  times: {
    incidentDate: string // eTimes.03
    incidentTime?: string
    psapCallTime?: string // eTimes.01
    dispatchTime?: string // eTimes.02
    unitNotifiedTime?: string // eTimes.03
    enRouteTime?: string // eTimes.05
    arrivalTime?: string // eTimes.06
    patientContactTime?: string // eTimes.07
    departureTime?: string // eTimes.09
    hospitalArrivalTime?: string // eTimes.11
    patientTransferTime?: string // eTimes.12
    unitBackInServiceTime?: string // eTimes.13
  }
  // eResponse
  response: {
    emsAgency: string // eResponse.25
    incidentId: string
  }
  // eScene
  scene: {
    incidentLocation?: string // eScene.09
    incidentLocationType?: string
    gpsCoordinates?: { lat: number; lng: number }
  }
  // eSituation
  situation: {
    chiefComplaint: string // eSituation.04
    primarySymptom?: string // eSituation.09
    otherSymptoms?: string[] // eSituation.10
    providerPrimaryImpression?: string // eSituation.11
    providerSecondaryImpression?: string // eSituation.12
    causeOfInjury?: string
  }
  // eHistory
  history: {
    medicalHistory?: string[] // eHistory.08
    currentMedications?: string[] // eHistory.12
    allergies?: string[] // eHistory.06
    alcoholUse?: boolean // eHistory.17
    substanceUse?: boolean
    anticoagulationUse?: boolean
    antiplateletUse?: boolean
  }
  // eInjury
  injury?: {
    causeOfInjury?: string // eInjury.01
    traumaType?: string
    mechanism?: string
    vehicleImpactArea?: string
    useOfSeatbelt?: boolean
    airbagDeployment?: boolean
  }
  // eArrest
  arrest?: {
    cardiacArrest: boolean
    witnessed?: boolean // eArrest.04
    witnessedByEMS?: boolean
    bystanderCPR?: boolean // eArrest.20
    initialRhythm?: string // eVitals.03, eArrest.11-18
  }
  // eVitals - multiple sets
  vitals: {
    timestamp: string
    sbp?: number // eVitals.06
    dbp?: number // eVitals.07
    bpMethod?: string // eVitals.08
    hr?: number // eVitals.10
    respiratoryRate?: number // eVitals.14
    pulseOx?: number // eVitals.12
    etco2?: number // eVitals.16
    gcs?: number
    gcsEye?: number
    gcsVerbal?: number
    gcsMotor?: number
    cardiacRhythm?: string // eVitals.03
    shockIndex?: number // calculated
    label?: string // e.g., "Initial", "Pre-transfusion", "Post-transfusion", "Hospital handoff"
  }[]
  // eProcedures
  procedures: {
    procedure: string // eProcedures.03
    timestamp?: string
    successful?: boolean
    attempts?: number
  }[]
  // eMedications
  medications: {
    medication: string // eMedications.03
    dose?: string // eMedications.05
    doseUnit?: string // eMedications.06
    route?: string // eMedications.04
    timestamp?: string
    responseToMedication?: string
  }[]
  // Blood products (specific subset of medications)
  bloodProducts: {
    unitId: string
    productType: string // LTOWB, pRBC, Plasma, etc.
    scannedAt: string
    startTime?: string
    stopTime?: string
    route?: string
    ivGauge?: string
  }[]
  // eOutcome
  outcome?: {
    aliveAtArrival?: boolean // eOutcome.01
    disposition?: string // eOutcome.02
  }
}

// ─── Mock ePCR Data ───────────────────────────────────────────────────────────

const MOCK_EPCR: EPCRData = {
  patient: {
    age: 45,
    gender: 'M',
    weight: 82,
    biologicalSex: 'Male',
  },
  times: {
    incidentDate: '2026-04-08',
    incidentTime: '13:28',
    psapCallTime: '13:30',
    dispatchTime: '13:31',
    unitNotifiedTime: '13:32',
    enRouteTime: '13:33',
    arrivalTime: '13:42',
    patientContactTime: '13:44',
    departureTime: '14:08',
    hospitalArrivalTime: '14:32',
    patientTransferTime: '14:35',
    unitBackInServiceTime: '15:12',
  },
  response: {
    emsAgency: 'Miami-Dade Fire Rescue',
    incidentId: 'INC-2026-78432',
  },
  scene: {
    incidentLocation: '2400 SW 8th St, Miami, FL 33135',
    incidentLocationType: 'Street/Highway',
    gpsCoordinates: { lat: 25.7617, lng: -80.2629 },
  },
  situation: {
    chiefComplaint: 'MVC - Trauma',
    primarySymptom: 'Hemorrhage/Bleeding',
    otherSymptoms: ['Altered Mental Status', 'Chest Pain'],
    providerPrimaryImpression: 'Traumatic Injury - Multiple',
    providerSecondaryImpression: 'Hemorrhagic Shock',
    causeOfInjury: 'MVC - Driver',
  },
  history: {
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
    allergies: ['Penicillin'],
    alcoholUse: false,
    substanceUse: false,
    anticoagulationUse: false,
    antiplateletUse: false,
  },
  injury: {
    causeOfInjury: 'Motor Vehicle Collision',
    traumaType: 'Blunt',
    mechanism: 'MVC - Driver',
    vehicleImpactArea: 'Frontal',
    useOfSeatbelt: true,
    airbagDeployment: true,
  },
  arrest: {
    cardiacArrest: false,
  },
  vitals: [
    {
      timestamp: '13:45',
      label: 'Initial',
      sbp: 72,
      dbp: 40,
      bpMethod: 'Palpation',
      hr: 128,
      respiratoryRate: 24,
      pulseOx: 94,
      gcs: 11,
      gcsEye: 3,
      gcsVerbal: 3,
      gcsMotor: 5,
      cardiacRhythm: 'Sinus Tachycardia',
      shockIndex: 1.78,
    },
    {
      timestamp: '14:10',
      label: 'Pre-transfusion',
      sbp: 68,
      dbp: 38,
      bpMethod: 'Palpation',
      hr: 134,
      respiratoryRate: 26,
      pulseOx: 92,
      gcs: 10,
      gcsEye: 3,
      gcsVerbal: 2,
      gcsMotor: 5,
      cardiacRhythm: 'Sinus Tachycardia',
      shockIndex: 1.97,
    },
    {
      timestamp: '14:30',
      label: 'Post-transfusion (Unit 1)',
      sbp: 78,
      dbp: 44,
      bpMethod: 'Auscultation',
      hr: 118,
      respiratoryRate: 22,
      pulseOx: 96,
      gcs: 12,
      gcsEye: 3,
      gcsVerbal: 4,
      gcsMotor: 5,
      cardiacRhythm: 'Sinus Tachycardia',
      shockIndex: 1.51,
    },
    {
      timestamp: '14:32',
      label: 'Hospital Handoff',
      sbp: 84,
      dbp: 48,
      bpMethod: 'Auscultation',
      hr: 112,
      respiratoryRate: 20,
      pulseOx: 97,
      gcs: 13,
      gcsEye: 4,
      gcsVerbal: 4,
      gcsMotor: 5,
      cardiacRhythm: 'Sinus Tachycardia',
      shockIndex: 1.33,
    },
  ],
  procedures: [
    { procedure: 'Extremity Tourniquet - Left Leg', timestamp: '13:48', successful: true },
    { procedure: 'Pressure Dressing', timestamp: '13:50', successful: true },
    { procedure: 'Pelvic Binder', timestamp: '13:52', successful: true },
    { procedure: 'IV Access - 18g Left AC', timestamp: '13:55', successful: true },
    { procedure: 'IV Access - 16g Right EJ', timestamp: '14:00', successful: true, attempts: 2 },
    { procedure: 'Supplemental Oxygen - NRB 15L', timestamp: '13:46', successful: true },
  ],
  medications: [
    { medication: 'Tranexamic Acid (TXA)', dose: '1', doseUnit: 'g', route: 'IV', timestamp: '14:02' },
    { medication: 'Calcium Gluconate', dose: '1', doseUnit: 'g', route: 'IV', timestamp: '14:25' },
    { medication: 'Normal Saline', dose: '250', doseUnit: 'mL', route: 'IV', timestamp: '13:58' },
  ],
  bloodProducts: [
    { unitId: 'W26-089234', productType: 'LTOWB', scannedAt: '2026-04-08 14:08', startTime: '14:12', stopTime: '14:28', route: 'IV', ivGauge: '16g' },
    { unitId: 'W26-089235', productType: 'LTOWB', scannedAt: '2026-04-08 14:22', startTime: '14:30', route: 'IV', ivGauge: '16g' },
  ],
  outcome: {
    aliveAtArrival: true,
    disposition: 'Emergency Department',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface EPCRViewerProps {
  patientId?: string
  compact?: boolean
}

export function EPCRViewer({ patientId, compact = false }: EPCRViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    patient: true,
    times: false,
    scene: false,
    situation: true,
    history: false,
    injury: true,
    vitals: true,
    procedures: true,
    medications: true,
    bloodProducts: true,
  })

  const data = MOCK_EPCR // In production, fetch by patientId

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    children,
    badge,
  }: { 
    id: string
    title: string
    icon: React.ElementType
    children: React.ReactNode
    badge?: string
  }) => (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{title}</span>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
        {expandedSections[id] ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="px-3 pb-3 pt-1">
          {children}
        </div>
      )}
    </div>
  )

  const DataRow = ({ label, value, nemsisId, highlight }: { label: string; value: React.ReactNode; nemsisId?: string; highlight?: boolean }) => (
    <div className={cn("flex justify-between py-1 text-sm", highlight && "bg-amber-50 -mx-2 px-2 rounded")}>
      <span className="text-muted-foreground flex items-center gap-1">
        {label}
        {nemsisId && (
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono text-muted-foreground/60">{nemsisId}</Badge>
        )}
      </span>
      <span className={cn("font-medium text-right", highlight && "text-amber-700")}>{value}</span>
    </div>
  )

  return (
    <Card className={cn(!compact && "max-h-[80vh] overflow-auto")}>
      <CardHeader className="pb-2 sticky top-0 bg-card z-10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            ePCR Documentation
          </CardTitle>
          <Badge variant="outline" className="text-xs">NEMSIS 3.5</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {data.response.incidentId} &bull; {data.response.emsAgency}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {/* ePatient */}
        <Section id="patient" title="Patient Information" icon={User} badge="ePatient">
          <div className="grid grid-cols-2 gap-x-4">
            <DataRow label="Age" value={`${data.patient.age} years`} nemsisId="ePatient.15" />
            <DataRow label="Gender" value={data.patient.gender === 'M' ? 'Male' : 'Female'} nemsisId="ePatient.25" />
            {data.patient.weight && (
              <DataRow label="Weight" value={`${data.patient.weight} kg`} nemsisId="eExam.01" />
            )}
          </div>
        </Section>

        {/* eTimes */}
        <Section id="times" title="Response Times" icon={Clock} badge="eTimes">
          <div className="grid grid-cols-2 gap-x-4">
            <DataRow label="Incident Date" value={data.times.incidentDate} nemsisId="eTimes.03" />
            <DataRow label="Incident Time" value={data.times.incidentTime} />
            <DataRow label="PSAP Call" value={data.times.psapCallTime} nemsisId="eTimes.01" />
            <DataRow label="Dispatch" value={data.times.dispatchTime} nemsisId="eTimes.02" />
            <DataRow label="En Route" value={data.times.enRouteTime} nemsisId="eTimes.05" />
            <DataRow label="On Scene" value={data.times.arrivalTime} nemsisId="eTimes.06" />
            <DataRow label="Patient Contact" value={data.times.patientContactTime} nemsisId="eTimes.07" />
            <DataRow label="Departed Scene" value={data.times.departureTime} nemsisId="eTimes.09" />
            <DataRow label="At Hospital" value={data.times.hospitalArrivalTime} nemsisId="eTimes.11" />
            <DataRow label="Patient Transfer" value={data.times.patientTransferTime} nemsisId="eTimes.12" />
            {data.times.arrivalTime && data.times.departureTime && (
              <DataRow 
                label="Scene Time" 
                value={`${calculateDuration(data.times.arrivalTime, data.times.departureTime)} min`} 
                highlight 
              />
            )}
          </div>
        </Section>

        {/* eScene */}
        <Section id="scene" title="Scene Information" icon={MapPin} badge="eScene">
          <DataRow label="Location" value={data.scene.incidentLocation} nemsisId="eScene.09" />
          <DataRow label="Location Type" value={data.scene.incidentLocationType} />
          {data.scene.gpsCoordinates && (
            <DataRow label="GPS" value={`${data.scene.gpsCoordinates.lat}, ${data.scene.gpsCoordinates.lng}`} nemsisId="eScene.10" />
          )}
        </Section>

        {/* eSituation */}
        <Section id="situation" title="Situation" icon={Clipboard} badge="eSituation">
          <DataRow label="Chief Complaint" value={data.situation.chiefComplaint} nemsisId="eSituation.04" />
          <DataRow label="Primary Symptom" value={data.situation.primarySymptom} nemsisId="eSituation.09" />
          {data.situation.otherSymptoms && data.situation.otherSymptoms.length > 0 && (
            <DataRow label="Other Symptoms" value={data.situation.otherSymptoms.join(', ')} nemsisId="eSituation.10" />
          )}
          <DataRow label="Primary Impression" value={data.situation.providerPrimaryImpression} nemsisId="eSituation.11" />
          <DataRow label="Secondary Impression" value={data.situation.providerSecondaryImpression} nemsisId="eSituation.12" />
        </Section>

        {/* eHistory */}
        <Section id="history" title="Patient History" icon={FileText} badge="eHistory">
          <div className="space-y-2">
            {data.history.medicalHistory && data.history.medicalHistory.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  Medical History <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">eHistory.08</Badge>
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.history.medicalHistory.map(h => (
                    <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.history.currentMedications && data.history.currentMedications.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  Current Medications <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">eHistory.12</Badge>
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.history.currentMedications.map(m => (
                    <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.history.allergies && data.history.allergies.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  Allergies <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">eHistory.06</Badge>
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.history.allergies.map(a => (
                    <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-4 pt-2">
              <DataRow label="Alcohol Use" value={data.history.alcoholUse ? 'Yes' : 'No'} nemsisId="eHistory.17" />
              <DataRow label="Anticoagulation" value={data.history.anticoagulationUse ? 'Yes' : 'No'} nemsisId="eHistory.12" />
            </div>
          </div>
        </Section>

        {/* eInjury */}
        {data.injury && (
          <Section id="injury" title="Injury" icon={AlertTriangle} badge="eInjury">
            <DataRow label="Cause of Injury" value={data.injury.causeOfInjury} nemsisId="eInjury.01" />
            <DataRow label="Trauma Type" value={data.injury.traumaType} />
            <DataRow label="Mechanism" value={data.injury.mechanism} />
            {data.injury.vehicleImpactArea && (
              <DataRow label="Vehicle Impact Area" value={data.injury.vehicleImpactArea} nemsisId="eInjury.03" />
            )}
            <div className="grid grid-cols-2 gap-x-4">
              <DataRow label="Seatbelt" value={data.injury.useOfSeatbelt ? 'Yes' : 'No'} nemsisId="eInjury.07" />
              <DataRow label="Airbag Deployed" value={data.injury.airbagDeployment ? 'Yes' : 'No'} nemsisId="eInjury.08" />
            </div>
          </Section>
        )}

        {/* eArrest */}
        {data.arrest && (
          <Section id="arrest" title="Cardiac Arrest" icon={Heart} badge="eArrest">
            <DataRow label="Cardiac Arrest" value={data.arrest.cardiacArrest ? 'Yes' : 'No'} />
            {data.arrest.cardiacArrest && (
              <>
                <DataRow label="Witnessed" value={data.arrest.witnessed ? 'Yes' : 'No'} nemsisId="eArrest.04" />
                <DataRow label="Witnessed by EMS" value={data.arrest.witnessedByEMS ? 'Yes' : 'No'} nemsisId="eArrest.04" />
                <DataRow label="Bystander CPR" value={data.arrest.bystanderCPR ? 'Yes' : 'No'} nemsisId="eArrest.20" />
                <DataRow label="Initial Rhythm" value={data.arrest.initialRhythm} nemsisId="eArrest.11" />
              </>
            )}
          </Section>
        )}

        {/* eVitals */}
        <Section id="vitals" title="Vital Signs" icon={Activity} badge="eVitals">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Time</th>
                  <th className="text-center py-2 px-2 text-muted-foreground font-medium">SBP</th>
                  <th className="text-center py-2 px-2 text-muted-foreground font-medium">HR</th>
                  <th className="text-center py-2 px-2 text-muted-foreground font-medium">RR</th>
                  <th className="text-center py-2 px-2 text-muted-foreground font-medium">SpO2</th>
                  <th className="text-center py-2 px-2 text-muted-foreground font-medium">GCS</th>
                  <th className="text-center py-2 px-2 text-muted-foreground font-medium">SI</th>
                </tr>
              </thead>
              <tbody>
                {data.vitals.map((v, i) => (
                  <tr key={i} className={cn("border-b last:border-b-0", v.label?.includes('Pre-transfusion') && "bg-amber-50")}>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{v.timestamp}</div>
                      {v.label && <div className="text-xs text-muted-foreground">{v.label}</div>}
                    </td>
                    <td className={cn("text-center py-2 px-2", v.sbp && v.sbp < 90 && "text-destructive font-medium")}>
                      {v.sbp}/{v.dbp}
                    </td>
                    <td className={cn("text-center py-2 px-2", v.hr && v.hr > 100 && "text-amber-600 font-medium")}>
                      {v.hr}
                    </td>
                    <td className="text-center py-2 px-2">{v.respiratoryRate}</td>
                    <td className={cn("text-center py-2 px-2", v.pulseOx && v.pulseOx < 94 && "text-amber-600 font-medium")}>
                      {v.pulseOx}%
                    </td>
                    <td className={cn("text-center py-2 px-2", v.gcs && v.gcs < 14 && "text-amber-600 font-medium")}>
                      {v.gcs} <span className="text-xs text-muted-foreground">({v.gcsEye}/{v.gcsVerbal}/{v.gcsMotor})</span>
                    </td>
                    <td className={cn("text-center py-2 px-2 font-mono", v.shockIndex && v.shockIndex > 1.0 && "text-destructive font-bold")}>
                      {v.shockIndex?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-muted-foreground mt-2">
              NEMSIS: eVitals.06 (SBP), eVitals.07 (DBP), eVitals.10 (HR), eVitals.14 (RR), eVitals.12 (SpO2)
            </p>
          </div>
        </Section>

        {/* eProcedures */}
        <Section id="procedures" title="Procedures" icon={Stethoscope} badge="eProcedures">
          <div className="space-y-2">
            {data.procedures.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <Badge variant={p.successful ? 'default' : 'destructive'} className="text-xs">
                    {p.successful ? 'Success' : 'Failed'}
                  </Badge>
                  <span className="text-sm">{p.procedure}</span>
                  {p.attempts && p.attempts > 1 && (
                    <span className="text-xs text-muted-foreground">({p.attempts} attempts)</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono">{p.timestamp}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">NEMSIS: eProcedures.03</p>
        </Section>

        {/* eMedications (non-blood products) */}
        <Section id="medications" title="Medications" icon={Syringe} badge="eMedications">
          <div className="space-y-2">
            {data.medications.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b last:border-b-0">
                <div>
                  <span className="text-sm font-medium">{m.medication}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {m.dose} {m.doseUnit} {m.route}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{m.timestamp}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            NEMSIS: eMedications.03 (med), eMedications.04 (route), eMedications.05 (dose), eMedications.06 (unit)
          </p>
        </Section>

        {/* Blood Products */}
        <Section id="bloodProducts" title="Blood Products" icon={Droplet} badge="eMedications.03">
          <div className="space-y-3">
            {data.bloodProducts.map((bp, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      'text-white',
                      bp.productType === 'LTOWB' ? 'bg-red-500' :
                      bp.productType === 'pRBC' ? 'bg-red-700' : 'bg-amber-500'
                    )}>
                      {bp.productType}
                    </Badge>
                    <span className="font-mono font-medium">{bp.unitId}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                  <DataRow label="Scanned" value={bp.scannedAt.split(' ')[1]} />
                  <DataRow label="Route" value={bp.route || 'IV'} nemsisId="eMedications.04" />
                  {bp.startTime && <DataRow label="Start Time" value={bp.startTime} highlight />}
                  {bp.stopTime && <DataRow label="Stop Time" value={bp.stopTime} />}
                  {bp.ivGauge && <DataRow label="IV Gauge" value={bp.ivGauge} />}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* eOutcome */}
        {data.outcome && (
          <Section id="outcome" title="Outcome" icon={Activity} badge="eOutcome">
            <DataRow label="Alive at Arrival" value={data.outcome.aliveAtArrival ? 'Yes' : 'No'} nemsisId="eOutcome.01" />
            <DataRow label="Disposition" value={data.outcome.disposition} nemsisId="eOutcome.02" />
          </Section>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateDuration(start: string, end: string): number {
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  return (endH * 60 + endM) - (startH * 60 + startM)
}
