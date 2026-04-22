import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const ROMANCE_GENRES = [
  "Toxic Love", "Slow Burn", "Enemies to Lovers", "Fake Dating", "Second Chance",
  "Secret Admirer", "Soulmates", "Forbidden Bond", "Arranged Marriage",
  "CEO Romance", "Bodyguard Romance", "Friends to Lovers", "Love Triangle",
  "Unrequited Love", "Obsessive Love",
];

const UNIVERSE_GENRES = [
  "Royal Romance", "Fantasy Academy", "Villain's Revenge", "Historical Court",
  "Supernatural Bond", "Campus Life", "Idol Romance", "Reincarnation",
  "Rivals to Lovers", "Revenge Arc", "Time Travel", "Found Family",
  "War Romance", "Political Intrigue", "Mafia Romance",
];

const CONTEXTS = [
  "Modern day", "Royal court", "Fantasy world", "Magic academy", "Post-apocalyptic",
  "Historical era", "Corporate world", "Small town", "Supernatural realm",
  "Parallel dimension", "Island isolation", "Big city", "Space",
  "Medieval kingdom", "Underground world",
];

const CHARACTER_TRAITS = [
  "Cold & distant", "Warm & protective", "Arrogant & confident", "Gentle & patient",
  "Mysterious & unpredictable", "Playful & teasing", "Possessive & intense",
  "Soft & caring", "Dominant & commanding", "Broken & guarded",
  "Charismatic & charming", "Ruthless & ambitious", "Loyal & devoted",
  "Rebellious & wild", "Quiet & observant",
];

const READER_TRAITS = [
  "Soft & shy", "Bold & fierce", "Sarcastic & witty", "Mysterious & quiet",
  "Warm & empathetic", "Clumsy & endearing", "Confident & ambitious",
  "Dreamy & romantic", "Independent & strong", "Playful & flirty",
  "Serious & focused", "Sweet & gentle", "Cold outside warm inside",
  "Chaotic & unpredictable", "Observant & intelligent", "Passionate & intense",
  "Carefree & spontaneous", "Stubborn & determined",
];

const TONES = [
  "Sweet romance", "Intense & dramatic", "Suggestive", "Angst & emotional",
  "Dark & complex", "Slow burn tension", "Lighthearted & fun", "Bittersweet",
  "Chaotic & unpredictable", "Obsessive & intense", "Hopeful & healing",
  "Melancholic", "Passionate & fiery", "Tender & intimate", "Mysterious & suspenseful",
];

const LENGTHS = [
  { id: "short", label: "Short scene", desc: "500 words" },
  { id: "chapter", label: "One chapter", desc: "1500 words" },
  { id: "multi", label: "Multi-chapter", desc: "3000+ words" },
];

const TOTAL_STEPS = 6;

