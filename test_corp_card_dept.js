const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('🚀 법인카드 부서별 지능형 시스템 테스트 시작...');

  // 1. 필요한 정보 가져오기 (회사, 부서)
  const { data: depts, error: deptError } = await supabase.from('erp_departments').select('*').limit(1);
  if (deptError || !depts[0]) {
    console.error('❌ 부서 정보를 찾을 수 없습니다.');
    return;
  }
  const companyId = depts[0].company_id;
  const deptId = depts[0].id;
  const deptName = depts[0].name;
  const period = new Date().toISOString().slice(0, 7); // '2026-03'

  console.log(`📍 테스트 대상 부서: ${deptName} (${deptId})`);

  // 2. 테스트용 예산 설정 (500만원)
  console.log('💰 테스트 예산 설정 중 (5,000,000원)...');
  const { error: budgetError } = await supabase.from('erp_budgets').upsert({
    company_id: companyId,
    department_id: deptId,
    year_month: period,
    total_budget: 5000000,
    spent_budget: 0
  }, { onConflict: 'department_id, year_month' });

  if (budgetError) {
    console.error('❌ 예산 설정 실패:', budgetError.message);
    // RLS 문제일 가능성이 큼. 하지만 진행함.
  }

  // 3. 법인카드 결제 INSERT 발생 (가상 데이터)
  console.log('💳 법인카드 가상 결제 발생 (식대 55,000원)...');
  const { data: tx, error: txError } = await supabase.from('erp_corp_cards').insert({
    company_id: companyId,
    department_id: deptId,
    card_number: '1234-5678-9012-3456',
    vendor: '지민이네 스시집 🍣',
    amount: 55000,
    category: '식대',
    description: '대표님 응원용 서프라이즈 식사'
  }).select();

  if (txError) {
    console.error('❌ 결제 데이터 삽입 실패:', txError.message);
    console.log('⚠️ [참고] 데이터베이스 트리거와 컬럼 추가(update_corp_card_dept_logic.sql)가 먼저 실행되어야 합니다.');
  } else {
    console.log('✅ 결제 데이터 삽입 성공!');
    console.log('🔔 이제 사장님 알림함에 "[' + deptName + ']에서 55,000원을 결제했습니다" 알림이 생성되었을 거예요!');
  }

  // 4. 예산 차감 확인
  const { data: budgetAfter } = await supabase.from('erp_budgets')
    .select('*')
    .eq('department_id', deptId)
    .eq('year_month', period)
    .single();

  if (budgetAfter) {
    console.log(`📊 예산 차감 결과: 사용액 ₩${Number(budgetAfter.spent_budget).toLocaleString()} (남은 예산: ₩${(budgetAfter.total_budget - budgetAfter.spent_budget).toLocaleString()})`);
  }
}

runTest();
