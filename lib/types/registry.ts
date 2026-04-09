// Type definitions for the Prehospital Blood Transfusion Registry

export type FormType = 'adult_pi' | 'pediatric_pi' | 'emergency_release' | 'blood_bank'

export type CaseStatus = 'draft' | 'pending_review' | 'completed' | 'submitted_to_rac'

export type DataSource = 'EMS' | 'MANUAL' | 'EHR'

export type IndicationCategory = 'INJURY' | 'GI_BLEED' | 'OBSTETRIC_GYNECOLOGIC' | 'OTHER'

export type ComplicationType = 'NONE' | 'TRANSFUSION_REACTION' | 'OTHER'

export type TriStateAnswer = 'YES' | 'NO' | 'NOT_INDICATED'

export type NoTransfusionReason = 'CRITERIA_NOT_MET' | 'PRODUCT_UNAVAILABLE' | 'OTHER'

export type VitalType = 'sbp' | 'hr' | 'shock_index' | 'hr_pediatric_under1' | 'hr_pediatric_2to10' | 'sbp_pediatric'

export type PhysiologicSignType = 'rr' | 'etco2' | 'altered_mental_status' | 'pale_mucosa' | 'capillary_refill' | 'age_specific_tachypnea'

export type MetStatus = 'MET' | 'NOT_MET'

export type PresentStatus = 'PRESENT' | 'NOT_PRESENT'

export interface TransfusionCase {
  id: string
  case_number: string
  form_type: FormType
  status: CaseStatus
  
  // Patient demographics
  patient_uid?: string
  patient_mrn?: string
  age?: number
  gender?: string
  blood_type?: string
  
  // Event details
  event_date?: string
  form_completion_date?: string
  agency?: string
  transporting_unit?: string
  destination_facility?: string
  patient_transported?: boolean
  
  // Indication
  indication_category?: IndicationCategory
  indication_other_details?: string
  
  // Complications
  complication_type?: ComplicationType
  complication_details?: string
  
  // Disposition
  patient_disposition?: string
  blood_bank_notified?: TriStateAnswer
  
  // Prehospital blood (for emergency release form)
  received_prehospital_blood?: boolean
  no_transfusion_reason?: NoTransfusionReason
  no_transfusion_reason_details?: string
  
  // Blood bank specific (Rh- patients)
  rhogam_treatment?: TriStateAnswer
  ob_referral?: TriStateAnswer
  followup_appointment?: TriStateAnswer
  antibody_testing?: TriStateAnswer
  transfusion_notification?: TriStateAnswer
  education_materials?: TriStateAnswer
  rh_negative_explanation?: string
  
  // Metadata
  user_id: string
  ems_run_id?: string
  created_at?: string
  updated_at?: string
}

export interface VitalSign {
  id: string
  case_id: string
  vital_type: VitalType
  threshold_description: string
  patient_value?: string
  met_status?: MetStatus
  created_at?: string
}

export interface PhysiologicSign {
  id: string
  case_id: string
  sign_type: PhysiologicSignType
  description: string
  patient_value?: string
  present_status?: PresentStatus
  created_at?: string
}

export interface FieldProvenance {
  id: string
  case_id: string
  field_name: string
  field_value?: string
  source: DataSource
  source_system?: string
  source_record_id?: string
  recorded_at?: string
  created_by?: string
  created_at?: string
}

export interface EmsImport {
  id: string
  case_id?: string
  ems_run_id: string
  source_system: string
  raw_data?: ImageTrendData
  import_status: 'pending' | 'matched' | 'unmatched' | 'error'
  matched_at?: string
  user_id: string
  created_at?: string
}

// ImageTrend Elite mock data structure
export interface ImageTrendData {
  run_id: string
  incident_date: string
  incident_time: string
  unit_id: string
  agency_name: string
  
  // Patient demographics
  patient: {
    age?: number
    gender?: string
    blood_type?: string
  }
  
  // Vitals (first and last sets)
  vitals: {
    timestamp: string
    sbp?: number
    hr?: number
    rr?: number
    etco2?: number
    gcs?: number
  }[]
  
  // Assessments
  assessments: {
    altered_mental_status?: boolean
    pale_skin?: boolean
    capillary_refill_delayed?: boolean
  }
  
  // Destination
  destination?: {
    facility_name: string
    facility_code?: string
  }
  
  // Transfusion
  transfusion?: {
    products_given: {
      product_type: string
      unit_id: string
      volume_ml: number
      start_time: string
    }[]
    indication?: string
    complications?: string
  }
}

// Form field with provenance
export interface ProvenanceField<T = string> {
  value: T | undefined
  source?: DataSource
  source_system?: string
  recorded_at?: string
  conflict?: {
    ems_value?: T
    ehr_value?: T
    manual_value?: T
  }
}

// Vital sign threshold definitions
export const ADULT_VITAL_THRESHOLDS = {
  sbp: { threshold: 90, operator: '<', description: 'SBP < 90 mmHg' },
  hr: { threshold: 120, operator: '>', description: 'HR > 120 bpm' },
  shock_index: { threshold: 1, operator: '>', description: 'Shock Index > 1 (HR/SBP)' },
} as const

export const PEDIATRIC_VITAL_THRESHOLDS = {
  hr_under1: { threshold: 180, operator: '>', description: 'HR > 180 bpm (< 1 year)' },
  hr_2to10: { threshold: 140, operator: '>', description: 'HR > 140 bpm (2-10 years)' },
  sbp: { threshold: 70, operator: '<', description: 'SBP < 70 + (2 × age) mmHg' },
} as const

export const PHYSIOLOGIC_SIGNS = {
  rr: { description: 'RR < 10 or > 29' },
  etco2: { description: 'ETCO2 < 25 mmHg' },
  altered_mental_status: { description: 'Altered mental status' },
  pale_mucosa: { description: 'Pale skin and/or mucous membranes' },
  capillary_refill: { description: 'Capillary refill > 2 seconds' },
  age_specific_tachypnea: { description: 'Age-specific tachypnea (pediatric)' },
} as const

// Case with related data
export interface TransfusionCaseWithRelations extends TransfusionCase {
  vital_signs?: VitalSign[]
  physiologic_signs?: PhysiologicSign[]
  field_provenance?: FieldProvenance[]
  ems_import?: EmsImport
}

// Form state for editing
export interface FormState {
  caseData: Partial<TransfusionCase>
  vitalSigns: Partial<VitalSign>[]
  physiologicSigns: Partial<PhysiologicSign>[]
  provenance: Map<string, FieldProvenance>
  isDirty: boolean
  errors: Record<string, string>
}
