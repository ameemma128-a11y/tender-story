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
      "px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-soft border",
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

  const stepLabels = ["Template", "Subject", "Self", "Tone", "Form"];

  return (
    <div className="min-h-screen bg-gradient-noir relative grain">
      <Header />
      <div className="absolute inset-0 bg-gradient-ember opacity-30 pointer-events-none" />

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-20">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-16">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            return (
              <div key={n} className="flex-1 flex flex-col items-start gap-2">
                <div className={cn("h-px w-full transition-soft", n <= step ? "bg-primary" : "bg-border")} />
                <div className="flex items-center gap-2">
                  <span className={cn("font-display text-xs", n <= step ? "text-primary" : "text-muted-foreground")}>
                    0{n}
                  </span>
                  <span className={cn("text-[10px] uppercase tracking-[0.25em]", n === step ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div key={step} className="animate-fade-up">
          {step === 1 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Movement One</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Choose the universe.</h2>
              <p className="text-muted-foreground mb-10 font-light">The trope sets the gravity of the story.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={cn(
                      "p-6 text-left transition-soft group",
                      template === t.id
                        ? "bg-primary text-primary-foreground shadow-ember"
                        : "bg-background hover:bg-card hover:text-primary"
                    )}>
                    <span className="font-display text-2xl block">{t.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 mt-1 block">
                      № 0{TEMPLATES.indexOf(t) + 1}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Movement Two</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Cast the obsession.</h2>
              <p className="text-muted-foreground mb-10 font-light">A name. The figure at the center of your dark.</p>
              <Input
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                placeholder="Their name…"
                className="rounded-none h-16 text-2xl font-serif px-0 bg-transparent border-0 border-b-2 border-border focus-visible:ring-0 focus-visible:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-4 italic font-light">Real, fictional, half-remembered. No one will know.</p>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Movement Three</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Step inside?</h2>
              <p className="text-muted-foreground mb-10 font-light">Or remain the unseen narrator.</p>
              <div className="flex items-center justify-between p-6 border border-border mb-6">
                <Label htmlFor="reader" className="text-base font-display">Place me in the story</Label>
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
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Your nature</Label>
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
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Movement Four</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Set the tone.</h2>
              <p className="text-muted-foreground mb-10 font-light">The emotional weather of the chapter.</p>
              <div className="flex flex-wrap gap-3">
                {TONES.map(t => (
                  <Tag key={t} active={tones.includes(t)} onClick={() => toggle(tones, setTones, t)}>{t}</Tag>
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">Movement Five</p>
              <h2 className="font-display text-5xl md:text-6xl mb-3">Choose the form.</h2>
              <p className="text-muted-foreground mb-10 font-light">How deep do you want to fall?</p>
              <div className="space-y-px bg-border">
                {LENGTHS.map(l => (
                  <button key={l.id} onClick={() => setLength(l.id)}
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

          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-foreground transition-soft">
              Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-soft" />
            </button>
          ) : (
            <HeartButton glow onClick={handleGenerate} disabled={generating}>
              {generating ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Composing…</>) : "Compose the chapter"}
            </HeartButton>
          )}
        </div>
      </main>
    </div>
  );
};

export default Create;
