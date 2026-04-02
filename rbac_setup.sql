-- 🛡️ NEXO ERP RBAC (Role-Based Access Control) Setup
-- Adds flexible permission mapping to departments for SaaS scalability

-- 1. Add menu_permissions Column to erp_departments
ALTER TABLE public.erp_departments 
ADD COLUMN IF NOT EXISTS menu_permissions JSONB DEFAULT '{
    "accounting": true, 
    "hr": true, 
    "finance": true, 
    "members": true, 
    "inventory": true, 
    "sales": true, 
    "quotations": true,
    "settings": true
}'::jsonb;

-- 2. Initialize Default Permissions for Typical Departments
-- Note: This is an example setup. Each tenant can customize this.
UPDATE public.erp_departments SET menu_permissions = '{"accounting": true, "finance": true, "settings": true}'::jsonb WHERE name LIKE '%회계%';
UPDATE public.erp_departments SET menu_permissions = '{"hr": true, "members": true}'::jsonb WHERE name LIKE '%인사%' OR name LIKE '%관리%';
UPDATE public.erp_departments SET menu_permissions = '{"sales": true, "quotations": true, "inventory": true}'::jsonb WHERE name LIKE '%영업%';

-- 3. Add a helper function to check permission easily (Optional)
CREATE OR REPLACE FUNCTION public.has_menu_permission(p_user_id UUID, p_menu_key TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
    v_dept_id UUID;
    v_perms JSONB;
BEGIN
    SELECT role, department_id INTO v_role, v_dept_id FROM erp_profiles WHERE id = p_user_id;
    
    -- Owner/Admin has all permissions
    IF v_role IN ('owner', 'admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Check department permissions
    SELECT menu_permissions INTO v_perms FROM erp_departments WHERE id = v_dept_id;
    
    RETURN (v_perms->>p_menu_key)::BOOLEAN;
EXCEPTION
    WHEN OTHERS THEN RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
