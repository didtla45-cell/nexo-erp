-- 🔔 NEXO ERP Notification System Setup

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS erp_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Target specific user
    target_role TEXT, -- Target specific role (owner, sales, accounting, etc.)
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, success, warning, error, quotation
    link TEXT, -- Optional link to navigate to
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE erp_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their notifications" ON erp_notifications;
CREATE POLICY "Users can view their notifications" ON erp_notifications
    FOR SELECT USING (
        auth.uid() = user_id OR 
        target_role = (SELECT role FROM erp_profiles WHERE id = auth.uid()) OR
        (SELECT role FROM erp_profiles WHERE id = auth.uid()) = 'owner'
    );

DROP POLICY IF EXISTS "Anyone can insert notifications" ON erp_notifications;
CREATE POLICY "Anyone can insert notifications" ON erp_notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON erp_notifications;
CREATE POLICY "Users can update their own notifications" ON erp_notifications
    FOR UPDATE USING (auth.uid() = user_id OR target_role = (SELECT role FROM erp_profiles WHERE id = auth.uid()));
