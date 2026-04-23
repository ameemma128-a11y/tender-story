import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// 🔑 Variables Vite (doivent exister dans Vercel)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔍 Debug (TEMPORAIRE → à enlever après fix)
console.log("SUPABASE_URL =", SUPABASE_URL);
console.log("SUPABASE_ANON_KEY =", SUPABASE_ANON_KEY);

// 🚨 Sécurité : éviter crash silencieux
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel."
  );
}

// 📡 Client Supabase
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
