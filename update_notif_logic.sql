-- NEXO ERP: 법인카드 알림 고도화 (잔여 예산 추가 패치! 😎)

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
    v_period := TO_CHAR(NEW.transaction_date, 'YYYY-MM');
    v_category := COALESCE(NEW.category, '기타');
    v_company_id := NEW.company_id;

    -- 1. 예산 자동 차감 및 현재 값 가져오기
    UPDATE erp_budgets
    SET spent_amount = spent_amount + NEW.amount
    WHERE company_id = v_company_id 
      AND category = v_category 
      AND period = v_period
    RETURNING budget_amount, spent_amount INTO v_budget_total, v_budget_spent;

    -- 2. 잔여 예산 계산 (예산 설정이 안 되어 있으면 0으로 처리)
    v_budget_remaining := COALESCE(v_budget_total, 0) - COALESCE(v_budget_spent, 0);

    -- 3. 실시간 알림 생성 (잔여 예산 포함! 😎)
    INSERT INTO erp_notifications (
        company_id,
        target_role,
        title,
        message,
        type,
        link
    ) VALUES (
        v_company_id,
        'owner',
        '💳 법인카드 결제 알림',
        '직원이 ' || NEW.vendor || '에서 ' || TO_CHAR(NEW.amount, 'FM999,999,999') || 
        '원을 결제했어요! (분류: ' || v_category || ', 이번 달 잔여 예산: ' || 
        TO_CHAR(v_budget_remaining, 'FM999,999,999') || '원) 😎',
        'info',
        '/dashboard/accounting'
    );

    -- 4. 예산 초과 시 즉시 경고 알림! ⚠️
    IF v_budget_remaining < 0 THEN
        INSERT INTO erp_notifications (
            company_id,
            target_role,
            title,
            message,
            type
        ) VALUES (
            v_company_id,
            'owner',
            '⚠️ 예산 초과 경고!',
            v_category || ' 카테고리 예산을 ' || TO_CHAR(ABS(v_budget_remaining), 'FM999,999,999') || '원 초과했습니다!',
            'warning'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