const Tag = ({
  active, onClick, onDoubleClick, children,
}: {
  active: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    className={cn(
      "px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-soft border select-none",
      active
        ? "bg-primary text-primary-foreground border-primary shadow-ember"
        : "bg-transparent text-foreground/80 border-border hover:border-primary hover:text-primary"
    )}
  >
    {children}
  </button>
);

const Create = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 — genres + free text idea
  const [genres, setGenres] = useState<string[]>([]);
  const [storyIdea, setStoryIdea] = useState("");

  // Step 2 — universe/context
  const [contexts, setContexts] = useState<string[]>([]);
  const [contextNotes, setContextNotes] = useState("");

  // Step 3 — character
  const [characterName, setCharacterName] = useState("");
  const [characterTraits, setCharacterTraits] = useState<string[]>([]);
  const [characterNotes, setCharacterNotes] = useState("");

  // Step 4 — reader
  const [includeReader, setIncludeReader] = useState(false);
  const [readerName, setReaderName] = useState("");
  const [readerTraits, setReaderTraits] = useState<string[]>([]);
  const [readerNotes, setReaderNotes] = useState("");

  // Step 5 — tone
  const [tones, setTones] = useState<string[]>([]);

  // Step 6 — length
  const [length, setLength] = useState("chapter");

  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session) navigate("/auth"); });
  }, [navigate]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const canNext = () => {
    if (step === 1) return genres.length > 0 || storyIdea.trim().length > 0;
    if (step === 2) return true; // optional
    if (step === 3) return characterName.trim().length > 0;
    if (step === 4) return !includeReader || readerName.trim().length > 0;
    if (step === 5) return tones.length > 0;
    return true;
  };

  const goNext = () => {
    if (!canNext() || step >= TOTAL_STEPS) return;
    setStep(s => s + 1);
  };

  // Double-click on a selectable card/tag: select it (if not already) and advance
  const selectAndAdvance = (arr: string[], setArr: (v: string[]) => void, v: string) => {
    if (!arr.includes(v)) setArr([...arr, v]);
    setTimeout(goNext, 0);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth"); return; }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          genres,
          storyIdea: storyIdea.trim() || null,
          contexts,
          contextNotes: contextNotes.trim() || null,
          characterName,
          characterTraits,
          characterNotes: characterNotes.trim() || null,
          readerName: includeReader ? readerName : null,
          readerTraits: includeReader ? readerTraits : [],
          readerNotes: includeReader ? (readerNotes.trim() || null) : null,
          tones,
          length,
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Generation failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) content += c;
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }

      const match = content.match(/^#\s+(.+)/);
      const fallbackTitle = `${genres[0] ?? "Untitled"} with ${characterName}`;
      const title = match ? match[1].trim() : fallbackTitle;
      const body = content.replace(/^#\s+.+\n+/, "");

      // Persist using the existing schema (template = first selected genre, slugified)
      const templateSlug = (genres[0] ?? "custom").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const combinedCharacterNotes = [
        characterNotes.trim(),
        contexts.length ? `Universe: ${contexts.join(", ")}` : "",
        contextNotes.trim() ? `Universe notes: ${contextNotes.trim()}` : "",
        genres.length ? `Genres: ${genres.join(", ")}` : "",
        storyIdea.trim() ? `Idea: ${storyIdea.trim()}` : "",
      ].filter(Boolean).join(" | ") || null;

      const { data: saved, error } = await supabase.from("stories").insert({
        user_id: sess.session.user.id,
        title,
        template: templateSlug,
        character_name: characterName,
        character_traits: characterTraits,
        character_notes: combinedCharacterNotes,
        reader_name: includeReader ? readerName : null,
        reader_traits: includeReader ? readerTraits : [],
        reader_notes: includeReader ? (readerNotes.trim() || null) : null,
        tones, length, content: body,
      }).select().single();
      if (error) throw error;
      navigate(`/story/${saved.id}`);
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
      setGenerating(false);
    }
  };

  const stepLabels = ["Genre", "World", "Character", "You", "Tone", "Length"];

  return (
    <div className="min-h-screen bg-gradient-noir relative grain">
      <Header />
      <div className="absolute inset-0 bg-gradient-ember opacity-30 pointer-events-none" />

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-center justify-between mb-16 gap-2">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            return (
              <div key={n} className="flex-1 flex flex-col items-start gap-2 min-w-0">
                <div className={cn("h-px w-full transition-soft", n <= step ? "bg-primary" : "bg-border")} />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn("font-display text-xs", n <= step ? "text-primary" : "text-muted-foreground")}>
                    0{n}
                  </span>
                  <span className={cn("text-[9px] uppercase tracking-[0.2em] truncate", n === step ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div key={step} className="animate-fade-up">
          {/* STEP 1 — Genre */}
          {step === 1 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Step One</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Pick your genres.</h2>
              <p className="text-muted-foreground mb-8 font-light">Select any combination — or describe your own idea.</p>

              <div className="mb-10">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
                  Have your own idea? <span className="opacity-60 normal-case tracking-normal">(optional)</span>
                </Label>
                <Textarea
                  value={storyIdea}
                  onChange={e => setStoryIdea(e.target.value)}
                  placeholder="Describe your story concept here…"
                  rows={3}
                  className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none"
                />
              </div>

              <Tabs defaultValue="romance" className="w-full">
                <TabsList className="rounded-none bg-transparent border border-border p-0 h-auto w-full grid grid-cols-2">
                  <TabsTrigger
                    value="romance"
                    className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-[11px] uppercase tracking-[0.3em] py-3"
                  >
                    Romance
                  </TabsTrigger>
                  <TabsTrigger
                    value="universe"
                    className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-[11px] uppercase tracking-[0.3em] py-3"
                  >
                    Universe & Adventure
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="romance" className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {ROMANCE_GENRES.map(g => (
                      <Tag
                        key={g}
                        active={genres.includes(g)}
                        onClick={() => toggle(genres, setGenres, g)}
                        onDoubleClick={() => selectAndAdvance(genres, setGenres, g)}
                      >
                        {g}
                      </Tag>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="universe" className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {UNIVERSE_GENRES.map(g => (
                      <Tag
                        key={g}
                        active={genres.includes(g)}
                        onClick={() => toggle(genres, setGenres, g)}
                        onDoubleClick={() => selectAndAdvance(genres, setGenres, g)}
                      >
                        {g}
                      </Tag>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {genres.length > 0 && (
                <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {genres.length} selected
                </p>
              )}
            </>
          )}

          {/* STEP 2 — Universe / Context */}
          {step === 2 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Step Two</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Set the universe.</h2>
              <p className="text-muted-foreground mb-10 font-light">Where does this take place? Pick any.</p>

              <div className="flex flex-wrap gap-2 mb-10">
                {CONTEXTS.map(c => (
                  <Tag
                    key={c}
                    active={contexts.includes(c)}
                    onClick={() => toggle(contexts, setContexts, c)}
                    onDoubleClick={() => selectAndAdvance(contexts, setContexts, c)}
                  >
                    {c}
                  </Tag>
                ))}
              </div>

              <div>
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
                  Describe the world in your own words <span className="opacity-60 normal-case tracking-normal">(optional)</span>
                </Label>
                <Textarea
                  value={contextNotes}
                  onChange={e => setContextNotes(e.target.value)}
                  placeholder="A coastal town in winter, a neon-lit megacity, a dying empire…"
                  rows={3}
                  className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none"
                />
              </div>
            </>
          )}

          {/* STEP 3 — Character */}
          {step === 3 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Step Three</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Your main character.</h2>
              <p className="text-muted-foreground mb-10 font-light">Who's at the heart of this story?</p>
              <Input
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                placeholder="Their name…"
                className="rounded-none h-16 text-2xl font-serif px-0 bg-transparent border-0 border-b-2 border-border focus-visible:ring-0 focus-visible:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-4 italic font-light">Real, fictional, half-remembered. No one will know.</p>

              {characterName.trim() && (
                <div className="mt-10 animate-fade-up space-y-6">
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
                      Their personality <span className="opacity-60 normal-case tracking-normal">— pick any</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {CHARACTER_TRAITS.map(t => (
                        <Tag
                          key={t}
                          active={characterTraits.includes(t)}
                          onClick={() => toggle(characterTraits, setCharacterTraits, t)}
                          onDoubleClick={() => selectAndAdvance(characterTraits, setCharacterTraits, t)}
                        >
                          {t}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
                      Anything else about them? <span className="opacity-60 normal-case tracking-normal">(optional)</span>
                    </Label>
                    <Textarea
                      value={characterNotes}
                      onChange={e => setCharacterNotes(e.target.value)}
                      placeholder="A scar above their brow, a habit of humming when nervous…"
                      rows={3}
                      className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 4 — Reader */}
          {step === 4 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Step Four</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Make it yours.</h2>
              <p className="text-muted-foreground mb-10 font-light">Add yourself to the story, or stay behind the scenes.</p>
              <div className="flex items-center justify-between p-6 border border-border mb-6">
                <Label htmlFor="reader" className="text-base font-display">Put me in the story</Label>
                <Switch id="reader" checked={includeReader} onCheckedChange={setIncludeReader} />
              </div>
              {includeReader && (
                <div className="animate-fade-up space-y-6">
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Your name</Label>
                    <Input value={readerName} onChange={e => setReaderName(e.target.value)}
                      className="rounded-none h-12 mt-2 bg-transparent border-0 border-b border-border focus-visible:ring-0 focus-visible:border-primary text-lg font-serif px-0" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
                      Your nature <span className="opacity-60 normal-case tracking-normal">— pick any</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {READER_TRAITS.map(t => (
                        <Tag
                          key={t}
                          active={readerTraits.includes(t)}
                          onClick={() => toggle(readerTraits, setReaderTraits, t)}
                          onDoubleClick={() => selectAndAdvance(readerTraits, setReaderTraits, t)}
                        >
                          {t}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
                      Describe yourself in your own words <span className="opacity-60 normal-case tracking-normal">(optional)</span>
                    </Label>
                    <Textarea
                      value={readerNotes}
                      onChange={e => setReaderNotes(e.target.value)}
                      placeholder="The little things that make you, you…"
                      rows={3}
                      className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 5 — Tone */}
          {step === 5 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Step Five</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Set the tone.</h2>
              <p className="text-muted-foreground mb-10 font-light">Pick the emotional flavor of your story.</p>
              <div className="flex flex-wrap gap-3">
                {TONES.map(t => (
                  <Tag
                    key={t}
                    active={tones.includes(t)}
                    onClick={() => toggle(tones, setTones, t)}
                    onDoubleClick={() => selectAndAdvance(tones, setTones, t)}
                  >
                    {t}
                  </Tag>
                ))}
              </div>
            </>
          )}

          {/* STEP 6 — Length */}
          {step === 6 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Step Six</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Choose the length.</h2>
              <p className="text-muted-foreground mb-10 font-light">How long do you want your story to be?</p>
              <div className="space-y-px bg-border">
                {LENGTHS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLength(l.id)}
                    onDoubleClick={() => { setLength(l.id); setTimeout(handleGenerate, 0); }}
                    disabled={generating}
                    className={cn(
                      "w-full p-6 text-left flex justify-between items-center transition-soft",
                      length === l.id
                        ? "bg-primary text-primary-foreground shadow-ember"
                        : "bg-background hover:bg-card hover:text-primary"
                    )}>
                    <span className="font-display text-2xl">{l.label}</span>
                    <span className={cn("text-[10px] uppercase tracking-[0.3em]", length === l.id ? "opacity-90" : "text-muted-foreground")}>{l.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-border">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || generating}
            className="text-[11px] uppercase tracking-[0.3em] hover:text-primary hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {step < TOTAL_STEPS ? (
            <button onClick={goNext} disabled={!canNext()}
              className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-foreground transition-soft">
              Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-soft" />
            </button>
          ) : (
            <HeartButton glow onClick={handleGenerate} disabled={generating}>
              {generating ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Writing…</>) : "Write my story"}
            </HeartButton>
          )}
        </div>
      </main>
    </div>
  );
};

export default Create;
