const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  const { data: companies } = await supabase.from('erp_companies').select('id').eq('name', '지민컴퍼니').single();
  const companyId = companies?.id;
  
  if (!companyId) {
    console.error("Company '지민컴퍼니' not found.");
    return;
  }

  // Get a valid user profile ID
  const { data: profiles } = await supabase.from('erp_profiles').select('id').limit(1);
  const userId = profiles?.[0]?.id;

  if (!userId) {
     console.error("No profiles found to use as user_id.");
     return;
  }

  console.log(`Attempting insert for Company: ${companyId}, User: ${userId}`);

  const payload = { 
    user_id: userId, 
    company_id: companyId, 
    title: "Test Expense Request", 
    type: "expense", 
    amount: 10000, 
    content: "Testing registration failure", 
    status: "pending"
  };

  const { data, error } = await supabase.from('erp_requests').insert([payload]);
  
  if (error) {
    console.error("INSERT FAILED:", error);
    if (error.code === '23502') {
       console.error("Reason: Missing NOT NULL column. Details:", error.details);
    }
  } else {
    console.log("INSERT SUCCESSFUL!");
  }
}

testInsert();
