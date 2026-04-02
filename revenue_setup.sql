-- 💰 NEXO ERP Revenue Management Setup
-- Create Revenue Vouchers table for sales tracking

CREATE TABLE IF NOT EXISTS public.erp_revenue_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.erp_companies(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES public.erp_sales_quotations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.erp_customers(id) ON DELETE SET NULL,
    voucher_number TEXT NOT NULL UNIQUE,
    net_amount BIGINT NOT NULL DEFAULT 0,    -- 공급가액
    vat_amount BIGINT NOT NULL DEFAULT 0,    -- 부가세
    total_amount BIGINT NOT NULL DEFAULT 0,  -- 합계액
    revenue_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.erp_revenue_vouchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their company's revenue" ON public.erp_revenue_vouchers;
CREATE POLICY "Users can view their company's revenue"
ON public.erp_revenue_vouchers FOR ALL
USING (company_id = (SELECT company_id FROM public.erp_profiles WHERE id = auth.uid()));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_revenue_vouchers_company ON public.erp_revenue_vouchers(company_id);
CREATE INDEX IF NOT EXISTS idx_revenue_vouchers_date ON public.erp_revenue_vouchers(revenue_date);
