// NEMSIS 3.5 Field Mapping for Prehospital Blood Transfusion Documentation
// Maps our registry fields to NEMSIS data elements for ePCR export

export interface NEMSISField {
  element_id: string
  name: string
  data_type: 'text' | 'number' | 'date' | 'time' | 'datetime' | 'list' | 'boolean'
  required: boolean
  list_values?: Record<string, string>
}

// NEMSIS 3.5 Element Mappings
export const NEMSIS_ELEMENTS = {
  // Patient Information
  ePatient_13: { element_id: 'ePatient.13', name: 'Gender', data_type: 'list', required: true, list_values: { '9906001': 'Female', '9906003': 'Male', '9906005': 'Unknown' } },
  ePatient_15: { element_id: 'ePatient.15', name: 'Age', data_type: 'number', required: true },
  ePatient_16: { element_id: 'ePatient.16', name: 'Age Units', data_type: 'list', required: true, list_values: { '2516001': 'Days', '2516003': 'Hours', '2516005': 'Minutes', '2516007': 'Months', '2516009': 'Years' } },
  
  // Vitals
  eVitals_06: { element_id: 'eVitals.06', name: 'SBP', data_type: 'number', required: false },
  eVitals_10: { element_id: 'eVitals.10', name: 'Heart Rate', data_type: 'number', required: false },
  eVitals_12: { element_id: 'eVitals.12', name: 'Pulse Oximetry', data_type: 'number', required: false },
  eVitals_14: { element_id: 'eVitals.14', name: 'Respiratory Rate', data_type: 'number', required: false },
  eVitals_16: { element_id: 'eVitals.16', name: 'ETCO2', data_type: 'number', required: false },
  eVitals_19: { element_id: 'eVitals.19', name: 'GCS Total', data_type: 'number', required: false },
  
  // Exam
  eExam_03: { element_id: 'eExam.03', name: 'Mental Status Assessment', data_type: 'list', required: false, list_values: { '3503001': 'Acute Altered Level of Consciousness', '3503003': 'Acute Psychiatric Symptoms', '3503005': 'Acute Toxic-Metabolic State', '3503007': 'Baseline', '3503009': 'Combative', '3503011': 'Confused', '3503013': 'Hallucinations', '3503015': 'Pain', '3503017': 'Unresponsive' } },
  eExam_04: { element_id: 'eExam.04', name: 'Neurological Assessment', data_type: 'list', required: false },
  eExam_05: { element_id: 'eExam.05', name: 'Skin Assessment', data_type: 'list', required: false, list_values: { '3505003': 'Cold', '3505005': 'Cool', '3505009': 'Cyanotic', '3505013': 'Diaphoretic', '3505021': 'Jaundice', '3505025': 'Mottled', '3505027': 'Normal', '3505029': 'Pale', '3505031': 'Petechial/Purpura', '3505035': 'Warm' } },
  
  // Medications/Procedures - Blood Products
  eMedications_03: { element_id: 'eMedications.03', name: 'Medication Given', data_type: 'list', required: true },
  eMedications_DosageGroup: { element_id: 'eMedications.DosageGroup', name: 'Dosage', data_type: 'text', required: false },
  eMedications_05: { element_id: 'eMedications.05', name: 'Medication Dosage', data_type: 'number', required: false },
  eMedications_06: { element_id: 'eMedications.06', name: 'Medication Dosage Units', data_type: 'list', required: false },
  eMedications_07: { element_id: 'eMedications.07', name: 'Response to Medication', data_type: 'list', required: false, list_values: { '9916001': 'Improved', '9916003': 'Unchanged', '9916005': 'Worse' } },
  eMedications_10: { element_id: 'eMedications.10', name: 'Medication Complication', data_type: 'list', required: false, list_values: { '9918001': 'Altered Mental Status', '9918003': 'Apnea', '9918005': 'Bleeding', '9918007': 'Bradycardia', '9918009': 'Diarrhea', '9918011': 'Extravasation', '9918013': 'Hypertension', '9918015': 'Hyperthermia', '9918017': 'Hypotension', '9918019': 'Hypothermia', '9918021': 'Hypoxia', '9918023': 'Injury', '9918025': 'Itching/Urticaria', '9918027': 'Nausea', '9918029': 'None', '9918031': 'Other', '9918033': 'Respiratory Distress', '9918035': 'Tachycardia', '9918037': 'Vomiting' } },
  
  // Blood Product Specific (Custom/Extended NEMSIS)
  eBlood_01: { element_id: 'eBlood.01', name: 'Blood Product Type', data_type: 'list', required: true, list_values: { 'PRBC': 'Packed Red Blood Cells', 'WB': 'Whole Blood', 'LWBB': 'Low-Titer Whole Blood', 'PLT': 'Platelets', 'FFP': 'Fresh Frozen Plasma', 'CRYO': 'Cryoprecipitate' } },
  eBlood_02: { element_id: 'eBlood.02', name: 'Blood Product Unit ID', data_type: 'text', required: true },
  eBlood_03: { element_id: 'eBlood.03', name: 'Blood Product ABO Type', data_type: 'list', required: false, list_values: { 'A': 'A', 'B': 'B', 'AB': 'AB', 'O': 'O' } },
  eBlood_04: { element_id: 'eBlood.04', name: 'Blood Product Rh Type', data_type: 'list', required: false, list_values: { 'POS': 'Rh Positive', 'NEG': 'Rh Negative' } },
  eBlood_05: { element_id: 'eBlood.05', name: 'Blood Product Volume (mL)', data_type: 'number', required: false },
  eBlood_06: { element_id: 'eBlood.06', name: 'Transfusion Start Time', data_type: 'datetime', required: true },
  eBlood_07: { element_id: 'eBlood.07', name: 'Transfusion End Time', data_type: 'datetime', required: false },
  
  // Disposition
  eDisposition_12: { element_id: 'eDisposition.12', name: 'Incident/Patient Disposition', data_type: 'list', required: true },
  eDisposition_21: { element_id: 'eDisposition.21', name: 'Destination', data_type: 'text', required: false },
  
  // Scene
  eScene_09: { element_id: 'eScene.09', name: 'Incident Location Type', data_type: 'list', required: false },
  
  // Situation
  eSituation_07: { element_id: 'eSituation.07', name: 'Primary Symptom', data_type: 'list', required: false },
  eSituation_09: { element_id: 'eSituation.09', name: 'Primary Impression', data_type: 'list', required: false },
  eSituation_11: { element_id: 'eSituation.11', name: 'Provider Primary Impression', data_type: 'list', required: false },
} as const

