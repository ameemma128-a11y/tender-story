// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      // new shape
      genres, storyIdea, contexts, contextNotes,
      // legacy shape (still tolerated)
      template,
      // common
      characterName, characterTraits, characterNotes,
      readerName, readerTraits, readerNotes, tones, length,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const wordTarget = length === "short" ? 500 : length === "chapter" ? 1500 : 3000;

    const genreList: string[] = Array.isArray(genres) && genres.length
      ? genres
      : (template ? [String(template).replace(/-/g, " ")] : []);
    const ctxList: string[] = Array.isArray(contexts) ? contexts : [];

    const vibe = genreList.length
      ? `a story that blends these genres: ${genreList.join(", ")}`
      : "an immersive romantic story";

    const ideaBlock = storyIdea ? `Reader's own idea (must shape the story): ${storyIdea}.` : "";
    const worldBlock = ctxList.length || contextNotes
      ? `Setting${ctxList.length ? `: ${ctxList.join(", ")}` : ""}${contextNotes ? `. World details: ${contextNotes}` : ""}.`
      : "";

    const charBlock = `Love interest: "${characterName}"${
      characterTraits?.length ? `. Personality: ${characterTraits.join(", ")}` : ""
    }${characterNotes ? `. Extra: ${characterNotes}` : ""}.`;

    const reader = readerName
      ? `The reader inserts themselves as "${readerName}"${
          readerTraits?.length ? `, with personality: ${readerTraits.join(", ")}` : ""
        }${readerNotes ? `. Self-description: ${readerNotes}` : ""}. Write in second person ("you").`
      : `Write in second person ("you"), the reader as the protagonist.`;

    const system = `You are Tender, a gifted storyteller crafting deeply immersive, emotionally rich personalized stories.
Style: cinematic, sensorial, present tense, evocative imagery, intimate inner thoughts, vivid dialogue.
Always respect the user's chosen tone and blend ALL selected genres and world elements coherently.
Avoid cringe; aim for elegant, literary prose. Begin with a captivating hook. End with a resonant beat.`;

    const user = `Write an immersive story (~${wordTarget} words).
Genre blend: ${vibe}.
${ideaBlock}
${worldBlock}
${charBlock}
Tone: ${tones?.join(", ") || "sweet romance"}.
${reader}
Start with a short evocative title on the first line formatted as: # Title
Then a blank line, then the story.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        stream: true,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "Generation error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
