-- 🧠 NEXO ERP: 지능형 예산 알림 시스템 (Smart Budget Alerts)
-- 부서별 예산 소진율이 90% 이상일 때 자동으로 알림을 생성합니다.

CREATE OR REPLACE FUNCTION fn_check_budget_threshold()
RETURNS TRIGGER AS $$
DECLARE
    v_usage_ratio DECIMAL;
    v_dept_name TEXT;
    v_notif_exists BOOLEAN;
BEGIN
    -- 1. 소진율 계산 (0으로 나누기 방지)
    IF NEW.total_budget > 0 THEN
        v_usage_ratio := NEW.spent_budget::DECIMAL / NEW.total_budget::DECIMAL;
    ELSE
        v_usage_ratio := 0;
    END IF;

    -- 2. 90% 이상 소진되었는지 확인
    IF v_usage_ratio >= 0.9 THEN
        -- 3. 부서 이름 가져오기
        SELECT name INTO v_dept_name FROM erp_departments WHERE id = NEW.department_id;

        -- 4. 이번 달, 이 부서에 대해 이미 경고 알림이 있는지 확인 (중복 발송 방지)
        SELECT EXISTS (
            SELECT 1 FROM erp_notifications 
            WHERE company_id = NEW.company_id 
              AND target_role = 'owner'
              AND title LIKE '%' || v_dept_name || ' 예산 소진 경고%'
              AND message LIKE '%' || NEW.year_month || '%'
              AND created_at > NOW() - INTERVAL '1 month'
        ) INTO v_notif_exists;

        -- 5. 알림이 없다면 새로 생성
        IF NOT v_notif_exists THEN
            INSERT INTO erp_notifications (
                company_id,
                target_role,
                title,
                message,
                type,
                link
            ) VALUES (
                NEW.company_id,
                'owner',
                '⚠️ ' || v_dept_name || ' 예산 소진 경고 (90% 돌파)',
                v_dept_name || '의 ' || NEW.year_month || ' 예산이 90% 이상 소진되었습니다. 현재 사용액: ' || 
                TO_CHAR(NEW.spent_budget, 'FM999,999,999,999') || '원 / 총 예산: ' || 
                TO_CHAR(NEW.total_budget, 'FM999,999,999,999') || '원. 확인이 필요합니다! 💎',
                'warning',
                '/dashboard/finance'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (기존 트리거가 있으면 삭제 후 재생성)
DROP TRIGGER IF EXISTS tr_budget_threshold_check ON erp_budgets;
CREATE TRIGGER tr_budget_threshold_check
AFTER UPDATE ON erp_budgets
FOR EACH ROW
EXECUTE FUNCTION fn_check_budget_threshold();
