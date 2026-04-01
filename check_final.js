const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFinal() {
  console.log('🧐 시뮬레이션 결과 최종 확인 중...');
  const { data: notices } = await supabase
    .from('erp_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('\n🔔 [생성된 시뮬레이션 알림]');
  if (notices) {
    notices.filter(n => n.message.includes('영업팀') || n.message.includes('인사팀')).forEach(n => {
      console.log(`👉 ${n.message}`);
    });
  }

  const { data: budgets } = await supabase
    .from('erp_budgets')
    .select('*, department:erp_departments(name)')
    .eq('year_month', new Date().toISOString().slice(0, 7));

  console.log('\n📊 [부서별 예산 실시간 현황]');
  if (budgets && budgets.length > 0) {
    budgets.forEach(b => {
      const left = b.total_budget - b.spent_budget;
      console.log(`📍 ${b.department.name}: ${Number(b.spent_budget).toLocaleString()}원 / ${Number(b.total_budget).toLocaleString()}원 (${Math.round(b.spent_budget/b.total_budget*100)}% 사용)`);
      console.log(`   └━ 잔여 한도: ${Number(left).toLocaleString()}원`);
    });
  } else {
    console.log('⚠️ 예산 데이터가 아직 집계되지 않았습니다. (예산 미설정 상태)');
  }
}

checkFinal();
