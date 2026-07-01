import { createClient } from "@supabase/supabase-js";

// Supabase panelinden (Project Settings -> API) kopyaladığın
// "Project URL" ve "anon public" anahtarını buraya yapıştır.
const SUPABASE_URL = "https://hpanvwaptotrulwrcqah.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYW52d2FwdG90cnVsd3JjcWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzEzMDYsImV4cCI6MjA5ODUwNzMwNn0.1izoPpZEHTDGD3XRbwgDdq3POjpJ4mS6xHeVg1nzCqE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
