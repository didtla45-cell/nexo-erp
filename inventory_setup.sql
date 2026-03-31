-- 1. Inventory Items Table
CREATE TABLE IF NOT EXISTS public.erp_inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.erp_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    description TEXT,
    unit_price NUMERIC DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    current_stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Inventory Transactions Table
CREATE TABLE IF NOT EXISTS public.erp_inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.erp_companies(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.erp_inventory_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Enable
ALTER TABLE public.erp_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_inventory_transactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can view their company's inventory" ON public.erp_inventory_items;
CREATE POLICY "Users can view their company's inventory"
ON public.erp_inventory_items FOR ALL
USING (company_id = (SELECT company_id FROM public.erp_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their company's transactions" ON public.erp_inventory_transactions;
CREATE POLICY "Users can view their company's transactions"
ON public.erp_inventory_transactions FOR ALL
USING (company_id = (SELECT company_id FROM public.erp_profiles WHERE id = auth.uid()));
