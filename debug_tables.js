const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.log('ENV_MISSING');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['erp_corp_cards', 'erp_corporate_cards', 'erp_budgets', 'erp_departments'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`TABLE ${table}: ERROR ${error.message}`);
    } else {
      console.log(`TABLE ${table}: OK (${data.length} rows found)`);
      if (data.length > 0) console.log(`TABLE ${table} SAMPLE:`, Object.keys(data[0]));
    }
  }
}

checkTables();
