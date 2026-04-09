import { DashboardContent } from '@/components/dashboard/dashboard-content'

// Demo mode: skip authentication, use mock data
const mockCases = [
  {
    id: '1',
    case_number: 'TRX-2026-0001',
    form_type: 'adult_pi',
    status: 'completed',
    patient_uid: 'PT-001',
    patient_mrn: 'MRN-12345',
    age: 45,
    gender: 'Male',
    blood_type: 'O-',
    event_date: '2026-04-01T14:30:00Z',
    agency: 'Metro Fire EMS',
    destination_facility: 'Regional Medical Center',
    indication_category: 'INJURY',
    created_at: '2026-04-01T15:00:00Z',
    updated_at: '2026-04-01T16:30:00Z',
  },
  {
    id: '2',
    case_number: 'TRX-2026-0002',
    form_type: 'pediatric_pi',
    status: 'pending_review',
    patient_uid: 'PT-002',
    patient_mrn: 'MRN-67890',
    age: 7,
    gender: 'Female',
    blood_type: 'A+',
    event_date: '2026-04-05T09:15:00Z',
    agency: 'County EMS',
    destination_facility: 'Children\'s Hospital',
    indication_category: 'INJURY',
    created_at: '2026-04-05T10:00:00Z',
    updated_at: '2026-04-05T11:00:00Z',
  },
  {
    id: '3',
    case_number: 'TRX-2026-0003',
    form_type: 'emergency_release',
    status: 'draft',
    patient_uid: 'PT-003',
    patient_mrn: 'MRN-11111',
    age: 62,
    gender: 'Female',
    blood_type: 'B-',
    event_date: '2026-04-08T22:45:00Z',
    agency: 'Air Medical Transport',
    destination_facility: 'Trauma Center',
    indication_category: 'GI_BLEED',
    created_at: '2026-04-08T23:00:00Z',
    updated_at: '2026-04-08T23:30:00Z',
  },
  {
    id: '4',
    case_number: 'TRX-2026-0004',
    form_type: 'blood_bank',
    status: 'completed',
    patient_uid: 'PT-004',
    patient_mrn: 'MRN-22222',
    age: 28,
    gender: 'Female',
    blood_type: 'O-',
    event_date: '2026-04-02T11:00:00Z',
    agency: 'Metro Fire EMS',
    destination_facility: 'University Hospital',
    indication_category: 'OBSTETRIC_GYNECOLOGIC',
    created_at: '2026-04-02T12:00:00Z',
    updated_at: '2026-04-03T09:00:00Z',
  },
]

export default async function DashboardPage() {
  // Demo mode - no auth required
  const cases = mockCases

  // Get statistics
  const stats = {
    total: cases.length,
    drafts: cases.filter(c => c.status === 'draft').length,
    pendingReview: cases.filter(c => c.status === 'pending_review').length,
    completed: cases.filter(c => c.status === 'completed' || c.status === 'submitted_to_rac').length,
  }

  return (
    <DashboardContent 
      cases={cases} 
      stats={stats}
      userEmail="demo@example.com"
    />
  )
}
