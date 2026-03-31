-- NEXO ERP: 수익화(Monetization)를 위한 비즈니스 버전 알림 패치! 💼

CREATE OR REPLACE FUNCTION fn_process_corp_card_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_period TEXT;
    v_budget_total DECIMAL(15, 2);
    v_budget_spent DECIMAL(15, 2);
    v_budget_remaining DECIMAL(15, 2);
    v_category TEXT;
    v_company_id UUID;
BEGIN
    v_period := TO_CHAR(COALESCE(NEW.transaction_date, NOW()), 'YYYY-MM');
    v_category := COALESCE(NEW.category, '복리후생');
    v_company_id := NEW.company_id;

    -- [A] 예산 자동 차감
    UPDATE erp_budgets
    SET spent_amount = spent_amount + NEW.amount
    WHERE company_id = v_company_id 
      AND category = v_category 
      AND period = v_period
    RETURNING budget_amount, spent_amount INTO v_budget_total, v_budget_spent;

    -- [B] 비즈니스 톤 알림 생성
    IF v_budget_total IS NOT NULL THEN
        v_budget_remaining := v_budget_total - v_budget_spent;
        
        INSERT INTO erp_notifications (
            company_id, target_role, title, message, type, link
        ) VALUES (
            v_company_id, 'owner', '💳 법인카드 결제 알림',
            '직원이 ' || NEW.vendor || '에서 ' || TO_CHAR(NEW.amount, 'FM999,999,999') || 
            '원을 결제했습니다. (분류: ' || v_category || ', 이번 달 잔여 예산: ' || 
            TO_CHAR(v_budget_remaining, 'FM999,999,999') || '원)',
            'info', '/dashboard/accounting'
        );
    ELSE
        -- 예산 미설정 시에도 정중한 비즈니스 톤으로! 🫡
        INSERT INTO erp_notifications (
            company_id, target_role, title, message, type
        ) VALUES (
            v_company_id, 'owner', '💳 법인카드 결제 알림 (예산 미설정)',
            '직원이 ' || NEW.vendor || '에서 ' || TO_CHAR(NEW.amount, 'FM999,999,999') || 
            '원을 결제했습니다. 해당 카테고리에 대한 이번 달 예산 계획이 설정되어 있지 않습니다.',
            'warning'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
