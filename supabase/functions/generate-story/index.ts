import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

serve(async (req) => {
  try {
    // OPTIONS (CORS)
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // AUTH HEADER
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: jsonHeaders }
      );
    }

    // ENV
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase env" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // TOKEN
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: jsonHeaders }
      );
    }

    // BODY
    const body = await req.json();

    const systemPrompt =
      "You are a professional storytelling AI. Write immersive novels.";
    const userPrompt = JSON.stringify(body);

    // GEMINI CALL
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt + "\n\n" + userPrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text();
      console.error("Gemini error:", err);

      return new Response(
        JSON.stringify({ error: "Gemini request failed" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const data = await geminiResponse.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(
      JSON.stringify({ story: text }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err) {
    console.error("Edge Function crash:", err);

    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
