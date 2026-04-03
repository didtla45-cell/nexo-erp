-- erp_inventory_items 테이블에 등록자(user_id) 컬럼 추가
-- 기존 데이터는 NULL 상태로 시작하며, UI에서 '관리자'로 표시하도록 처리합니다.

ALTER TABLE IF EXISTS erp_inventory_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES erp_profiles(id);

-- (참고) RLS 정책이 활성화되어 있다면 추가적인 정책 업데이트가 필요할 수 있습니다.
