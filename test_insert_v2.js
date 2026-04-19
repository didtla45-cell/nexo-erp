const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  const { data: companies } = await supabase.from('erp_companies').select('id').eq('name', '지민컴퍼니').single();
  const companyId = companies?.id;
  
  // Get a valid user profile ID
  const { data: profiles } = await supabase.from('erp_profiles').select('id').limit(1);
  const userId = profiles?.[0]?.id;

  if (!userId || !companyId) {
     console.error("Missing context IDs. User:", userId, "Company:", companyId);
     return;
  }

  const payload = { 
    user_id: userId, 
    company_id: companyId, 
    title: "Test V2", 
    type: "expense", 
    amount: 12345, 
    content: "Testing RLS/Schema", 
    status: "pending"
  };

  const { data, error } = await supabase.from('erp_requests').insert([payload]);
  if (error) {
    console.log("INSERT ERROR DETAILS:");
    console.log("Code:", error.code);
    console.log("Message:", error.message);
    console.log("Details:", error.details);
    console.log("Hint:", error.hint);
  } else {
    console.log("INSERT SUCCESSFUL!");
  }
}

testInsert();
