const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function dumpRequests() {
  const { data, error } = await supabase.from('erp_requests').select('*').order('created_at', { ascending: false }).limit(10);
  if (error) {
     console.error("Error dumping requests:", error);
     return;
  }
  console.log("Recent Requests (JSON Dump):");
  console.log(JSON.stringify(data, null, 2));
}

dumpRequests();
