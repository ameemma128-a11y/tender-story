// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      genres,
      storyIdea,
      contexts,
      contextNotes,
      characters,
      includeReader,
      readerName,
      readerPronouns,
      readerTraits,
      readerNotes,
      protagonistDescription,
      storyStart,
      tones,
      toneNotes,
      ending,
      endingCustom,
      length,
      language,
      characterName,
      characterTraits,
      characterNotes,
      template,
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const wordTarget =
      length === "short" ? 500 : length === "chapter" ? 1500 : 3000;

    const lang = (language && String(language).trim()) || "English";

    const genreList: string[] =
      Array.isArray(genres) && genres.length
        ? genres
        : template
        ? [String(template).replace(/-/g, " ")]
        : [];

    const ctxList: string[] = Array.isArray(contexts) ? contexts : [];

    const vibe = genreList.length
      ? `Genres: ${genreList.join(", ")}`
      : "General immersive story";

    const ideaBlock = storyIdea
      ? `User idea: ${storyIdea}`
      : "";

    const worldBlock =
      ctxList.length || contextNotes
        ? `World: ${ctxList.join(", ")} ${contextNotes || ""}`
        : "";

    let charBlock = "";

    if (Array.isArray(characters) && characters.length > 0) {
      charBlock =
        "Characters:\n" +
        characters
          .map((c) => {
            return `- "${c.name}" traits: ${
              c.traits?.join(", ") || "none"
            } notes: ${c.notes || "none"}`;
          })
          .join("\n");
    } else if (characterName) {
      charBlock = `Character: "${characterName}"`;
    }

    let povBlock = "";

    if (includeReader && readerName) {
      povBlock = `
CRITICAL RULE:
Write in FIRST PERSON ONLY.
The protagonist is the reader: "${readerName}".
NEVER use "you" or "your".
Use "I / me / my".

Maintain full immersion and sensory narration.
`;
    } else {
      povBlock = `
Write in THIRD PERSON, close immersive narration.
`;
    }

    const toneBlock = `Tone: ${tones?.join(", ") || "neutral"} ${toneNotes || ""}`;

    const systemPrompt = `
You are an expert literary fiction writer.

STYLE:
- immersive
- cinematic
- emotional
- natural dialogue
- no clichés

CRITICAL RULES:
- DO NOT rename characters
- DO NOT remove characters
- STRICT consistency
- Output ONLY in ${lang}
`;

    const userPrompt = `
Write a story of ~${wordTarget} words.

${vibe}
${ideaBlock}
${worldBlock}
${charBlock}
${toneBlock}
${povBlock}

Start with:
# Title

Then the story.
`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    const data = await resp.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(
      JSON.stringify({
        story: {
          id: crypto.randomUUID(),
          content: text,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
