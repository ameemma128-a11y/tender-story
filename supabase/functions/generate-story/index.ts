import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

type CharacterInput = {
  name?: string;
  traits?: string[];
  notes?: string | null;
};

type GenerateStoryPayload = {
  genres?: string[];
  storyIdea?: string | null;
  contexts?: string[];
  contextNotes?: string | null;
  characters?: CharacterInput[];
  includeReader?: boolean;
  readerName?: string | null;
  readerPronouns?: string | null;
  readerTraits?: string[];
  readerNotes?: string | null;
  protagonistDescription?: string | null;
  storyStart?: string | null;
  tones?: string[];
  toneNotes?: string | null;
  ending?: string | null;
  endingCustom?: string | null;
  length?: string | null;
  language?: string | null;
};

const STORY_START_LABELS: Record<string, string> = {
  action: "Open in the middle of a vivid scene.",
  encounter: "Begin with an unexpected meeting.",
  conflict: "Begin with tension or direct opposition.",
  slow: "Begin with a slow atmospheric setup.",
};

const ENDING_LABELS: Record<string, string> = {
  happy: "Resolve with a satisfying, emotionally earned happy ending.",
  tragic: "Resolve with a tragic ending shaped by sacrifice, loss, or separation.",
  open: "Resolve with an open ending that still feels intentional.",
  cliffhanger: "End on a strong cliffhanger that creates anticipation.",
};

function sanitizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeText(item))
    .filter(Boolean);
}

function sanitizeCharacters(value: unknown): CharacterInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      name: sanitizeText(item?.name),
      traits: sanitizeStringArray(item?.traits),
      notes: sanitizeText(item?.notes) || null,
    }))
    .filter((item) => item.name);
}

function getWordTarget(length: string): number {
  if (length === "short") return 500;
  if (length === "chapter") return 1500;
  return 3000;
}

