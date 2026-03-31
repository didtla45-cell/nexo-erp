-- 1. erp_departments table
CREATE TABLE IF NOT EXISTS erp_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. erp_employee_codes table
CREATE TABLE IF NOT EXISTS erp_employee_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES erp_departments(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update erp_profiles
ALTER TABLE erp_profiles 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES erp_departments(id),
ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 4. 보안 설정 (RLS)
ALTER TABLE erp_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_employee_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view departments" ON erp_departments;
CREATE POLICY "Users can view departments" ON erp_departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can manage departments" ON erp_departments;
CREATE POLICY "Owner can manage departments" ON erp_departments FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view codes" ON erp_employee_codes;
CREATE POLICY "Users can view codes" ON erp_employee_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can manage codes" ON erp_employee_codes;
CREATE POLICY "Owner can manage codes" ON erp_employee_codes FOR ALL USING (true);
