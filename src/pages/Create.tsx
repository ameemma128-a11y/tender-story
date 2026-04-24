import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";

export default function Create() {
  const navigate = useNavigate();

  const [generating, setGenerating] = useState(false);

  // ⚠️ adapte si tu as déjà tes states ailleurs
  const [genres] = useState<string[]>([]);
  const [storyIdea] = useState("");
  const [contexts] = useState<string[]>([]);
  const [contextNotes] = useState("");
  const [characters] = useState<any[]>([]);
  const [includeReader] = useState(false);
  const [readerName] = useState("");
  const [readerPronouns] = useState("");
  const [readerTraits] = useState<string[]>([]);
  const [readerNotes] = useState("");
  const [protagonistDescription] = useState("");
  const [storyStart] = useState("");
  const [tones] = useState<string[]>([]);
  const [toneNotes] = useState("");
  const [ending] = useState("");
  const [endingCustom] = useState("");
  const [length] = useState("chapter");
  const [language] = useState("en");

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
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
        const err = await resp.text();
        throw new Error(err || "Generation failed");
      }

      const text = await resp.text();

      if (!text) {
        throw new Error("Empty response");
      }

      const lines = text.split("\n");
      const title =
        lines[0]?.replace("#", "").trim() || "Untitled Story";
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

      navigate(`/story/${data.id}`);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error generating story");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Story</h1>

      <button onClick={handleGenerate} disabled={generating}>
        {generating ? "Generating..." : "Generate Story"}
      </button>
    </div>
  );
}
