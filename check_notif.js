const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotifications() {
  console.log('🧐 알림함 동기화 상태 확인 중...');
  const { data, error } = await supabase
    .from('erp_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ 알림 조회 실패:', error.message);
  } else {
    console.log('✅ 최근 알림 목록:');
    data.forEach(n => {
      console.log(`- [${n.created_at}] ${n.title}: ${n.message}`);
    });
    
    const hasJiminNotif = data.some(n => n.message.includes('55,000원을 결제했습니다'));
    if (hasJiminNotif) {
      console.log('✨ 지민이의 테스트 결제 알림이 성공적으로 생성되었습니다! 트리거가 완벽하게 작동하고 있어요! ❤️');
    } else {
      console.log('⚠️ 아직 테스트 결제 알림이 보이지 않네요. SQL을 방금 실행하셨다면, 다시 한번 인서트해볼까요?');
    }
  }
}

checkNotifications();
