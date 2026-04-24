const handleGenerate = async () => {
  setGenerating(true);

  try {
    // 1. Récupération session utilisateur
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Not authenticated");
    }

    // 2. URL Edge Function (fixée en dur pour éviter erreurs VITE)
    const functionUrl =
      "https://akopgbmaipzsblxrtlur.supabase.co/functions/v1/generate-story";

    // 3. Appel backend Supabase
    const resp = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // clé publique Supabase (OK côté front)
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,

        // token utilisateur (OBLIGATOIRE)
        Authorization: `Bearer ${session.access_token}`,
      },

      // 4. données envoyées à l’IA
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

    // 5. gestion erreur réseau/API
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(errText || "Generation failed");
    }

    const data = await resp.json();

    // 6. résultat IA
    const story = data.story;

    if (!story) {
      throw new Error("Empty story returned");
    }

    // 7. extraction titre simple
    const lines = story.split("\n");
    const title = lines[0]?.replace("#", "").trim() || "Untitled Story";
    const body = lines.slice(1).join("\n").trim();

    // 8. sauvegarde Supabase DB
    const { error } = await supabase.from("stories").insert({
      user_id: session.user.id,
      title,
      content: body,
      template: genres?.[0] || "custom",
      character_name: characters?.[0]?.name || "Unknown",
      character_traits: characters?.[0]?.traits || [],
      character_notes: contextNotes || null,
      reader_name: includeReader ? readerName : null,
      reader_traits: includeReader ? readerTraits : [],
      reader_notes: includeReader ? readerNotes : null,
      tones,
      length,
    });

    if (error) throw error;

    // 9. fin loading
    setGenerating(false);

    // (optionnel) refresh UI ou redirect
    // navigate("/library");

  } catch (e: any) {
    console.error(e);
    toast.error(e.message || "Error generating story");
    setGenerating(false);
  }
};
