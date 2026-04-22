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
      genres, storyIdea, contexts, contextNotes,
      characters,
      includeReader, readerName, readerPronouns, readerTraits, readerNotes,
      protagonistDescription,
      storyStart, tones, toneNotes,
      ending, endingCustom,
      length, language,
      // legacy params
      characterName, characterTraits, characterNotes,
      template,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const wordTarget = length === "short" ? 500 : length === "chapter" ? 1500 : 3000;
    const lang = (language && String(language).trim()) || "English";

    const genreList: string[] = Array.isArray(genres) && genres.length
      ? genres
      : (template ? [String(template).replace(/-/g, " ")] : []);
    const ctxList: string[] = Array.isArray(contexts) ? contexts : [];

    const vibe = genreList.length
      ? `a story that blends these genres: ${genreList.join(", ")}`
      : "an immersive story";

    const ideaBlock = storyIdea ? `Reader's own concept (must shape the story): ${storyIdea}.` : "";
    const worldBlock = ctxList.length || contextNotes
      ? `Setting${ctxList.length ? `: ${ctxList.join(", ")}` : ""}${contextNotes ? `. World details: ${contextNotes}` : ""}.`
      : "";

    // Handle multiple characters (new format) or single character (legacy)
    let charBlock = "";
    if (Array.isArray(characters) && characters.length > 0) {
      const charParts = characters.map((c: any, i: number) => {
        const label = i === 0 ? "Main character" : `Character ${i + 1}`;
        return `${label}: "${c.name}"${c.traits?.length ? `. Personality: ${c.traits.join(", ")}` : ""}${c.notes ? `. Details: ${c.notes}` : ""}`;
      });
      charBlock = charParts.join(". ") + ".";
    } else if (characterName) {
      charBlock = `Main character: "${characterName}"${characterTraits?.length ? `. Personality: ${characterTraits.join(", ")}` : ""}${characterNotes ? `. Extra: ${characterNotes}` : ""}.`;
    }

    // POV block — CRITICAL: first person when user includes themselves
    let povBlock = "";
    if (includeReader && readerName) {
      const pronounInfo = readerPronouns && readerPronouns !== "none"
        ? ` Use pronouns: ${readerPronouns === "she" ? "she/her" : readerPronouns === "he" ? "he/him" : "they/them"} for the protagonist.`
        : "";
      const traitInfo = readerTraits?.length ? `. Protagonist personality: ${readerTraits.join(", ")}` : "";
      const noteInfo = readerNotes ? `. Protagonist self-description: ${readerNotes}` : "";
      povBlock = `CRITICAL POV RULE: The protagonist is "${readerName}" — this is the reader themselves. Write ENTIRELY in FIRST PERSON ("I", "me", "my", "mine"). Never use "you" or "your" to refer to the protagonist. The reader must feel they ARE living this story. Example: "le crissement des pages sous mes doigts" NOT "sous vos doigts".${pronounInfo}${traitInfo}${noteInfo}.`;
    } else if (protagonistDescription) {
      povBlock = `Protagonist: ${protagonistDescription}. Write in third person, close and intimate.`;
    } else {
      povBlock = `Write in close third person, intimate and immersive.`;
    }

    // Opening style
    const openingMap: Record<string, string> = {
      action: "Open IN MEDIAS RES — start in the middle of an action or intense moment, no preamble.",
      encounter: "Open with a CHANCE ENCOUNTER — the first meeting between the characters, unexpected and memorable.",
      conflict: "Open with CONFLICT or tension — the characters start in opposition, disagreement or a charged moment.",
      slow: "Open with a SLOW, ATMOSPHERIC INTRODUCTION — build the world and character before the main encounter.",
    };
    const openingBlock = storyStart && openingMap[storyStart] ? openingMap[storyStart] : "";

    // Ending style
    let endingBlock = "";
    if (endingCustom) {
      endingBlock = `Ending direction (user-defined): "${endingCustom}". Honor this ending faithfully.`;
    } else if (ending) {
      const endingMap: Record<string, string> = {
        happy: "End on a HAPPY, HOPEFUL note — the characters find each other or reach resolution.",
        tragic: "End TRAGICALLY — separation, sacrifice, or loss. Make it emotionally resonant.",
        open: "End with an OPEN, AMBIGUOUS moment — leave the reader wondering.",
        cliffhanger: "End on a CLIFFHANGER — a suspended, unresolved moment that leaves the reader wanting more.",
      };
      endingBlock = endingMap[ending] || "";
    }

    const toneBlock = `Tone: ${tones?.join(", ") || "sweet romance"}${toneNotes ? `. Exact mood requested: ${toneNotes}` : ""}.`;

    const system = `You are Tender, a gifted literary storyteller crafting deeply immersive, emotionally rich personalized stories.
Style: cinematic, sensorial, present tense where possible, evocative imagery, intimate inner thoughts, vivid dialogue.
Always respect the user's chosen tone and blend ALL selected genres and world elements coherently.
Avoid clichés; aim for elegant, literary prose. Begin with a captivating hook. End with a resonant beat.
CRITICAL LANGUAGE RULE: Write the ENTIRE story — title and body — in ${lang}. Do not mix languages. Use natural, native-quality prose in ${lang}.`;

    const user = `Write an immersive story (~${wordTarget} words) entirely in ${lang}.
Genre blend: ${vibe}.
${ideaBlock}
${worldBlock}
${charBlock}
${toneBlock}
${povBlock}
${openingBlock}
${endingBlock}
Start with a short evocative title in ${lang} on the first line formatted as: # Title
Then a blank line, then the story — all in ${lang}.`;

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
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Too many requests, try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "Generation error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
