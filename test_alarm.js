const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const cid = '05df076c-4e63-4c69-94de-d346f278e4c3';
    
    console.log('1. Mock 예산 설정 중...');
    await supabase.from('erp_budgets').upsert([{ 
        company_id: cid, 
        category: '복리후생', 
        budget_amount: 1000000, 
        spent_amount: 0, 
        period: '2026-03' 
    }], { onConflict: 'company_id,category,period' });

    console.log('2. 테스트 법인카드 결제 데이터 삽입 중...');
    const { data, error } = await supabase.from('erp_corp_cards').insert([{ 
        company_id: cid, 
        card_number: '1234-****-****-5678', 
        vendor: '스타벅스 강남점', 
        amount: 12500, 
        category: '복리후생', 
        description: '지민이가 보내는 축하 테스트 결제! 😎' 
    }]);

    if (error) {
        console.error('에러 발생:', error);
    } else {
        console.log('성공! 대시보드를 확인해보세요.');
    }
}

run();
