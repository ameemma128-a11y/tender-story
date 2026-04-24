const handleGenerate = async () => {
  setGenerating(true);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Not authenticated");
    }

    const functionUrl =
      "https://akopgbmaipzsblxrtlur.supabase.co/functions/v1/generate-story";

    const resp = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
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

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(errorText);
    }

    // ⚠️ IMPORTANT : NE PAS PARSER JSON (ton backend stream)
    const text = await resp.text();

    // fallback simple
    const story = text || "";

    if (!story) {
      throw new Error("Empty story");
    }

    const lines = story.split("\n");
    const title = lines[0]?.replace("#", "").trim() || "Untitled Story";
    const body = lines.slice(1).join("\n").trim();

    const { data, error } = await supabase
      .from("stories")
      .insert({
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
      })
      .select()
      .single();

    if (error) throw error;

    setGenerating(false);

    // navigate(`/story/${data.id}`);

  } catch (e: any) {
    console.error(e);
    toast?.error?.(e.message || "Generation error");
    setGenerating(false);
  }
};
