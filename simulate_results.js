const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSimulation() {
  console.log('🎭 [시뮬레이션 시작] 영업팀 & 인사팀 지출 상황 재현...');

  // 1. 부서 정보를 통해 회사 ID 가져오기 (RLS 우회용)
  const { data: deptInfo } = await supabase.from('erp_departments').select('company_id').limit(1).single();
  if (!deptInfo) {
    console.error('❌ 회사 ID를 찾을 수 없습니다.');
    return;
  }
  const companyId = deptInfo.company_id;
  const period = new Date().toISOString().slice(0, 7);

  // 2. 부서 ID 찾기 (없으면 생성 시도)
  const getDept = async (name) => {
    let { data, error } = await supabase.from('erp_departments').select('id').eq('name', name).eq('company_id', companyId).maybeSingle();
    if (!data) {
      console.log(`🏗️  부서 생성 중: ${name}`);
      const { data: newDept, error: insertError } = await supabase.from('erp_departments').insert({ name, company_id: companyId }).select().single();
      if (insertError) {
          console.error(`❌ 부서 생성 실패 (${name}):`, insertError.message);
          return null;
      }
      return newDept?.id;
    }
    return data.id;
  };

  const salesId = await getDept('영업팀');
  const hrId = await getDept('인사팀');

  if (!salesId || !hrId) {
    console.error('❌ 부서 정보를 준비하지 못했습니다. (권한 문제일 수 있습니다)');
    return;
  }

  // 3. 예산 설정 (각 500만원) - RLS 때문에 실패할 수 있으므로 에러 무시
  console.log('💰 영업팀/인사팀 예산 설정 시도 (각 5,000,000원)...');
  await supabase.from('erp_budgets').upsert([
    { company_id: companyId, department_id: salesId, year_month: period, total_budget: 5000000, spent_budget: 0 },
    { company_id: companyId, department_id: hrId, year_month: period, total_budget: 5000000, spent_budget: 0 }
  ], { onConflict: 'department_id, year_month' });

  // 4. 결제 발생
  console.log('💳 [영업팀] 100,000원 결제 발생 (고객사 미팅 식대)');
  await supabase.from('erp_corp_cards').insert({
    company_id: companyId, department_id: salesId, vendor: '한우 전문점 🥩', amount: 100000, category: '접대비', transaction_date: new Date().toISOString()
  });

  console.log('💳 [인사팀] 500,000원 결제 발생 (신입사원 웰컴 키트)');
  await supabase.from('erp_corp_cards').insert({
    company_id: companyId, department_id: hrId, vendor: 'NEXO 기프트 🎁', amount: 500000, category: '복리후생', transaction_date: new Date().toISOString()
  });

  // 5. 결과 리포트 생성
  console.log('\n✨ [시뮬레이션 결과 리포트] ✨');
  
  // 알림 확인
  const { data: notices } = await supabase.from('erp_notifications').select('*').order('created_at', { ascending: false }).limit(2);
  console.log('\n🔔 [생성된 실시간 알림]');
  if (notices && notices.length > 0) {
    notices.forEach(n => console.log(`👉 ${n.message}`));
  } else {
    console.log('⚠️ 알림이 생성되지 않았습니다. 트리거 작동 여부를 확인해 주세요.');
  }

  // 예산 현황 확인
  const { data: budgets } = await supabase.from('erp_budgets').select(`*, department:erp_departments(name)`)
    .in('department_id', [salesId, hrId]).eq('year_month', period);
  
  console.log('\n📊 [부서별 예산 실시간 현황]');
  if (budgets && budgets.length > 0) {
    budgets.forEach(b => {
      const percent = Math.round((b.spent_budget / b.total_budget) * 100);
      const left = b.total_budget - b.spent_budget;
      console.log(`📍 ${b.department.name}: ${Number(b.spent_budget).toLocaleString()}원 / ${Number(b.total_budget).toLocaleString()}원 (${percent}% 사용)`);
      console.log(`   └━ 잔여 한도: ${Number(left).toLocaleString()}원`);
    });
  } else {
    console.log('⚠️ 예산 데이터가 비어 있습니다. (예산 미설정 상태에서 결제만 발생됨)');
  }
}

runSimulation();