function buildCharacterMemory(characters: CharacterInput[]): string {
  if (!characters.length) return "";
  return characters
    .map((c, i) => {
      const lines = [
        `${i + 1}. ${c.name}`,
        c.traits?.length ? `   • Personality (locked): ${c.traits.join(", ")}` : "",
        c.notes ? `   • Memory anchor: ${c.notes}` : "",
        `   • Voice rule: dialogue, choices and reactions MUST stay consistent with the personality above for the entire story.`,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n");
}

function buildPrompts(payload: GenerateStoryPayload) {
  const genres = sanitizeStringArray(payload.genres);
  const contexts = sanitizeStringArray(payload.contexts);
  const characters = sanitizeCharacters(payload.characters);
  const readerTraits = sanitizeStringArray(payload.readerTraits);
  const tones = sanitizeStringArray(payload.tones);

  const includeReader = Boolean(payload.includeReader);
  const readerName = sanitizeText(payload.readerName);
  const readerPronouns = sanitizeText(payload.readerPronouns);
  const readerNotes = sanitizeText(payload.readerNotes);
  const protagonistDescription = sanitizeText(payload.protagonistDescription);
  const storyIdea = sanitizeText(payload.storyIdea);
  const contextNotes = sanitizeText(payload.contextNotes);
  const storyStart = sanitizeText(payload.storyStart);
  const toneNotes = sanitizeText(payload.toneNotes);
  const ending = sanitizeText(payload.ending);
  const endingCustom = sanitizeText(payload.endingCustom);
  const length = sanitizeText(payload.length) || "chapter";
  const language = sanitizeText(payload.language) || "English";

  const wordTarget = getWordTarget(length);

  const worldDetails = [
    contexts.length ? `World tags: ${contexts.join(", ")}` : "",
    contextNotes ? `World notes: ${contextNotes}` : "",
  ].filter(Boolean);

  const characterMemory = buildCharacterMemory(characters);

  // ── POV block ──────────────────────────────────────────────────────────────
  const povBlock = includeReader
    ? [
        `POV MODE: FIRST_PERSON_READER`,
        `The protagonist IS the reader. Their name is "${readerName || "the reader"}".`,
        readerPronouns ? `Reader pronouns / form of address: ${readerPronouns}.` : "",
        readerTraits.length ? `Reader inner traits (locked): ${readerTraits.join(", ")}.` : "",
        readerNotes ? `Reader background memory: ${readerNotes}.` : "",
        `HARD POV RULES (never break, not even in dialogue tags):`,
        `- Narrate ONLY in first person: "I", "me", "my", "mine".`,
        `- NEVER use second person ("you", "your") to describe the protagonist.`,
        `- NEVER describe the protagonist from the outside as if they were another character.`,
        `- Inner monologue is allowed and encouraged: thoughts, sensations, heartbeat, breath, micro-emotions.`,
        `- Other characters address the protagonist by their name or pronouns above — never "the reader".`,
        `- The narrator does NOT know things the protagonist cannot perceive in the moment.`,
      ]
        .filter(Boolean)
        .join("\n")
    : [
        `POV MODE: CLOSE_THIRD_PERSON`,
        protagonistDescription
          ? `Primary protagonist: ${protagonistDescription}.`
          : `Create a compelling protagonist that fits the brief.`,
        `HARD POV RULES:`,
        `- Stay in close third person from the protagonist's perspective for the entire story.`,
        `- Do NOT switch perspective mid-scene. Use scene breaks if perspective must shift.`,
        `- No omniscient asides. Only what the POV character can perceive, feel, or reasonably infer.`,
      ]
        .filter(Boolean)
        .join("\n");

  // ── Tone block ─────────────────────────────────────────────────────────────
  const toneBlock = [
    tones.length ? `Tone palette (locked): ${tones.join(", ")}.` : "",
    toneNotes ? `Mood notes: ${toneNotes}.` : "",
    `TONE RULES:`,
    `- The emotional register stays inside this palette from first to last paragraph.`,
    `- If multiple tones are listed, blend them — do not alternate randomly.`,
    `- Sentence rhythm must reflect the tone (short/cutting for tension, longer/sensory for tender).`,
  ]
    .filter(Boolean)
    .join("\n");

  // ── Genre blending block ───────────────────────────────────────────────────
  const genreBlock = genres.length
    ? [
        `Genres to blend: ${genres.join(" + ")}.`,
        `GENRE RULES:`,
        `- Treat the list as ONE coherent fusion, not a checklist.`,
        `- Each scene must visibly carry traits of every listed genre — woven together, not stacked.`,
        `- Respect the conventions of the dominant genre (first listed) while letting others color it.`,
      ].join("\n")
    : "";

  const openingInstruction = STORY_START_LABELS[storyStart] ?? "Begin with a strong, immediate hook.";
  const endingInstruction = endingCustom || ENDING_LABELS[ending] || "Deliver a coherent and emotionally resonant ending.";

  // ── SYSTEM PROMPT ─────────────────────────────────────────────────────────
  const systemPrompt = [
    `You are an award-winning fiction writer crafting deeply immersive prose.`,
    ``,
    `OUTPUT FORMAT (strict):`,
    `- The very first line MUST be a single Markdown H1 title: "# Title".`,
    `- After the title, output ONLY the story body in Markdown paragraphs.`,
    `- No preface, no notes, no system text, no meta commentary, no explanations of choices.`,
    ``,
    `LANGUAGE:`,
    `- Write the entire story strictly in ${language}, including the title, dialogue, inner thoughts and sensory details.`,
    `- Do not slip into another language for stylistic effect unless the user idea explicitly asks for it.`,
    ``,
    `IMMERSION CORE:`,
    `- Use the five senses in every scene (sight, sound, touch, smell, taste where relevant).`,
    `- Anchor every emotion in a body signal (breath, pulse, throat, hands, posture).`,
    `- Show, don't tell. Replace emotion labels with embodied behavior.`,
    `- Keep paragraphs tight and rhythmic; vary sentence length intentionally.`,
    ``,
    `CHARACTER MEMORY (treat as canon, never contradict):`,
    `- Names are locked. Spell each name exactly the same way every time.`,
    `- Personality traits are locked. A "cold & distant" character does not suddenly become warm without an on-page reason.`,
    `- Memory anchors (notes) MUST appear or be honored at least once in the story when relevant.`,
    `- Track who knows what: a character cannot react to information they were never given on page.`,
    ``,
    `NARRATIVE CONTINUITY:`,
    `- Maintain a consistent timeline. Time of day, weather, location and clothing remain stable until you explicitly change them.`,
    `- Reuse and pay off small details introduced earlier (objects, gestures, sentences) — at least one callback before the ending.`,
    `- Scene transitions must be deliberate: end the previous beat with an emotional or sensory hook, then re-anchor place + time + POV emotion in the first 2 lines of the new scene.`,
    `- No retconning. If a fact was stated, it stays true.`,
    ``,
    `DIALOGUE REALISM:`,
    `- Each character speaks with a distinct voice that reflects their locked traits.`,
    `- Use contractions, interruptions, silences, subtext. Avoid speeches and exposition dumps.`,
    `- Beats > tags: prefer action/sensation beats around lines instead of "he said angrily".`,
    `- No on-the-nose emotion declarations. Imply, don't announce.`,
    ``,
    `ANTI-REPETITION:`,
    `- Do not reuse the same descriptive phrase or metaphor twice.`,
    `- Vary sensory entry points across paragraphs (don't start three paragraphs in a row with sight).`,
    `- Avoid filler phrases ("suddenly", "somehow", "couldn't help but").`,
    ``,
    `BANNED:`,
    `- Lists, bullet points, headings other than the H1 title, footnotes, author notes.`,
    `- Breaking the POV rules under any circumstance.`,
    `- Renaming, removing, or merging characters.`,
  ].join("\n");

  // ── USER PROMPT (story brief) ─────────────────────────────────────────────
  const userPrompt = [
    `STORY BRIEF`,
    `Target length: about ${wordTarget} words.`,
    ``,
    genreBlock,
    storyIdea ? `\nUser idea: ${storyIdea}` : "",
    worldDetails.length ? `\nWORLD\n${worldDetails.join("\n")}` : "",
    `\nPOV & PROTAGONIST\n${povBlock}`,
    characterMemory ? `\nCHARACTER MEMORY (canon)\n${characterMemory}` : "",
    `\nTONE\n${toneBlock}`,
    `\nSTRUCTURE`,
    `- Opening: ${openingInstruction}`,
    `- Middle: escalate stakes through specific, sensory beats; honor at least one character memory anchor.`,
    `- Ending: ${endingInstruction}`,
    ``,
    `FINAL CHECK (do silently before writing):`,
    `1. POV mode is respected from the first sentence to the last.`,
    `2. Every named character behaves consistently with their locked traits.`,
    `3. The tone palette is unbroken.`,
    `4. The selected genres are blended in every major scene.`,
    `5. The output is written entirely in ${language}.`,
    `Then write the story.`,
  ]
    .filter(Boolean)
    .join("\n");

  return { systemPrompt, userPrompt };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase server environment is not configured");
    }

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const payload = (await req.json()) as GenerateStoryPayload;
    const { systemPrompt, userPrompt } = buildPrompts(payload ?? {});

    const gatewayResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!gatewayResponse.ok || !gatewayResponse.body) {
      const errorText = await gatewayResponse.text();

      if (gatewayResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de demandes en ce moment. Réessaie dans un instant." }), {
          status: 429,
          headers: jsonHeaders,
        });
      }

      if (gatewayResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Le quota IA du workspace est épuisé. Ajoute du crédit avant de réessayer." }), {
          status: 402,
          headers: jsonHeaders,
        });
      }

      console.error("generate-story gateway error:", gatewayResponse.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    return new Response(gatewayResponse.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("generate-story error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: jsonHeaders,
      },
    );
  }
});
