-- ERP Premium Features: Accounting Extension

-- 1. 법인카드 내역 (erp_corp_cards)
CREATE TABLE IF NOT EXISTS erp_corp_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    card_number TEXT NOT NULL,
    vendor TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT,
    status TEXT DEFAULT 'pending', -- pending, matched, ignored
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 개인 경비 청구 (erp_reimbursements)
CREATE TABLE IF NOT EXISTS erp_reimbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
    receipt_url TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 구매 요청/수주 결재 (erp_purchase_orders)
CREATE TABLE IF NOT EXISTS erp_purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    vendor TEXT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    status TEXT DEFAULT 'draft', -- draft, pending, approved, ordered, received
    items JSONB, -- List of items, quantities, prices
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 예산 설정 (erp_budgets)
CREATE TABLE IF NOT EXISTS erp_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    budget_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    period TEXT NOT NULL, -- '2026-03'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, category, period)
);

-- RLS Policies
ALTER TABLE erp_corp_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_budgets ENABLE ROW LEVEL SECURITY;

-- Simple RLS (Allow company members)
CREATE POLICY "Company members can view corp cards" ON erp_corp_cards FOR SELECT USING (company_id IN (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));
CREATE POLICY "Company members can view reimbursements" ON erp_reimbursements FOR SELECT USING (company_id IN (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));
CREATE POLICY "Company members can view POs" ON erp_purchase_orders FOR SELECT USING (company_id IN (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));
CREATE POLICY "Company members can view budgets" ON erp_budgets FOR SELECT USING (company_id IN (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));
