-- Prehospital Blood Transfusion Registry Schema
-- This creates all tables needed for the transfusion PI forms

-- 1. transfusion_cases: Main registry table
CREATE TABLE IF NOT EXISTS transfusion_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('adult_pi', 'pediatric_pi', 'emergency_release', 'blood_bank')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'completed', 'submitted_to_rac')),
  
  -- Patient demographics
  patient_uid TEXT,
  patient_mrn TEXT,
  age INTEGER,
  gender TEXT,
  blood_type TEXT,
  
  -- Event details
  event_date TIMESTAMPTZ,
  form_completion_date TIMESTAMPTZ DEFAULT NOW(),
  agency TEXT,
  transporting_unit TEXT,
  destination_facility TEXT,
  patient_transported BOOLEAN DEFAULT TRUE,
  
  -- Indication
  indication_category TEXT CHECK (indication_category IN ('INJURY', 'GI_BLEED', 'OBSTETRIC_GYNECOLOGIC', 'OTHER')),
  indication_other_details TEXT,
  
  -- Complications
  complication_type TEXT CHECK (complication_type IN ('NONE', 'TRANSFUSION_REACTION', 'OTHER')),
  complication_details TEXT,
  
  -- Disposition
  patient_disposition TEXT,
  blood_bank_notified TEXT CHECK (blood_bank_notified IN ('YES', 'NO', 'NOT_INDICATED')),
  
  -- Prehospital blood (for emergency release form)
  received_prehospital_blood BOOLEAN,
  no_transfusion_reason TEXT CHECK (no_transfusion_reason IN ('CRITERIA_NOT_MET', 'PRODUCT_UNAVAILABLE', 'OTHER')),
  no_transfusion_reason_details TEXT,
  
  -- Blood bank specific (Rh- patients)
  rhogam_treatment TEXT CHECK (rhogam_treatment IN ('YES', 'NO', 'NOT_INDICATED')),
  ob_referral TEXT CHECK (ob_referral IN ('YES', 'NO', 'NOT_INDICATED')),
  followup_appointment TEXT CHECK (followup_appointment IN ('YES', 'NO', 'NOT_INDICATED')),
  antibody_testing TEXT CHECK (antibody_testing IN ('YES', 'NO', 'NOT_INDICATED')),
  transfusion_notification TEXT CHECK (transfusion_notification IN ('YES', 'NO', 'NOT_INDICATED')),
  education_materials TEXT CHECK (education_materials IN ('YES', 'NO', 'NOT_INDICATED')),
  rh_negative_explanation TEXT,
  
  -- Metadata
  user_id UUID NOT NULL REFERENCES auth.users(id),
  ems_run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. vital_signs: Vital sign values and whether thresholds were met
CREATE TABLE IF NOT EXISTS vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES transfusion_cases(id) ON DELETE CASCADE,
  vital_type TEXT NOT NULL CHECK (vital_type IN ('sbp', 'hr', 'shock_index', 'hr_pediatric_under1', 'hr_pediatric_2to10', 'sbp_pediatric')),
  threshold_description TEXT NOT NULL,
  patient_value TEXT,
  met_status TEXT CHECK (met_status IN ('MET', 'NOT_MET')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. physiologic_signs: Hypoperfusion signs and symptoms
CREATE TABLE IF NOT EXISTS physiologic_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES transfusion_cases(id) ON DELETE CASCADE,
  sign_type TEXT NOT NULL CHECK (sign_type IN ('rr', 'etco2', 'altered_mental_status', 'pale_mucosa', 'capillary_refill', 'age_specific_tachypnea')),
  description TEXT NOT NULL,
  patient_value TEXT,
  present_status TEXT CHECK (present_status IN ('PRESENT', 'NOT_PRESENT')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. field_provenance: Audit trail for each field showing data source
CREATE TABLE IF NOT EXISTS field_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES transfusion_cases(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  source TEXT NOT NULL CHECK (source IN ('EMS', 'MANUAL', 'EHR')),
  source_system TEXT,
  source_record_id TEXT,
  recorded_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(case_id, field_name, source, created_at)
);

-- 5. ems_imports: Track EMS data imports from ImageTrend Elite
CREATE TABLE IF NOT EXISTS ems_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES transfusion_cases(id) ON DELETE CASCADE,
  ems_run_id TEXT NOT NULL,
  source_system TEXT DEFAULT 'ImageTrend Elite',
  raw_data JSONB,
  import_status TEXT DEFAULT 'pending' CHECK (import_status IN ('pending', 'matched', 'unmatched', 'error')),
  matched_at TIMESTAMPTZ,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transfusion_cases_user_id ON transfusion_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_transfusion_cases_status ON transfusion_cases(status);
CREATE INDEX IF NOT EXISTS idx_transfusion_cases_form_type ON transfusion_cases(form_type);
CREATE INDEX IF NOT EXISTS idx_transfusion_cases_event_date ON transfusion_cases(event_date);
CREATE INDEX IF NOT EXISTS idx_vital_signs_case_id ON vital_signs(case_id);
CREATE INDEX IF NOT EXISTS idx_physiologic_signs_case_id ON physiologic_signs(case_id);
CREATE INDEX IF NOT EXISTS idx_field_provenance_case_id ON field_provenance(case_id);
CREATE INDEX IF NOT EXISTS idx_ems_imports_ems_run_id ON ems_imports(ems_run_id);

-- Enable Row Level Security
ALTER TABLE transfusion_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE physiologic_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ems_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transfusion_cases
CREATE POLICY "Users can view own cases" ON transfusion_cases 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON transfusion_cases 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON transfusion_cases 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON transfusion_cases 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for vital_signs (via case ownership)
CREATE POLICY "Users can view vital signs for own cases" ON vital_signs 
  FOR SELECT USING (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert vital signs for own cases" ON vital_signs 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "Users can update vital signs for own cases" ON vital_signs 
  FOR UPDATE USING (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete vital signs for own cases" ON vital_signs 
  FOR DELETE USING (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));

-- RLS Policies for physiologic_signs (via case ownership)
CREATE POLICY "Users can view physiologic signs for own cases" ON physiologic_signs 
  FOR SELECT USING (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert physiologic signs for own cases" ON physiologic_signs 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "Users can update physiologic signs for own cases" ON physiologic_signs 
  FOR UPDATE USING (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete physiologic signs for own cases" ON physiologic_signs 
  FOR DELETE USING (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));

-- RLS Policies for field_provenance (via case ownership)
CREATE POLICY "Users can view provenance for own cases" ON field_provenance 
  FOR SELECT USING (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert provenance for own cases" ON field_provenance 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM transfusion_cases WHERE id = case_id AND user_id = auth.uid()));

-- RLS Policies for ems_imports
CREATE POLICY "Users can view own EMS imports" ON ems_imports 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own EMS imports" ON ems_imports 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own EMS imports" ON ems_imports 
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_transfusion_cases_updated_at ON transfusion_cases;
CREATE TRIGGER update_transfusion_cases_updated_at
  BEFORE UPDATE ON transfusion_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
