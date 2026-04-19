-- 🚀 Phase 1: Accounting & Partners Setup

-- 1. Create erp_partners table (CRM Foundation)
CREATE TABLE IF NOT EXISTS public.erp_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL, -- Isolated by company
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('customer', 'vendor', 'both')) DEFAULT 'customer',
    business_number TEXT,
    representative TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID -- Registered by
);

-- 2. Create erp_accounting_vouchers table (The Ledger)
CREATE TABLE IF NOT EXISTS public.erp_accounting_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    user_id UUID, -- Created by
    voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT CHECK (type IN ('general', 'purchase', 'sales')) NOT NULL,
    partner_id UUID REFERENCES public.erp_partners(id),
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    vat_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_tax_invoice BOOLEAN DEFAULT FALSE,
    account_code TEXT NOT NULL, -- e.g., '101' for Cash
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Policy Setup for Multi-tenant Isolation (RLS)
ALTER TABLE public.erp_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_accounting_vouchers ENABLE ROW LEVEL SECURITY;

-- Partners RLS
CREATE POLICY "Users can see their company partners" ON public.erp_partners
    FOR ALL USING (company_id = (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));

-- Vouchers RLS
CREATE POLICY "Users can see their company vouchers" ON public.erp_accounting_vouchers
    FOR ALL USING (company_id = (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));

-- 4. Initial Global Account Codes (Simplified)
-- In a real ERP, this would be a separate table 'erp_chart_of_accounts'
-- 101: Cash, 108: Accounts Receivable, 121: Products, 251: Accounts Payable, 401: Sales Revenue, 501: Cost of Goods Sold
