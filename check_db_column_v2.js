
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

async function checkSchema() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('erp_customers')
    .select('business_registration_number')
    .limit(1);
  
  if (error) {
    if (error.message.includes('column "business_registration_number" does not exist')) {
      console.log('COLUMN_MISSING');
    } else {
      console.log('ERROR:', error.message);
    }
  } else {
    console.log('COLUMN_EXISTS');
    if (data && data.length > 0) {
        console.log('DATA_FOUND');
    }
  }
}

checkSchema();
