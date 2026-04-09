// Mock ImageTrend Elite EMS data for demonstration
import type { ImageTrendData } from '@/lib/types/registry'

export const MOCK_EMS_RUNS: ImageTrendData[] = [
  {
    run_id: 'IT-2026-04-09-001',
    incident_date: '2026-04-09',
    incident_time: '14:32:00',
    unit_id: 'M-42',
    agency_name: 'Metro Fire Department EMS',
    patient: {
      age: 34,
      gender: 'M',
      blood_type: 'O+',
    },
    vitals: [
      { timestamp: '2026-04-09T14:35:00', sbp: 82, hr: 128, rr: 24, etco2: 22, gcs: 13 },
      { timestamp: '2026-04-09T14:45:00', sbp: 78, hr: 134, rr: 26, etco2: 20, gcs: 12 },
      { timestamp: '2026-04-09T14:55:00', sbp: 88, hr: 118, rr: 22, etco2: 26, gcs: 14 },
    ],
    assessments: {
      altered_mental_status: true,
      pale_skin: true,
      capillary_refill_delayed: true,
    },
    destination: {
      facility_name: 'Regional Trauma Center',
      facility_code: 'RTC-001',
    },
    transfusion: {
      products_given: [
        { product_type: 'PRBC', unit_id: 'RBC-2026-0412', volume_ml: 350, start_time: '2026-04-09T14:40:00' },
        { product_type: 'PRBC', unit_id: 'RBC-2026-0413', volume_ml: 350, start_time: '2026-04-09T14:48:00' },
      ],
      indication: 'Traumatic hemorrhage - MVA',
      complications: '',
    },
  },
  {
    run_id: 'IT-2026-04-09-002',
    incident_date: '2026-04-09',
    incident_time: '08:15:00',
    unit_id: 'A-17',
    agency_name: 'County EMS',
    patient: {
      age: 67,
      gender: 'F',
      blood_type: 'A-',
    },
    vitals: [
      { timestamp: '2026-04-09T08:20:00', sbp: 94, hr: 112, rr: 20, etco2: 28, gcs: 15 },
      { timestamp: '2026-04-09T08:35:00', sbp: 86, hr: 124, rr: 22, etco2: 24, gcs: 14 },
    ],
    assessments: {
      altered_mental_status: false,
      pale_skin: true,
      capillary_refill_delayed: false,
    },
    destination: {
      facility_name: 'City General Hospital',
      facility_code: 'CGH-002',
    },
    transfusion: {
      products_given: [
        { product_type: 'PRBC', unit_id: 'RBC-2026-0408', volume_ml: 350, start_time: '2026-04-09T08:28:00' },
      ],
      indication: 'GI bleed',
      complications: '',
    },
  },
  {
    run_id: 'IT-2026-04-08-005',
    incident_date: '2026-04-08',
    incident_time: '22:45:00',
    unit_id: 'M-42',
    agency_name: 'Metro Fire Department EMS',
    patient: {
      age: 5,
      gender: 'M',
      blood_type: 'B+',
    },
    vitals: [
      { timestamp: '2026-04-08T22:50:00', sbp: 72, hr: 165, rr: 32, etco2: 24, gcs: 12 },
      { timestamp: '2026-04-08T23:00:00', sbp: 68, hr: 172, rr: 34, etco2: 22, gcs: 11 },
    ],
    assessments: {
      altered_mental_status: true,
      pale_skin: true,
      capillary_refill_delayed: true,
    },
    destination: {
      facility_name: "Children's Hospital",
      facility_code: 'CH-003',
    },
    transfusion: {
      products_given: [
        { product_type: 'PRBC', unit_id: 'RBC-2026-0398', volume_ml: 150, start_time: '2026-04-08T22:55:00' },
      ],
      indication: 'Pediatric trauma',
      complications: '',
    },
  },
  {
    run_id: 'IT-2026-04-08-003',
    incident_date: '2026-04-08',
    incident_time: '16:20:00',
    unit_id: 'A-23',
    agency_name: 'Rural EMS District',
    patient: {
      age: 28,
      gender: 'F',
      blood_type: 'O-',
    },
    vitals: [
      { timestamp: '2026-04-08T16:25:00', sbp: 76, hr: 138, rr: 28, etco2: 18, gcs: 13 },
      { timestamp: '2026-04-08T16:40:00', sbp: 82, hr: 126, rr: 24, etco2: 22, gcs: 14 },
    ],
    assessments: {
      altered_mental_status: true,
      pale_skin: true,
      capillary_refill_delayed: true,
    },
    destination: {
      facility_name: 'Regional Medical Center',
      facility_code: 'RMC-004',
    },
    transfusion: {
      products_given: [
        { product_type: 'PRBC', unit_id: 'RBC-2026-0395', volume_ml: 350, start_time: '2026-04-08T16:30:00' },
        { product_type: 'PRBC', unit_id: 'RBC-2026-0396', volume_ml: 350, start_time: '2026-04-08T16:38:00' },
      ],
      indication: 'Obstetric hemorrhage',
      complications: '',
    },
  },
]

// Simulate API search with delay
export async function searchEmsRuns(query: string): Promise<ImageTrendData[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (!query) return MOCK_EMS_RUNS
  
  const lowerQuery = query.toLowerCase()
  return MOCK_EMS_RUNS.filter(run => 
    run.run_id.toLowerCase().includes(lowerQuery) ||
    run.agency_name.toLowerCase().includes(lowerQuery) ||
    run.unit_id.toLowerCase().includes(lowerQuery) ||
    run.destination?.facility_name.toLowerCase().includes(lowerQuery)
  )
}

// Get a single EMS run by ID
export async function getEmsRunById(runId: string): Promise<ImageTrendData | null> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MOCK_EMS_RUNS.find(run => run.run_id === runId) || null
}
