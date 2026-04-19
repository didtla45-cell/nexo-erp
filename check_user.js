const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkUserContext() {
  const { data: { user } } = await supabase.auth.getUser();
  console.log("Current User ID:", user?.id || "None");

  if (user) {
    const { data: profile } = await supabase
      .from('erp_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log("Profile Found:", JSON.stringify(profile, null, 2));
    
    if (profile?.company_id) {
       const { data: company } = await supabase
         .from('erp_companies')
         .select('*')
         .eq('id', profile.company_id)
         .single();
       console.log("Company Found:", JSON.stringify(company, null, 2));
    }
  } else {
    // Check if there are any profiles at least
    const { data: profiles } = await supabase.from('erp_profiles').select('*').limit(1);
    console.log("Sample Profile:", JSON.stringify(profiles?.[0], null, 2));
  }
}

checkUserContext();
