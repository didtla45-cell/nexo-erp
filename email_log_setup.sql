-- erp_email_logs table
CREATE TABLE IF NOT EXISTS erp_email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES erp_sales_quotations(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'Sent',
    opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE erp_email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view company logs" ON erp_email_logs FOR SELECT USING (true);
CREATE POLICY "System can insert logs" ON erp_email_logs FOR INSERT WITH CHECK (true);
