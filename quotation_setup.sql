-- 📋 NEXO ERP Quotation Management Setup

-- 1. Quotations Table
CREATE TABLE IF NOT EXISTS erp_sales_quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES erp_sales_deals(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES erp_customers(id) ON DELETE CASCADE,
    quotation_number TEXT NOT NULL UNIQUE,
    total_amount BIGINT DEFAULT 0,
    status TEXT DEFAULT 'Draft', -- Draft, Sent, Accepted, Declined
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quotation Items Table (Links to Inventory)
CREATE TABLE IF NOT EXISTS erp_sales_quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES erp_sales_quotations(id) ON DELETE CASCADE,
    item_id UUID REFERENCES erp_inventory_items(id) ON DELETE SET NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price BIGINT NOT NULL,
    subtotal BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE erp_sales_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_sales_quotation_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their company's quotations" ON erp_sales_quotations FOR SELECT USING (true);
CREATE POLICY "Users can view quotation items" ON erp_sales_quotation_items FOR SELECT USING (true);
CREATE POLICY "Users can insert quotations" ON erp_sales_quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert quotation items" ON erp_sales_quotation_items FOR INSERT WITH CHECK (true);