// Map our form fields to NEMSIS elements
export const FORM_TO_NEMSIS_MAP: Record<string, string> = {
  'age': 'ePatient.15',
  'gender': 'ePatient.13',
  'sbp': 'eVitals.06',
  'hr': 'eVitals.10',
  'rr': 'eVitals.14',
  'etco2': 'eVitals.16',
  'gcs': 'eVitals.19',
  'altered_mental_status': 'eExam.03',
  'skin_assessment': 'eExam.05',
  'blood_product_type': 'eBlood.01',
  'blood_product_unit_id': 'eBlood.02',
  'blood_product_volume': 'eBlood.05',
  'transfusion_start_time': 'eBlood.06',
  'destination_facility': 'eDisposition.21',
  'patient_disposition': 'eDisposition.12',
}

// Blood product types for dropdown
export const BLOOD_PRODUCT_TYPES = [
  { value: 'LWBB', label: 'Low-Titer Whole Blood (LTWB)', nemsis: 'LWBB' },
  { value: 'WB', label: 'Whole Blood', nemsis: 'WB' },
  { value: 'PRBC', label: 'Packed Red Blood Cells (pRBC)', nemsis: 'PRBC' },
  { value: 'PLT', label: 'Platelets', nemsis: 'PLT' },
  { value: 'FFP', label: 'Fresh Frozen Plasma (FFP)', nemsis: 'FFP' },
  { value: 'CRYO', label: 'Cryoprecipitate', nemsis: 'CRYO' },
] as const

