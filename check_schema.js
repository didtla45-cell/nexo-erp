const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  // We can't directly check schema via public API easily, but we can try to insert an empty row to see the error,
  // or select one row to see the columns.
  const { data, error } = await supabase.from('erp_requests').select('*').limit(1);
  if (error) {
    console.error("Error fetching data:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns found in erp_requests:", Object.keys(data[0]));
  } else {
    // If no data, try to fetch some metadata or just check other tables
    console.log("No data found in erp_requests to check columns.");
    // Let's try to fetch another related table to see if it's a context issue
    const { data: profile } = await supabase.from('erp_profiles').select('*').limit(1);
    console.log("Columns found in erp_profiles:", Object.keys(profile[0] || {}));
  }
}

checkSchema();
