import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const TEMPLATES = [
  { id: "toxic-love", label: "Toxic Love" },
  { id: "enemies-to-lovers", label: "Enemies to Lovers" },
  { id: "royal-romance", label: "Royal Romance" },
  { id: "fantasy-academy", label: "Fantasy Academy" },
  { id: "villains-revenge", label: "Villain's Revenge" },
  { id: "secret-admirer", label: "Secret Admirer" },
  { id: "arranged-marriage", label: "Arranged Marriage" },
  { id: "forbidden-bond", label: "Forbidden Bond" },
];
const TRAITS = ["Soft & shy", "Bold & fierce", "Sarcastic", "Mysterious", "Warm & caring", "Cold & distant"];
const TONES = ["Sweet romance", "Intense & dramatic", "Suggestive", "Angst & emotional", "Dark & complex"];
const LENGTHS = [
  { id: "short", label: "Short scene", desc: "500 words" },
  { id: "chapter", label: "One chapter", desc: "1500 words" },
  { id: "multi", label: "Multi-chapter", desc: "3000+ words" },
];

const Tag = ({ active, onClick, children }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-5 py-2.5 rounded-full text-sm transition-spring border",
      active
        ? "bg-gradient-rose text-primary-foreground border-transparent shadow-soft scale-105"
        : "bg-card/60 hover:bg-card border-border hover:border-primary/40"
    )}
  >
    {children}
  </button>
);

const Create = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [includeReader, setIncludeReader] = useState(false);
  const [readerName, setReaderName] = useState("");
  const [readerTraits, setReaderTraits] = useState<string[]>([]);
  const [tones, setTones] = useState<string[]>([]);
  const [length, setLength] = useState("chapter");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session) navigate("/auth"); });
  }, [navigate]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const canNext = () => {
    if (step === 1) return !!template;
    if (step === 2) return characterName.trim().length > 0;
    if (step === 3) return !includeReader || readerName.trim().length > 0;
    if (step === 4) return tones.length > 0;
    return true;
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
          template, characterName,
          readerName: includeReader ? readerName : null,
          readerTraits: includeReader ? readerTraits : [],
          tones, length,
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

      // Extract title from "# Title"
      const match = content.match(/^#\s+(.+)/);
      const title = match ? match[1].trim() : `${TEMPLATES.find(t => t.id === template)?.label} with ${characterName}`;
      const body = content.replace(/^#\s+.+\n+/, "");

      const { data: saved, error } = await supabase.from("stories").insert({
        user_id: sess.session.user.id,
        title, template, character_name: characterName,
        reader_name: includeReader ? readerName : null,
        reader_traits: includeReader ? readerTraits : [],
        tones, length, content: body,
      }).select().single();
      if (error) throw error;
      navigate(`/story/${saved.id}`);
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <Header />
      <div className="bokeh absolute inset-0 pointer-events-none" />

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-center gap-2 mb-10">
          {[1,2,3,4,5].map(n => (
            <div key={n} className={cn(
              "h-1 flex-1 rounded-full transition-soft",
              n <= step ? "bg-gradient-rose" : "bg-border"
            )} />
          ))}
        </div>

        <div key={step} className="animate-fade-up">
          {step === 1 && (
            <>
              <h2 className="font-serif text-4xl mb-2">Choose a template</h2>
              <p className="text-muted-foreground mb-8">Pick the trope that sets the mood.</p>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={cn(
                      "p-6 rounded-2xl border text-left transition-spring hover:-translate-y-0.5",
                      template === t.id
                        ? "bg-gradient-rose text-primary-foreground border-transparent shadow-soft"
                        : "bg-card/70 border-border hover:border-primary/40 hover:shadow-card"
                    )}>
                    <span className="font-serif text-lg">{t.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-serif text-4xl mb-2">Your character</h2>
              <p className="text-muted-foreground mb-8">Who is at the heart of this story?</p>
              <Input
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                placeholder="A name…"
                className="rounded-2xl h-14 text-lg px-5 bg-card/70"
              />
              <p className="text-sm text-muted-foreground mt-3 italic">It can be anyone — real or fictional.</p>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-serif text-4xl mb-2">Make it yours</h2>
              <p className="text-muted-foreground mb-8">Step into the story, or stay an observer.</p>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-card/70 border border-border mb-6">
                <Label htmlFor="reader" className="text-base font-serif">I want to be in the story</Label>
                <Switch id="reader" checked={includeReader} onCheckedChange={setIncludeReader} />
              </div>
              {includeReader && (
                <div className="animate-fade-up space-y-5">
                  <div>
                    <Label>Your name</Label>
                    <Input value={readerName} onChange={e => setReaderName(e.target.value)} className="rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="mb-3 block">Your personality</Label>
                    <div className="flex flex-wrap gap-2">
                      {TRAITS.map(t => (
                        <Tag key={t} active={readerTraits.includes(t)} onClick={() => toggle(readerTraits, setReaderTraits, t)}>{t}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-serif text-4xl mb-2">Set the tone</h2>
              <p className="text-muted-foreground mb-8">Choose the emotional flavor.</p>
              <div className="flex flex-wrap gap-3">
                {TONES.map(t => (
                  <Tag key={t} active={tones.includes(t)} onClick={() => toggle(tones, setTones, t)}>{t}</Tag>
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="font-serif text-4xl mb-2">Choose the length</h2>
              <p className="text-muted-foreground mb-8">How deep do you want to go?</p>
              <div className="space-y-3">
                {LENGTHS.map(l => (
                  <button key={l.id} onClick={() => setLength(l.id)}
                    className={cn(
                      "w-full p-5 rounded-2xl border text-left flex justify-between items-center transition-spring",
                      length === l.id
                        ? "bg-gradient-rose text-primary-foreground border-transparent shadow-soft"
                        : "bg-card/70 border-border hover:border-primary/40"
                    )}>
                    <span className="font-serif text-lg">{l.label}</span>
                    <span className={cn("text-sm", length === l.id ? "opacity-90" : "text-muted-foreground")}>{l.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-12">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || generating}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          {step < 5 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="rounded-full bg-gradient-rose text-primary-foreground hover:opacity-90 px-6">
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <HeartButton glow onClick={handleGenerate} disabled={generating}>
              {generating ? (<><Loader2 className="w-5 h-5 animate-spin" /> Writing…</>) : "Write my story"}
            </HeartButton>
          )}
        </div>
      </main>
    </div>
  );
};

export default Create;
