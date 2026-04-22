import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";

const ROMANCE_GENRES = [
  "Toxic Love","Slow Burn","Enemies to Lovers","Fake Dating","Second Chance",
  "Secret Admirer","Soulmates","Forbidden Bond","Arranged Marriage",
  "CEO Romance","Bodyguard Romance","Friends to Lovers","Love Triangle",
  "Unrequited Love","Obsessive Love",
];
const UNIVERSE_GENRES = [
  "Royal Romance","Fantasy Academy","Villain's Revenge","Historical Court",
  "Supernatural Bond","Campus Life","Idol Romance","Reincarnation",
  "Rivals to Lovers","Revenge Arc","Time Travel","Found Family",
  "War Romance","Political Intrigue","Mafia Romance",
];
const ACTION_GENRES = [
  "Mystery & Investigation","Spy Romance","Survival Game","Assassin's Code",
  "Heist Story","Psychological Thriller","Conspiracy","Dark Academia",
  "Crime & Redemption","Forbidden Mission","Underground World","Power Struggle",
];
const CONTEXTS = [
  "Modern day","Royal court","Fantasy world","Magic academy","Post-apocalyptic",
  "Historical era","Corporate world","Small town","Supernatural realm",
  "Parallel dimension","Island isolation","Big city","Space",
  "Medieval kingdom","Underground world",
];
const CHARACTER_TRAITS = [
  "Cold & distant","Warm & protective","Arrogant & confident","Gentle & patient",
  "Mysterious & unpredictable","Playful & teasing","Possessive & intense",
  "Soft & caring","Dominant & commanding","Broken & guarded",
  "Charismatic & charming","Ruthless & ambitious","Loyal & devoted",
  "Rebellious & wild","Quiet & observant",
  "Yearner / Golden Retriever","Sunshine personality","Morally grey",
  "Stoic protector","Cunning & calculating","Gentle giant","Emotionally unavailable",
];
const READER_TRAITS = [
  "Soft & shy","Bold & fierce","Sarcastic & witty","Mysterious & quiet",
  "Warm & empathetic","Clumsy & endearing","Confident & ambitious",
  "Dreamy & romantic","Independent & strong","Playful & flirty",
  "Serious & focused","Sweet & gentle","Cold outside warm inside",
  "Chaotic & unpredictable","Observant & intelligent","Passionate & intense",
  "Carefree & spontaneous","Stubborn & determined",
  "Yearner / Golden Retriever","Sunshine personality","Morally grey",
  "Quietly observant","Fiercely loyal","Emotionally complex",
];
const TONES = [
  "Sweet romance","Intense & dramatic","Suggestive","Sensual","Suggestive & steamy",
  "Angst & emotional","Dark & complex","Slow burn tension","Lighthearted & fun",
  "Bittersweet","Chaotic & unpredictable","Obsessive & intense","Hopeful & healing",
  "Melancholic","Passionate & fiery","Tender & intimate","Mysterious & suspenseful",
];
const STORY_STARTS = [
  { id:"action", num:"I", label:"In the action", desc:"We open right in the middle of a scene" },
  { id:"encounter", num:"II", label:"A chance encounter", desc:"The characters meet unexpectedly" },
  { id:"conflict", num:"III", label:"A conflict", desc:"They start in opposition or tension" },
  { id:"slow", num:"IV", label:"A slow introduction", desc:"Progressive, atmospheric buildup" },
];
const ENDINGS = [
  { id:"happy", num:"I", label:"Happy ending", desc:"They end up together" },
  { id:"tragic", num:"II", label:"Tragic ending", desc:"Separation, sacrifice, or death" },
  { id:"open", num:"III", label:"Open ending", desc:"Ambiguous — the reader decides" },
  { id:"cliffhanger", num:"IV", label:"Cliffhanger", desc:"Suspended — leaves you wanting more" },
];
const LENGTHS = [
  { id:"short", label:"Short scene", desc:"500 words" },
  { id:"chapter", label:"One chapter", desc:"1500 words" },
  { id:"multi", label:"Multi-chapter", desc:"3000+ words" },
];
const LANGUAGES = [
  { id:"English", label:"English" },
  { id:"French", label:"Français" },
  { id:"Spanish", label:"Español" },
  { id:"Portuguese", label:"Português" },
  { id:"Korean", label:"한국어" },
  { id:"Japanese", label:"日本語" },
  { id:"German", label:"Deutsch" },
  { id:"Italian", label:"Italiano" },
  { id:"Arabic", label:"العربية" },
];
const PROTAGONIST_OPTIONS = [
  "A mysterious soul with a hidden past",
  "A fierce and unyielding spirit",
  "A gentle dreamer lost in their own world",
  "A sharp mind who sees what others miss",
];

