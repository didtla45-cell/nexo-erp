const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://qyvpuphjzgmlplprupdl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dnB1cGhqemdtbHBscHJ1cGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODAyNDgsImV4cCI6MjA4OTA1NjI0OH0.nu4PxlZkkozMBGNTWc5Deco0jAT08ngu-zJnl18P2lU");
supabase.from("erp_requests").select("*").then(({data, error}) => console.log(JSON.stringify(data || error)));
