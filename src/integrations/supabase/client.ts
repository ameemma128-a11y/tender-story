import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// 🔑 SAFE READ (évite undefined silencieux)
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? "";

// 🔍 Debug utile
console.log("ENV CHECK:", {
  url: SUPABASE_URL,
  keyExists: !!SUPABASE_ANON_KEY,
});

// 🚨 Blocage clair si Vercel/Vite n’injecte rien
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "ENV ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in build"
  );
}

// 📡 Supabase client stable
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
