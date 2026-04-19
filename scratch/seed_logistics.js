const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedLogistics() {
  console.log("Seeding logistics data...");

  // 1. Get Company ID from first profile
  const { data: profiles, error: pError } = await supabase.from('erp_profiles').select('company_id').limit(1).single();
  if (pError || !profiles) {
    console.error("No profile found. Please login first.");
    return;
  }
  const companyId = profiles.company_id;

  // 2. Add Warehouses
  const warehouses = [
    { company_id: companyId, name: '인천 메인 물류센터', location: '인천광역시 중구 서해대로', capacity: 1000, manager_name: '강물류 팀장' },
    { company_id: companyId, name: '서울 강남 제1창고', location: '서울특별시 강남구 테헤란로', capacity: 300, manager_name: '이재고 대리' },
    { company_id: companyId, name: '부산 항만 보관소', location: '부산광역시 영도구 해양로', capacity: 2000, manager_name: '박배송 과장' }
  ];

  const { error: whError } = await supabase.from('erp_warehouses').insert(warehouses);
  if (whError) console.error("WH Store Error:", whError); else console.log("Warehouses added.");

  // 3. Add Logistics Orders
  const orders = [
    { 
      company_id: companyId, 
      tracking_number: '580211928471', 
      courier_company: 'CJ대한통운', 
      status: 'shipping', 
      destination: '서울시 송파구 잠실동', 
      recipient_name: '홍길동',
      delivery_address: '잠실 아파트 101동 202호'
    },
    { 
      company_id: companyId, 
      tracking_number: '619283746501', 
      courier_company: '한진택배', 
      status: 'pending', 
      destination: '경기도 성남시 분당구', 
      recipient_name: '김철수',
      delivery_address: '분당구 정자동 오피스텔'
    },
    { 
      company_id: companyId, 
      tracking_number: '992837162544', 
      courier_company: 'NEXO EXPRESS', 
      status: 'delivered', 
      destination: '제주특별자치도 제주시', 
      recipient_name: '이영희',
      delivery_address: '제주시 해안도로 카페'
    }
  ];

  const { error: logError } = await supabase.from('erp_logistics_orders').insert(orders);
  if (logError) console.error("Log Order Error:", logError); else console.log("Logistics orders added.");

  console.log("Seeding complete!");
}

seedLogistics();
