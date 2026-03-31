-- Drop existing view policy if needed (optional, or just add new ones)
-- DROP POLICY IF EXISTS "Company members can view budgets" ON erp_budgets;

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

-- 2. Allow Owners and Admins to INSERT/UPDATE/DELETE
CREATE POLICY "Owners and Admins can manage budgets" ON erp_budgets
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM erp_profiles 
        WHERE id = auth.uid() 
        AND company_id = erp_budgets.company_id 
        AND role IN ('owner', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM erp_profiles 
        WHERE id = auth.uid() 
        AND company_id = erp_budgets.company_id 
        AND role IN ('owner', 'admin')
    )
);
