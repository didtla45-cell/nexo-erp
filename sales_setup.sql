-- NEXO ERP Sales Management Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers
CREATE TABLE IF NOT EXISTS erp_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    status TEXT DEFAULT 'Lead',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leads
CREATE TABLE IF NOT EXISTS erp_sales_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES erp_customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source TEXT,
    interest_level INTEGER DEFAULT 3,
    status TEXT DEFAULT 'Open',
    budget BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Deals
CREATE TABLE IF NOT EXISTS erp_sales_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES erp_customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES erp_sales_leads(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    amount BIGINT NOT NULL,
    stage TEXT DEFAULT 'Prospecting',
    expected_closing_date DATE,
    actual_closing_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE erp_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_sales_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select" ON erp_customers;
CREATE POLICY "public_select" ON erp_customers FOR SELECT USING (true);
DROP POLICY IF EXISTS "public_insert" ON erp_customers;
CREATE POLICY "public_insert" ON erp_customers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "public_update" ON erp_customers;
CREATE POLICY "public_update" ON erp_customers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "public_select_leads" ON erp_sales_leads;
CREATE POLICY "public_select_leads" ON erp_sales_leads FOR SELECT USING (true);
DROP POLICY IF EXISTS "public_select_deals" ON erp_sales_deals;
CREATE POLICY "public_select_deals" ON erp_sales_deals FOR SELECT USING (true);
