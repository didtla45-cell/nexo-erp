-- 1. Corporate Cards Table
CREATE TABLE IF NOT EXISTS erp_corporate_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    card_number TEXT NOT NULL,
    card_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    monthly_limit BIGINT DEFAULT 10000000, -- 1000만원 기본
    current_usage BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Departmental Budgets Table
CREATE TABLE IF NOT EXISTS erp_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES erp_departments(id) ON DELETE CASCADE,
    year_month TEXT NOT NULL, -- '2026-03'
    total_budget BIGINT NOT NULL,
    spent_budget BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(department_id, year_month)
);

-- 3. Add card_id to erp_requests to link expenses to cards
ALTER TABLE erp_requests ADD COLUMN IF NOT EXISTS card_id UUID REFERENCES erp_corporate_cards(id) ON DELETE SET NULL;

-- 4. Sample Data for '지민컴퍼니' (If exists)
-- This assumes some IDs exist, so it's mostly for schema reference.
