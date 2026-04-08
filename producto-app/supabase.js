import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zqxbnadmrppfgehlxtrs.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeGJuYWRtcnBwZmdlaGx4dHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDAxMDEsImV4cCI6MjA3NzUxNjEwMX0.kx_tJYYIiIeXkTLPQNBvWVyMPE079vB_ibDgQyyOBSQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
