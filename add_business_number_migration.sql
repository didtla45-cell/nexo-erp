-- Add business_registration_number column to erp_customers table
ALTER TABLE erp_customers ADD COLUMN IF NOT EXISTS business_registration_number TEXT;