const PRONOUNS = [
  { id:"she", label:"She / Her" },
  { id:"he", label:"He / Him" },
  { id:"they", label:"They / Them" },
  { id:"any", label:"No preference" },
];

const TOTAL_STEPS = 9;

interface Character { name: string; traits: string[]; notes: string; }
const emptyCharacter = (): Character => ({ name:"", traits:[], notes:"" });

const Tag = ({ active, onClick, onDoubleClick, children }: {
  active: boolean; onClick: () => void; onDoubleClick?: () => void; children: React.ReactNode;
}) => (
  <button type="button" onClick={onClick} onDoubleClick={onDoubleClick}
    className={cn(
      "px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-soft border select-none font-sans-ui",
      active ? "bg-primary text-primary-foreground border-primary shadow-amber"
             : "bg-transparent text-foreground/80 border-border hover:border-primary hover:text-primary"
    )}>
    {children}
  </button>
);

const Create = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [genres, setGenres] = useState<string[]>([]);
  const [storyIdea, setStoryIdea] = useState("");
  const [contexts, setContexts] = useState<string[]>([]);
  const [contextNotes, setContextNotes] = useState("");
  const [includeReader, setIncludeReader] = useState<boolean | null>(null);
  const [readerName, setReaderName] = useState("");
  const [readerPronouns, setReaderPronouns] = useState("none");
  const [readerTraits, setReaderTraits] = useState<string[]>([]);
  const [readerNotes, setReaderNotes] = useState("");
  const [protagonistChoice, setProtagonistChoice] = useState("");
  const [protagonistCustom, setProtagonistCustom] = useState("");
  const [pronouns, setPronouns] = useState("any");
  const [characters, setCharacters] = useState<Character[]>([emptyCharacter()]);
  const [storyStart, setStoryStart] = useState("");
  const [tones, setTones] = useState<string[]>([]);
  const [toneNotes, setToneNotes] = useState("");
  const [ending, setEnding] = useState("");
  const [endingCustom, setEndingCustom] = useState("");
  const [length, setLength] = useState("chapter");
  const [language, setLanguage] = useState("English");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session) navigate("/auth"); });
  }, [navigate]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const updateCharacter = (i: number, field: keyof Character, value: string | string[]) =>
    setCharacters(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const toggleCharacterTrait = (charIdx: number, trait: string) => {
    const c = characters[charIdx];
    updateCharacter(charIdx, "traits", c.traits.includes(trait) ? c.traits.filter(t => t !== trait) : [...c.traits, trait]);
  };

  const canNext = () => {
    if (step === 1) return genres.length > 0 || storyIdea.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) {
      if (includeReader === null) return false;
      if (includeReader) return readerName.trim().length > 0;
      return protagonistChoice.trim().length > 0 || protagonistCustom.trim().length > 0;
    }
    if (step === 4) return characters[0].name.trim().length > 0;
    if (step === 5) return storyStart.length > 0;
    if (step === 6) return tones.length > 0 || toneNotes.trim().length > 0;
    if (step === 7) return ending.length > 0 || endingCustom.trim().length > 0;
    return true;
  };

  const goNext = () => { if (!canNext() || step >= TOTAL_STEPS) return; setStep(s => s + 1); };

  const selectAndAdvance = (arr: string[], setArr: (v: string[]) => void, v: string) => {
    if (!arr.includes(v)) setArr([...arr, v]);
    setTimeout(goNext, 0);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth"); return; }

      const protagonistDescription = includeReader ? readerName : protagonistCustom.trim() || protagonistChoice;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          genres, storyIdea: storyIdea.trim() || null,
          contexts, contextNotes: contextNotes.trim() || null,
          characters: characters.filter(c => c.name.trim()),
          includeReader,
          readerName: includeReader ? readerName : null,
          readerPronouns: includeReader ? readerPronouns : null,
          readerTraits: includeReader ? readerTraits : [],
          readerNotes: includeReader ? (readerNotes.trim() || null) : null,
          pronouns: includeReader ? pronouns : null,
          protagonistDescription: !includeReader ? protagonistDescription : null,
          storyStart, tones, toneNotes: toneNotes.trim() || null,
          ending, endingCustom: endingCustom.trim() || null,
          length, language,
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as any).error || "Generation failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) content += c; }
          catch { buffer = line + "\n" + buffer; break; }
        }
      }

      const match = content.match(/^#\s+(.+)/);
      const mainCharName = characters[0]?.name ?? "Unknown";
      const title = match ? match[1].trim() : `${genres[0] ?? "Untitled"} with ${mainCharName}`;
      const body = content.replace(/^#\s+.+\n+/, "");
      const templateSlug = (genres[0] ?? "custom").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const combinedNotes = [
        contextNotes.trim(), contexts.length ? `Universe: ${contexts.join(", ")}` : "",
        genres.length ? `Genres: ${genres.join(", ")}` : "",
        storyIdea.trim() ? `Idea: ${storyIdea.trim()}` : "",
        storyStart ? `Opening: ${storyStart}` : "",
        toneNotes.trim() ? `Mood: ${toneNotes.trim()}` : "",
        ending ? `Ending: ${ending}` : "",
        endingCustom.trim() ? `Custom ending: ${endingCustom.trim()}` : "",
        `Language: ${language}`,
      ].filter(Boolean).join(" | ") || null;

      const { data: saved, error } = await supabase.from("stories").insert({
        user_id: sess.session.user.id, title, template: templateSlug,
        character_name: mainCharName, character_traits: characters[0]?.traits ?? [],
        character_notes: combinedNotes,
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

  const lang = (() => { try { return localStorage.getItem("tender_lang") || "en"; } catch { return "en"; } })();
  const STEP_LABELS: Record<string, string[]> = {
    en: ["Genre","World","You","Cast","Opening","Tone","Ending","Length","Language"],
    fr: ["Genre","Monde","Vous","Cast","Début","Ton","Fin","Longueur","Langue"],
    es: ["Género","Mundo","Tú","Cast","Inicio","Tono","Final","Longitud","Idioma"],
    pt: ["Gênero","Mundo","Você","Cast","Início","Tom","Final","Duração","Idioma"],
    ko: ["장르","세계","나","출연","시작","분위기","결말","길이","언어"],
    ja: ["ジャンル","世界","あなた","キャスト","開幕","トーン","結末","長さ","言語"],
    ar: ["النوع","العالم","أنت","الممثلون","البداية","النبرة","النهاية","الطول","اللغة"],
    de: ["Genre","Welt","Du","Besetzung","Anfang","Ton","Ende","Länge","Sprache"],
    it: ["Genere","Mondo","Tu","Cast","Inizio","Tono","Fine","Lunghezza","Lingua"],
    zh: ["类型","世界","你","角色","开篇","基调","结局","长度","语言"],
  };
  const stepLabels = STEP_LABELS[lang] ?? STEP_LABELS.en;

  return (
    <div className="min-h-screen bg-gradient-noir relative grain">
      <Header />
      <div className="absolute inset-0 bg-gradient-aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[60vh] candle-bloom pointer-events-none animate-flicker" />

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pt-28 pb-32 md:pb-24">
        {/* Progress — simple on mobile, full bar on desktop */}
        <div className="mb-12">
          {/* Mobile: simple step counter */}
          <div className="flex sm:hidden items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-sans-ui">
              Step {step} / {TOTAL_STEPS}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-foreground font-sans-ui">
              {stepLabels[step - 1]}
            </span>
          </div>
          <div className="flex h-px w-full sm:hidden">
            <div className="bg-primary transition-soft" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            <div className="bg-border flex-1" />
          </div>

          {/* Desktop: full step bar */}
          <div className="hidden sm:flex items-center justify-between gap-1">
            {stepLabels.map((label, i) => {
              const n = i + 1;
              return (
                <div key={n} className="flex-1 flex flex-col items-start gap-1.5 min-w-0">
                  <div className={cn("h-px w-full transition-soft", n <= step ? "bg-primary" : "bg-border")} />
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={cn("font-display text-[10px]", n <= step ? "text-primary" : "text-muted-foreground")}>0{n}</span>
                    <span className={cn("text-[8px] uppercase tracking-[0.15em] truncate font-sans-ui", n === step ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div key={step} className="animate-fade-up">

          {/* STEP 1 — Genre */}
          {step === 1 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step One</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">Pick your genres.</h2>
              <p className="text-muted-foreground mb-8 font-light text-sm md:text-base">Select any combination — or describe your own idea.</p>
              <div className="mb-10">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Have your own idea? <span className="opacity-60 normal-case tracking-normal">(optional)</span></Label>
                <Textarea value={storyIdea} onChange={e => setStoryIdea(e.target.value)} placeholder="Describe your story concept here…" rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
              </div>
              <Tabs defaultValue="romance" className="w-full">
                <TabsList className="rounded-none bg-transparent border border-border p-0 h-auto w-full grid grid-cols-3">
                  <TabsTrigger value="romance" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-[9px] uppercase tracking-[0.1em] py-3 font-sans-ui">
                    <span className="sm:hidden">Romance</span>
                    <span className="hidden sm:inline">Romance</span>
                  </TabsTrigger>
                  <TabsTrigger value="universe" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-[9px] uppercase tracking-[0.1em] py-3 font-sans-ui">
                    <span className="sm:hidden">Universe</span>
                    <span className="hidden sm:inline">Universe & Fantasy</span>
                  </TabsTrigger>
                  <TabsTrigger value="action" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-[9px] uppercase tracking-[0.1em] py-3 font-sans-ui">
                    <span className="sm:hidden">Action</span>
                    <span className="hidden sm:inline">Action & Thriller</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="romance" className="mt-6"><div className="flex flex-wrap gap-2">{ROMANCE_GENRES.map(g => <Tag key={g} active={genres.includes(g)} onClick={() => toggle(genres, setGenres, g)} onDoubleClick={() => selectAndAdvance(genres, setGenres, g)}>{g}</Tag>)}</div></TabsContent>
                <TabsContent value="universe" className="mt-6"><div className="flex flex-wrap gap-2">{UNIVERSE_GENRES.map(g => <Tag key={g} active={genres.includes(g)} onClick={() => toggle(genres, setGenres, g)} onDoubleClick={() => selectAndAdvance(genres, setGenres, g)}>{g}</Tag>)}</div></TabsContent>
                <TabsContent value="action" className="mt-6"><div className="flex flex-wrap gap-2">{ACTION_GENRES.map(g => <Tag key={g} active={genres.includes(g)} onClick={() => toggle(genres, setGenres, g)} onDoubleClick={() => selectAndAdvance(genres, setGenres, g)}>{g}</Tag>)}</div></TabsContent>
              </Tabs>
              {genres.length > 0 && <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-sans-ui">{genres.length} selected</p>}
            </>
          )}

          {/* STEP 2 — Universe */}
          {step === 2 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step Two</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">Set the universe.</h2>
              <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">Where does this take place? Pick any.</p>
              <div className="flex flex-wrap gap-2 mb-10">{CONTEXTS.map(c => <Tag key={c} active={contexts.includes(c)} onClick={() => toggle(contexts, setContexts, c)} onDoubleClick={() => selectAndAdvance(contexts, setContexts, c)}>{c}</Tag>)}</div>
              <div>
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Describe the world in your own words <span className="opacity-60 normal-case tracking-normal">(optional)</span></Label>
                <Textarea value={contextNotes} onChange={e => setContextNotes(e.target.value)} placeholder="A coastal town in winter, a neon-lit megacity, a dying empire…" rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
              </div>
            </>
          )}

          {/* STEP 3 — YOU first */}
          {step === 3 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step Three</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">Are you in this story?</h2>
              <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">Step into the narrative — or let someone else take the lead.</p>
              <div className="space-y-px bg-border mb-8">
                <button onClick={() => setIncludeReader(true)} className={cn("w-full p-6 text-left transition-soft", includeReader === true ? "bg-primary text-primary-foreground" : "bg-background hover:bg-card hover:text-primary")}>
                  <div className="font-display text-2xl mb-1">Yes, put me in the story</div>
                  <div className={cn("text-[10px] uppercase tracking-[0.2em] font-sans-ui", includeReader === true ? "opacity-80" : "text-muted-foreground")}>I want to be the protagonist</div>
                </button>
                <button onClick={() => setIncludeReader(false)} className={cn("w-full p-6 text-left transition-soft", includeReader === false ? "bg-primary text-primary-foreground" : "bg-background hover:bg-card hover:text-primary")}>
                  <div className="font-display text-2xl mb-1">No, create a protagonist for me</div>
                  <div className={cn("text-[10px] uppercase tracking-[0.2em] font-sans-ui", includeReader === false ? "opacity-80" : "text-muted-foreground")}>The AI will build a character</div>
                </button>
              </div>

              {includeReader === true && (
                <div className="animate-fade-up space-y-6">
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-sans-ui">Your name</Label>
                    <Input value={readerName} onChange={e => setReaderName(e.target.value)} placeholder="The name you want to go by in this story…" className="rounded-none h-12 mt-2 bg-transparent border-0 border-b border-border focus-visible:ring-0 focus-visible:border-primary text-lg font-serif px-0" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">How should the story refer to you?</Label>
                    <div className="grid grid-cols-2 gap-px bg-border">
                      {PRONOUNS.map(p => (
                        <button key={p.id} onClick={() => setReaderPronouns(p.id)}
                          className={cn("p-4 text-left font-sans-ui text-[11px] uppercase tracking-[0.2em] transition-soft",
                            readerPronouns === p.id ? "bg-primary text-primary-foreground" : "bg-background hover:bg-card hover:text-primary")}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">How should the story refer to you?</Label>
                    <div className="grid grid-cols-2 gap-px bg-border">
                      {PRONOUNS.map(p => (
                        <button key={p.id} onClick={() => setPronouns(p.id)}
                          className={cn("p-4 text-left transition-soft font-display text-lg", pronouns === p.id ? "bg-primary text-primary-foreground" : "bg-background hover:bg-card hover:text-primary")}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Your nature <span className="opacity-60 normal-case tracking-normal">— pick any</span></Label>
                    <div className="flex flex-wrap gap-2">{READER_TRAITS.map(t => <Tag key={t} active={readerTraits.includes(t)} onClick={() => toggle(readerTraits, setReaderTraits, t)} onDoubleClick={() => selectAndAdvance(readerTraits, setReaderTraits, t)}>{t}</Tag>)}</div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Describe yourself <span className="opacity-60 normal-case tracking-normal">(optional)</span></Label>
                    <Textarea value={readerNotes} onChange={e => setReaderNotes(e.target.value)} placeholder="The little things that make you, you…" rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
                  </div>
                </div>
              )}

              {includeReader === false && (
                <div className="animate-fade-up space-y-4">
                  <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block font-sans-ui">Choose a protagonist</Label>
                  <div className="space-y-px bg-border">
                    {PROTAGONIST_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => { setProtagonistChoice(opt); setProtagonistCustom(""); }}
                        className={cn("w-full p-4 text-left font-serif transition-soft", protagonistChoice === opt && !protagonistCustom ? "bg-primary text-primary-foreground" : "bg-background hover:bg-card hover:text-primary")}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Or define your own <span className="opacity-60 normal-case tracking-normal">(optional)</span></Label>
                    <Textarea value={protagonistCustom} onChange={e => { setProtagonistCustom(e.target.value); if (e.target.value) setProtagonistChoice(""); }} placeholder="A young cartographer with a secret past…" rows={2} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 4 — Characters (multiple) */}
          {step === 4 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step Four</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">Who else is in your story?</h2>
              <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">Add up to 4 characters — real, fictional, or imagined.</p>
              <div className="space-y-10">
                {characters.map((char, idx) => (
                  <div key={idx} className="border border-border p-6 relative">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-sans-ui">Character {idx + 1}</span>
                      {idx > 0 && <button onClick={() => setCharacters(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive transition-soft p-1"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                    <Input value={char.name} onChange={e => updateCharacter(idx, "name", e.target.value)} placeholder="Their name…" className="rounded-none h-14 text-xl font-serif px-0 bg-transparent border-0 border-b-2 border-border focus-visible:ring-0 focus-visible:border-primary mb-2" />
                    <p className="text-xs text-muted-foreground italic font-light mb-8">Real, fictional, half-remembered. No one will know.</p>
                    {char.name.trim() && (
                      <div className="animate-fade-up space-y-6">
                        <div>
                          <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Their personality <span className="opacity-60 normal-case tracking-normal">— pick any</span></Label>
                          <div className="flex flex-wrap gap-2">{CHARACTER_TRAITS.map(t => <Tag key={t} active={char.traits.includes(t)} onClick={() => toggleCharacterTrait(idx, t)}>{t}</Tag>)}</div>
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Anything else about them? <span className="opacity-60 normal-case tracking-normal">(optional)</span></Label>
                          <Textarea value={char.notes} onChange={e => updateCharacter(idx, "notes", e.target.value)} placeholder="A scar above their brow, a habit of humming when nervous…" rows={2} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {characters.length < 4 && (
                <button onClick={() => setCharacters(prev => [...prev, emptyCharacter()])} className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-soft font-sans-ui">
                  <Plus className="w-4 h-4" /> Add another character
                </button>
              )}
            </>
          )}

          {/* STEP 5 — How it starts */}
          {step === 5 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step Five</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">How does it all start?</h2>
              <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">Choose the opening of your story.</p>
              <div className="space-y-px bg-border">
                {STORY_STARTS.map(s => (
                  <button key={s.id} onClick={() => setStoryStart(s.id)} onDoubleClick={() => { setStoryStart(s.id); setTimeout(goNext, 0); }}
                    className={cn("w-full p-6 text-left flex items-start gap-4 transition-soft", storyStart === s.id ? "bg-primary text-primary-foreground shadow-amber" : "bg-background hover:bg-card hover:text-primary")}>
                    <span className={cn("font-display text-3xl w-10 shrink-0", storyStart === s.id ? "text-primary-foreground/60" : "text-primary/40")}>{s.num}</span>
                    <div>
                      <div className="font-display text-xl mb-1">{s.label}</div>
                      <div className={cn("text-[10px] uppercase tracking-[0.2em] font-sans-ui", storyStart === s.id ? "opacity-80" : "text-muted-foreground")}>{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 6 — Tone */}
          {step === 6 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step Six</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">Set the tone.</h2>
              <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">Pick the emotional flavor of your story.</p>
              <div className="flex flex-wrap gap-3">{TONES.map(t => <Tag key={t} active={tones.includes(t)} onClick={() => toggle(tones, setTones, t)} onDoubleClick={() => selectAndAdvance(tones, setTones, t)}>{t}</Tag>)}</div>
              <div className="mt-10">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Describe the exact mood you want <span className="opacity-60 normal-case tracking-normal">(optional)</span></Label>
                <Textarea value={toneNotes} onChange={e => setToneNotes(e.target.value)} placeholder="Slow-burning ache, tender silences, a single touch that undoes everything…" rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
              </div>
            </>
          )}

          {/* STEP 7 — Ending */}
          {step === 7 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step Seven</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">How does it end?</h2>
              <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">Set the destination of your story.</p>
              <div className="space-y-px bg-border mb-8">
                {ENDINGS.map(e => (
                  <button key={e.id} onClick={() => { setEnding(e.id); setEndingCustom(""); }} onDoubleClick={() => { setEnding(e.id); setEndingCustom(""); setTimeout(goNext, 0); }}
                    className={cn("w-full p-6 text-left flex items-start gap-4 transition-soft", ending === e.id && !endingCustom ? "bg-primary text-primary-foreground shadow-amber" : "bg-background hover:bg-card hover:text-primary")}>
                    <span className={cn("font-display text-3xl w-10 shrink-0", ending === e.id && !endingCustom ? "text-primary-foreground/60" : "text-primary/40")}>{e.num}</span>
                    <div>
                      <div className="font-display text-xl mb-1">{e.label}</div>
                      <div className={cn("text-[10px] uppercase tracking-[0.2em] font-sans-ui", ending === e.id && !endingCustom ? "opacity-80" : "text-muted-foreground")}>{e.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">Define your own ending <span className="opacity-60 normal-case tracking-normal">(optional)</span></Label>
                <Textarea value={endingCustom} onChange={e => { setEndingCustom(e.target.value); if (e.target.value) setEnding(""); }} placeholder="They meet again years later, in a city neither of them meant to visit…" rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
              </div>
            </>
          )}

          {/* STEP 8 — Length */}
          {step === 8 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step Eight</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">Choose the length.</h2>
              <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">How long do you want your story to be?</p>
              <div className="space-y-px bg-border">
                {LENGTHS.map(l => (
                  <button key={l.id} onClick={() => setLength(l.id)} onDoubleClick={() => { setLength(l.id); setTimeout(goNext, 0); }} disabled={generating}
                    className={cn("w-full p-6 text-left flex justify-between items-center transition-soft", length === l.id ? "bg-primary text-primary-foreground shadow-amber" : "bg-background hover:bg-card hover:text-primary")}>
                    <span className="font-display text-2xl">{l.label}</span>
                    <span className={cn("text-[10px] uppercase tracking-[0.3em] font-sans-ui", length === l.id ? "opacity-90" : "text-muted-foreground")}>{l.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 9 — Language */}
          {step === 9 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">Step Nine</p>
              <h2 className="font-display text-4xl md:text-6xl mb-3 italic">Choose your story language.</h2>
              <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">Your story will be written entirely in this language.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
                {LANGUAGES.map(l => (
                  <button key={l.id} onClick={() => setLanguage(l.id)} onDoubleClick={() => { setLanguage(l.id); setTimeout(handleGenerate, 0); }} disabled={generating}
                    className={cn("p-5 text-left transition-soft", language === l.id ? "bg-primary text-primary-foreground shadow-amber" : "bg-background hover:bg-card hover:text-primary")}>
                    <div className="font-display text-xl">{l.label}</div>
                    <div className={cn("text-[10px] uppercase tracking-[0.3em] mt-1 font-sans-ui", language === l.id ? "opacity-90" : "text-muted-foreground")}>{l.id}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-border sticky bottom-0 md:static bg-background/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none pb-6 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || generating} className="text-[11px] uppercase tracking-[0.3em] hover:text-primary hover:bg-transparent font-sans-ui">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < TOTAL_STEPS ? (
            <button onClick={goNext} disabled={!canNext()} className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-foreground transition-soft font-sans-ui">
              Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-soft" />
            </button>
          ) : (
            <HeartButton glow onClick={handleGenerate} disabled={generating}>
              {generating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Writing…</> : "Write my story"}
            </HeartButton>
          )}
        </div>
      </main>
    </div>
  );
};

export default Create;
