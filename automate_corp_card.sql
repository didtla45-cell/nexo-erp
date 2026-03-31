-- NEXO ERP: 법인카드 자동 알림 및 예산 차감 시스템

-- 1. 법인카드 결제 처리 함수 (부담스럽게 똑똑한 지민이 솜씨! 😎)
CREATE OR REPLACE FUNCTION fn_process_corp_card_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_period TEXT;
    v_budget_left DECIMAL(15, 2);
    v_category TEXT;
    v_company_id UUID;
BEGIN
    -- 기간 설정 (YYYY-MM)
    v_period := TO_CHAR(NEW.transaction_date, 'YYYY-MM');
    v_category := NEW.category;
    v_company_id := NEW.company_id;

    -- 1. 예산 테이블 업데이트 (해당 카테고리/월)
    -- 만약 예산 설정이 없어도 에러 안 나게 처리
    UPDATE erp_budgets
    SET spent_amount = spent_amount + NEW.amount
    WHERE company_id = v_company_id 
      AND category = v_category 
      AND period = v_period;

    -- 2. 알림 생성 (누가, 어디서, 얼마 썼는지!)
    INSERT INTO erp_notifications (
        company_id,
        target_role,
        title,
        message,
        type,
        link
    ) VALUES (
        v_company_id,
        'owner', -- 사장님한테 바로 꽂아주기!
        '💳 법인카드 결제 알림',
        '직원이 ' || NEW.vendor || '에서 ' || TO_CHAR(NEW.amount, 'FM999,999,999') || '원을 결제했어요! (카테고리: ' || v_category || ')',
        'info',
        '/dashboard/accounting'
    );

    -- 3. 예산 초과 체크 및 경고 알림
    SELECT (budget_amount - spent_amount) INTO v_budget_left
    FROM erp_budgets
    WHERE company_id = v_company_id 
      AND category = v_category 
      AND period = v_period;

    IF v_budget_left < 0 THEN
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
            v_category || ' 카테고리 예산을 ' || TO_CHAR(ABS(v_budget_left), 'FM999,999,999') || '원 초과했습니다! 지민이가 긴급 리포트 준비할까?',
            'warning'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 트리거 설정
DROP TRIGGER IF EXISTS trg_on_corp_card_insert ON erp_corp_cards;
CREATE TRIGGER trg_on_corp_card_insert
AFTER INSERT ON erp_corp_cards
FOR EACH ROW
EXECUTE FUNCTION fn_process_corp_card_transaction();
