-- 🚀 Phase 2: Logistics & Distribution Setup

-- 1. Add barcode column to erp_inventory_items
ALTER TABLE public.erp_inventory_items 
ADD COLUMN IF NOT EXISTS barcode TEXT;

-- 2. Create erp_warehouses table (Multi-Warehouse)
CREATE TABLE IF NOT EXISTS public.erp_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    contact_number TEXT,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create erp_stock_levels table (Inventory at each Warehouse)
CREATE TABLE IF NOT EXISTS public.erp_stock_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    item_id UUID NOT NULL REFERENCES public.erp_inventory_items(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES public.erp_warehouses(id) ON DELETE CASCADE,
    quantity NUMERIC(15, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(item_id, warehouse_id)
);

-- 4. Create erp_logistics_orders table (Inbound/Outbound Tracking)
CREATE TABLE IF NOT EXISTS public.erp_logistics_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    user_id UUID, -- Created by
    type TEXT CHECK (type IN ('inbound', 'outbound', 'transfer')) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'shipping', 'delivered', 'cancelled')) DEFAULT 'pending',
    source_warehouse_id UUID REFERENCES public.erp_warehouses(id),
    target_warehouse_id UUID REFERENCES public.erp_warehouses(id),
    tracking_number TEXT, -- Courier Tracking Number
    courier_code TEXT, -- e.g., 'kr.cjlogistics'
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS Policies for Logistics
ALTER TABLE public.erp_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_logistics_orders ENABLE ROW LEVEL SECURITY;

-- Warehouses RLS
CREATE POLICY "Users can see their company warehouses" ON public.erp_warehouses
    FOR ALL USING (company_id = (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));

-- Stock Levels RLS
CREATE POLICY "Users can see their company stock levels" ON public.erp_stock_levels
    FOR ALL USING (company_id = (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));

-- Logistics Orders RLS
CREATE POLICY "Users can see their company logistics orders" ON public.erp_logistics_orders
    FOR ALL USING (company_id = (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));

-- 6. Trigger to track stock level updates
CREATE OR REPLACE FUNCTION public.update_stock_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_timestamp
BEFORE UPDATE ON public.erp_stock_levels
FOR EACH ROW EXECUTE FUNCTION public.update_stock_timestamp();
