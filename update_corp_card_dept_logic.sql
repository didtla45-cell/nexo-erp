-- 1. erp_corp_cards 테이블에 부서 정보 추가
ALTER TABLE erp_corp_cards ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES erp_departments(id) ON DELETE SET NULL;

-- 2. 법인카드 결제 처리 함수 고도화 (지민이의 똑똑한 로직! ✨)
CREATE OR REPLACE FUNCTION fn_process_corp_card_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_period TEXT;
    v_dept_name TEXT;
    v_budget_total BIGINT;
    v_budget_spent BIGINT;
    v_budget_remaining BIGINT;
    v_company_id UUID;
BEGIN
    -- 기간 설정 (YYYY-MM)
    v_period := TO_CHAR(NEW.transaction_date, 'YYYY-MM');
    v_company_id := NEW.company_id;

    -- [A] 부서 이름 조회 (알림용)
    IF NEW.department_id IS NOT NULL THEN
        SELECT name INTO v_dept_name FROM erp_departments WHERE id = NEW.department_id;
    ELSE
        v_dept_name := '미지정 부서';
    END IF;

    -- [B] 예산 업데이트 (해당 부서/월)
    -- 장부가 없는 경우 자동으로 생성 (기본 한도 100만원 설정)
    IF NOT EXISTS (
        SELECT 1 FROM erp_budgets 
        WHERE company_id = v_company_id 
          AND department_id = NEW.department_id 
          AND year_month = v_period
    ) THEN
        INSERT INTO erp_budgets (company_id, department_id, year_month, total_budget, spent_budget)
        VALUES (v_company_id, NEW.department_id, v_period, 1000000, 0);
    END IF;

    UPDATE erp_budgets
    SET spent_budget = spent_budget + NEW.amount
    WHERE company_id = v_company_id 
      AND department_id = NEW.department_id 
      AND year_month = v_period
    RETURNING total_budget, spent_budget INTO v_budget_total, v_budget_spent;

    -- [C] 알림 생성 (부서명, 금액, 잔여 예산 포함)
    IF v_budget_total IS NOT NULL THEN
        v_budget_remaining := v_budget_total - v_budget_spent;
        
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
            '[' || v_dept_name || ']에서 ' || TO_CHAR(NEW.amount, 'FM999,999,999') || 
            '원을 결제했습니다. (이번 달 잔여 예산: ' || 
            TO_CHAR(v_budget_remaining, 'FM999,999,999') || '원)',
            'info',
            '/dashboard/accounting'
        );

        -- 예산 초과 체크
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
                '[' || v_dept_name || '] 부서 예산을 ' || TO_CHAR(ABS(v_budget_remaining), 'FM999,999,999') || '원 초과했습니다!',
                'warning'
            );
        END IF;
    ELSE
        -- 예산 계획이 없는 부서일 경우에도 알림
        INSERT INTO erp_notifications (
            company_id,
            target_role,
            title,
            message,
            type
        ) VALUES (
            v_company_id,
            'owner',
            '💳 법인카드 결제 알림 (예산 미설정)',
            '[' || v_dept_name || ']에서 ' || TO_CHAR(NEW.amount, 'FM999,999,999') || 
            '원을 결제했습니다. 해당 부서의 이번 달 예산 계획이 설정되어 있지 않습니다.',
            'warning'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 트리거 재설정
DROP TRIGGER IF EXISTS trg_on_corp_card_insert ON erp_corp_cards;
CREATE TRIGGER trg_on_corp_card_insert
AFTER INSERT ON erp_corp_cards
FOR EACH ROW
EXECUTE FUNCTION fn_process_corp_card_transaction();
