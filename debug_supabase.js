const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://qyvpuphjzgmlplprupdl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dnB1cGhqemdtbHBscHJ1cGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODAyNDgsImV4cCI6MjA4OTA1NjI0OH0.nu4PxlZkkozMBGNTWc5Deco0jAT08ngu-zJnl18P2lU");

async function check() {
  console.log("Checking erp_profiles...");
  const { data, error } = await supabase.from("erp_profiles").select("*").limit(1);
  if (error) {
    console.error("erp_profiles error:", error);
  } else {
    console.log("erp_profiles data:", data);
  }

  console.log("\nChecking erp_companies...");
  const { data: cData, error: cError } = await supabase.from("erp_companies").select("*").limit(1);
  if (cError) {
    console.error("erp_companies error:", cError);
  } else {
    console.log("erp_companies data:", cData);
  }
}

check();
