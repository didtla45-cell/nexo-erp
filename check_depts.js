
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDepts() {
  const { data: depts, error: deptError } = await supabase
    .from('erp_departments')
    .select('*');

  if (deptError) {
    console.error('Dept Error:', deptError);
    return;
  }

  console.log('--- Departments ---');
  console.table(depts);

  for (const dept of depts) {
    const { count, error: countError } = await supabase
      .from('erp_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', dept.id);
    
    console.log(`Dept: ${dept.name} (${dept.id}), User Count: ${count}`);
  }
}

checkDepts();
