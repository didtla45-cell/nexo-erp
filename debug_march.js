const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMarch() {
  console.log('🔍 [디버깅] 3월 데이터 및 알림 상태 확인 중...');
  
  // 1. 최근 알림 10개 조회
  const { data: notices, error: nError } = await supabase
    .from('erp_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (nError) console.error('❌ 알림 조회 실패:', nError.message);
  else {
    console.log('\n🔔 [최근 알림 목록]');
    notices.forEach(n => console.log(`👉 ${n.message}`));
  }

  // 2. 3월 예산 데이터 직접 조회
  const { data: budgets, error: bError } = await supabase
    .from('erp_budgets')
    .select('*, department:erp_departments(name)')
    .eq('year_month', '2026-03');

  if (bError) console.error('❌ 예산 조회 실패:', bError.message);
  else {
    console.log('\n📊 [3월 예산 데이터베이스 값]');
    if (budgets.length === 0) console.log('⚠️ 3월 예산 데이터가 테이블에 존재하지 않습니다!');
    else {
      budgets.forEach(b => {
        console.log(`📍 ${b.department.name}: ${b.spent_budget} / ${b.total_budget} (ID: ${b.id})`);
      });
    }
  }
}

debugMarch();
