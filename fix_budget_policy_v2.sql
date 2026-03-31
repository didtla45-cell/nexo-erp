-- Drop existing specific manager policy to recreate it more broadly
DROP POLICY IF EXISTS "Owners and Admins can manage budgets" ON erp_budgets;
DROP POLICY IF EXISTS "Managers can manage budgets" ON erp_budgets;

-- 1. Ensure members can still view
-- (Already exists in erp_premium_features.sql, but safely adding again if not)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Company members can view budgets' AND tablename = 'erp_budgets') THEN
        CREATE POLICY "Company members can view budgets" ON erp_budgets 
        FOR SELECT 
        USING (company_id IN (SELECT company_id FROM erp_profiles WHERE id = auth.uid()));
    END IF;
END $$;

-- 2. Improved Policy for ALL operations (INSERT, UPDATE, DELETE)
-- This allows anyone with 'owner' or 'admin' role in their profile to manage budgets.
CREATE POLICY "Managers can manage budgets" ON erp_budgets
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM erp_profiles 
        WHERE id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM erp_profiles 
        WHERE id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- 3. Confirm that RLS is actually enabled
ALTER TABLE erp_budgets ENABLE ROW LEVEL SECURITY;
