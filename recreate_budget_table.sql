-- 1. 구형 테이블 과감히 삭제 (CASCADE를 써서 연관된 것까지 깔끔하게 지웁니다)
DROP TABLE IF EXISTS erp_budgets CASCADE;

-- 2. 최신 규격(Department-based)으로 테이블 생성
CREATE TABLE erp_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES erp_companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES erp_departments(id) ON DELETE CASCADE,
    year_month TEXT NOT NULL, -- '2026-03' 형식
    total_budget BIGINT NOT NULL,
    spent_budget BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(department_id, year_month) -- 같은 부서, 같은 달에는 하나의 예산만 존재
);

-- 3. 보안 정책(RLS) 설정
ALTER TABLE erp_budgets ENABLE ROW LEVEL SECURITY;

-- [관리자 권한] CEO나 관리자는 모든 예산을 관리(ALL)할 수 있음
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

-- [조회 권한] 일반 멤버도 자기 회사의 예산 현황은 볼 수 있음
CREATE POLICY "Company members can view budgets" ON erp_budgets
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM erp_profiles WHERE id = auth.uid()
    )
);

-- 4. 팁: Supabase 갱신을 위해 수동으로 알림 (선택 사항)
-- NOTIFY pgrst, 'reload schema';
