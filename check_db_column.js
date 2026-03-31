
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Try to select from erp_customers and see if business_registration_number exists
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
    console.log('DATA_SAMPLE:', data);
  }
}

checkSchema();
