DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_transactions_profile') THEN
        ALTER TABLE erp_inventory_transactions
        ADD CONSTRAINT fk_transactions_profile
        FOREIGN KEY (user_id) REFERENCES erp_profiles(id);
    END IF;
END $$;
