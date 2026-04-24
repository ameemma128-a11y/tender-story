const functionName = "generate-story";

const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;

console.log("Calling Edge Function:", functionUrl);

const resp = await fetch(functionUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
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
  }),
});
