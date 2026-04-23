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
    contexts.length ? `World or setting tags: ${contexts.join(", ")}` : "",
    contextNotes ? `World notes: ${contextNotes}` : "",
  ].filter(Boolean);

  const characterDetails = characters.length
    ? characters
        .map((character) => {
          const details = [
            `Name: ${character.name}`,
            character.traits?.length ? `Traits: ${character.traits.join(", ")}` : "",
            character.notes ? `Notes: ${character.notes}` : "",
          ].filter(Boolean);
          return `- ${details.join(" | ")}`;
        })
        .join("\n")
    : "";

  const protagonistBlock = includeReader
    ? [
        `The protagonist is the reader named \"${readerName || "the reader"}\".`,
        readerPronouns ? `Pronouns/reference preference: ${readerPronouns}.` : "",
        readerTraits.length ? `Reader traits: ${readerTraits.join(", ")}.` : "",
        readerNotes ? `Reader notes: ${readerNotes}.` : "",
        "Write in first person only using I / me / my.",
        "Never switch to second person narration.",
      ]
        .filter(Boolean)
        .join("\n")
    : [
        protagonistDescription ? `Primary protagonist: ${protagonistDescription}.` : "Create a compelling protagonist that fits the story.",
        "Write in close third-person narration.",
      ]
        .filter(Boolean)
        .join("\n");

  const openingInstruction = STORY_START_LABELS[storyStart] ?? "Begin with a strong, immediate hook.";
  const endingInstruction = endingCustom || ENDING_LABELS[ending] || "Deliver a coherent and emotionally resonant ending.";

  const systemPrompt = [
    "You are an expert fiction writer generating polished immersive stories.",
    "Return the answer as normal story text in Markdown.",
    "The first line must be a single Markdown H1 title.",
    "After the title, write only the story body.",
    `Write only in ${language}.`,
    "Keep names, world details, and character consistency strict.",
    "Do not use placeholders, meta commentary, or explanations.",
    "Avoid clichés, avoid generic summaries, and keep dialogue natural.",
  ].join("\n");

  const userPrompt = [
    `Target length: about ${wordTarget} words.`,
    genres.length ? `Genres: ${genres.join(", ")}.` : "",
    storyIdea ? `Story idea: ${storyIdea}.` : "",
    worldDetails.length ? worldDetails.join("\n") : "",
    protagonistBlock,
    characterDetails ? `Supporting characters:\n${characterDetails}` : "",
    tones.length ? `Tone: ${tones.join(", ")}.` : "",
    toneNotes ? `Tone notes: ${toneNotes}.` : "",
    `Opening direction: ${openingInstruction}`,
    `Ending direction: ${endingInstruction}`,
    "Make the story emotionally coherent from beginning to end.",
  ]
    .filter(Boolean)
    .join("\n\n");

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