// Transfusion indication categories mapped to NEMSIS
export const INDICATION_TO_NEMSIS: Record<string, string> = {
  'INJURY': 'Traumatic Hemorrhage',
  'GI_BLEED': 'Gastrointestinal Hemorrhage',
  'OBSTETRIC_GYNECOLOGIC': 'Obstetric/Gynecologic Hemorrhage',
  'OTHER': 'Other Hemorrhage',
}

// Generate NEMSIS XML for a transfusion record
export function generateNEMSISXML(data: TransfusionNEMSISData): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<EMSDataSet xmlns="http://www.nemsis.org" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.nemsis.org NEMSIS_v3.5.0_emsDataSet.xsd">
  <Header>
    <DemographicGroup>
      <dAgency.01>${escapeXML(data.agency_id || '')}</dAgency.01>
      <dAgency.02>${escapeXML(data.agency_name || '')}</dAgency.02>
    </DemographicGroup>
  </Header>
  <PatientCareReport>
    <eRecord>
      <eRecord.01>${escapeXML(data.pcr_id || generatePCRId())}</eRecord.01>
    </eRecord>
    <eResponse>
      <eResponse.03>${escapeXML(data.unit_id || '')}</eResponse.03>
    </eResponse>
    <ePatient>
      <ePatient.13>${mapGenderToNEMSIS(data.gender)}</ePatient.13>
      <ePatient.15>${data.age || ''}</ePatient.15>
      <ePatient.16>2516009</ePatient.16><!-- Years -->
    </ePatient>
    <eVitals>
      <eVitals.VitalGroup>
        <eVitals.01>${formatNEMSISDateTime(data.vitals_datetime)}</eVitals.01>
        ${data.sbp ? `<eVitals.06>${data.sbp}</eVitals.06>` : ''}
        ${data.hr ? `<eVitals.10>${data.hr}</eVitals.10>` : ''}
        ${data.rr ? `<eVitals.14>${data.rr}</eVitals.14>` : ''}
        ${data.etco2 ? `<eVitals.16>${data.etco2}</eVitals.16>` : ''}
        ${data.gcs ? `<eVitals.19>${data.gcs}</eVitals.19>` : ''}
      </eVitals.VitalGroup>
    </eVitals>
    <eMedications>
      ${data.blood_products?.map(product => `
      <eMedications.MedicationGroup>
        <eMedications.01>${formatNEMSISDateTime(product.start_time)}</eMedications.01>
        <eMedications.03>Blood Products - ${product.product_type}</eMedications.03>
        <eMedications.DosageGroup>
          <eMedications.05>${product.volume_ml || ''}</eMedications.05>
          <eMedications.06>3706017</eMedications.06><!-- mL -->
        </eMedications.DosageGroup>
        ${product.response ? `<eMedications.07>${mapResponseToNEMSIS(product.response)}</eMedications.07>` : ''}
        ${product.complication ? `<eMedications.10>${mapComplicationToNEMSIS(product.complication)}</eMedications.10>` : ''}
      </eMedications.MedicationGroup>`).join('') || ''}
    </eMedications>
    <eExam>
      ${data.altered_mental_status ? `<eExam.03>3503001</eExam.03><!-- Acute Altered Level of Consciousness -->` : ''}
      ${data.pale_skin ? `<eExam.05>3505029</eExam.05><!-- Pale -->` : ''}
    </eExam>
    <eDisposition>
      <eDisposition.21>${escapeXML(data.destination_facility || '')}</eDisposition.21>
      <eDisposition.23>${escapeXML(data.patient_disposition || '')}</eDisposition.23>
    </eDisposition>
    <eCustomResults>
      <eCustomResults.ResultsGroup>
        <eCustomResults.01>Blood Product Unit ID</eCustomResults.01>
        <eCustomResults.02>${data.blood_products?.map(p => p.unit_id).join(', ') || ''}</eCustomResults.02>
      </eCustomResults.ResultsGroup>
      <eCustomResults.ResultsGroup>
        <eCustomResults.01>Transfusion Indication</eCustomResults.01>
        <eCustomResults.02>${escapeXML(data.indication || '')}</eCustomResults.02>
      </eCustomResults.ResultsGroup>
      ${data.blood_bank_notified ? `
      <eCustomResults.ResultsGroup>
        <eCustomResults.01>Blood Bank Notified</eCustomResults.01>
        <eCustomResults.02>${data.blood_bank_notified}</eCustomResults.02>
      </eCustomResults.ResultsGroup>` : ''}
    </eCustomResults>
  </PatientCareReport>
