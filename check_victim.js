
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const victimId = 'c41cb33c-2a9a-41ed-8dbc-412cb7dad95f'; // 인사팀(이건노사원)
  const tables = ['erp_profiles', 'erp_budgets', 'erp_corp_cards'];
  
  console.log(`Checking dependencies for department ID: ${victimId}`);
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('department_id', victimId);
    
    if (error) {
      console.error(`Error checking ${table}:`, error);
    } else {
      console.log(`Table ${table}: ${count} rows referencing this ID`);
    }
  }

  const { data: dept } = await supabase.from('erp_departments').select('*').eq('id', victimId).single();
  console.log('Target Department Data:', dept);
}

run();
