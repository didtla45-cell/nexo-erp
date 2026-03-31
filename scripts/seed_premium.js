const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPremiumData() {
  console.log("Seeding premium ERP data...");

  // 1. Get company id
  const { data: companies } = await supabase.from('erp_companies').select('id').eq('name', '지민컴퍼니');
  if (!companies || companies.length === 0) {
    console.error("지민컴퍼니 not found.");
    return;
  }
  const companyId = companies[0].id;

  // 2. Seed Corp Cards
  const { error: cardError } = await supabase.from('erp_corp_cards').insert([
    {
      company_id: companyId,
      card_number: '1234-5678-9012-3344',
      vendor: 'AWS Cloud Services',
      amount: 450000,
      category: 'Infrastructure',
      description: 'Monthly server hosting'
    },
    {
      company_id: companyId,
      card_number: '1234-5678-9012-3344',
      vendor: 'Starbucks Gangnam',
      amount: 15600,
      category: 'Meals',
      description: 'Client meeting'
    }
  ]);

  if (cardError) console.error("Corp Card Seed Error:", cardError);
  else console.log("Seeded Corp Cards.");

  // 3. Seed Reimbursements
  const { data: profiles } = await supabase.from('erp_profiles').select('id').eq('company_id', companyId).limit(1);
  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id;
    const { error: remError } = await supabase.from('erp_reimbursements').insert([
      {
        user_id: userId,
        company_id: companyId,
        title: 'Taxi fare for night shift',
        amount: 12500,
        content: 'Work stayed late until 11PM'
      }
    ]);
    if (remError) console.error("Reimbursement Seed Error:", remError);
    else console.log("Seeded Reimbursements.");

    // 4. Seed Purchase Orders
    const { error: poError } = await supabase.from('erp_purchase_orders').insert([
      {
        user_id: userId,
        company_id: companyId,
        title: 'MacBook Pro M3 for Design Team',
        vendor: 'Apple Korea',
        total_amount: 4200000,
        status: 'pending',
        content: 'Replacing old 2018 model'
      }
    ]);
    if (poError) console.error("PO Seed Error:", poError);
    else console.log("Seeded POs.");

    // 5. Seed Budgets
    const { error: budgetError } = await supabase.from('erp_budgets').upsert([
      {
        company_id: companyId,
        category: 'Infrastucture',
        budget_amount: 1000000,
        spent_amount: 450000,
        period: '2026-03'
      },
      {
        company_id: companyId,
        category: 'Meals',
        budget_amount: 500000,
        spent_amount: 520000, // Budget exceeded!
        period: '2026-03'
      }
    ]);
    if (budgetError) console.error("Budget Seed Error:", budgetError);
    else console.log("Seeded Budgets.");
  }

  console.log("Seeding complete.");
}

seedPremiumData();