</EMSDataSet>`
  
  return xml
}

// Type for NEMSIS export data
export interface TransfusionNEMSISData {
  pcr_id?: string
  agency_id?: string
  agency_name?: string
  unit_id?: string
  
  // Patient
  age?: number
  gender?: string
  
  // Vitals
  vitals_datetime?: string
  sbp?: number
  hr?: number
  rr?: number
  etco2?: number
  gcs?: number
  
  // Assessment
  altered_mental_status?: boolean
  pale_skin?: boolean
  capillary_refill_delayed?: boolean
  
  // Blood Products
  blood_products?: {
    product_type: string
    unit_id: string
    volume_ml?: number
    start_time?: string
    end_time?: string
    response?: string
    complication?: string
  }[]
  
  // Disposition
  destination_facility?: string
  patient_disposition?: string
  indication?: string
  blood_bank_notified?: string
}

// Helper functions
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generatePCRId(): string {
  return `PCR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

function formatNEMSISDateTime(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString()
  return new Date(dateStr).toISOString()
}

function mapGenderToNEMSIS(gender?: string): string {
  switch (gender?.toLowerCase()) {
    case 'male': return '9906003'
    case 'female': return '9906001'
    default: return '9906005' // Unknown
  }
}

function mapResponseToNEMSIS(response?: string): string {
  switch (response?.toLowerCase()) {
    case 'improved': return '9916001'
    case 'unchanged': return '9916003'
    case 'worse': return '9916005'
    default: return '9916003'
  }
}

function mapComplicationToNEMSIS(complication?: string): string {
  switch (complication?.toUpperCase()) {
    case 'NONE': return '9918029'
    case 'TRANSFUSION_REACTION': return '9918025' // Itching/Urticaria as closest
    case 'OTHER': return '9918031'
    default: return '9918029'
  }
}

// Parse NEMSIS XML import (for receiving data from ePCR)
export function parseNEMSISXML(xml: string): Partial<TransfusionNEMSISData> {
  // Basic XML parsing - in production would use proper XML parser
  const data: Partial<TransfusionNEMSISData> = {}
  
  // Extract common fields using regex (simplified)
  const extractValue = (element: string): string | undefined => {
    const match = xml.match(new RegExp(`<${element}>([^<]*)</${element}>`))
    return match?.[1]
  }
  
  data.age = parseInt(extractValue('ePatient.15') || '') || undefined
  data.sbp = parseInt(extractValue('eVitals.06') || '') || undefined
  data.hr = parseInt(extractValue('eVitals.10') || '') || undefined
  data.rr = parseInt(extractValue('eVitals.14') || '') || undefined
  data.etco2 = parseInt(extractValue('eVitals.16') || '') || undefined
  data.gcs = parseInt(extractValue('eVitals.19') || '') || undefined
  data.destination_facility = extractValue('eDisposition.21')
  data.unit_id = extractValue('eResponse.03')
  
  // Map gender code back
  const genderCode = extractValue('ePatient.13')
  if (genderCode === '9906001') data.gender = 'Female'
  else if (genderCode === '9906003') data.gender = 'Male'
  
  return data
}
