import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Bookmark, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const T: Record<string, Record<string, string>> = {
  en: { your_story:"Your Story", short:"Short scene", chapter:"One chapter", multi:"Multi-chapter", keep:"Keep", share:"Share", compose:"Compose another", copied:"Copied to clipboard" },
  fr: { your_story:"Votre Histoire", short:"Scène courte", chapter:"Un chapitre", multi:"Multi-chapitres", keep:"Garder", share:"Partager", compose:"Composer une autre", copied:"Copié dans le presse-papiers" },
  es: { your_story:"Tu Historia", short:"Escena corta", chapter:"Un capítulo", multi:"Multi-capítulo", keep:"Guardar", share:"Compartir", compose:"Componer otra", copied:"Copiado al portapapeles" },
  pt: { your_story:"Sua História", short:"Cena curta", chapter:"Um capítulo", multi:"Multi-capítulo", keep:"Guardar", share:"Compartilhar", compose:"Compor outra", copied:"Copiado para a área de transferência" },
  ko: { your_story:"나의 이야기", short:"짧은 장면", chapter:"한 챕터", multi:"여러 챕터", keep:"저장", share:"공유", compose:"다른 이야기 쓰기", copied:"클립보드에 복사됨" },
  ja: { your_story:"あなたの物語", short:"短い場面", chapter:"一章", multi:"複数章", keep:"保存", share:"シェア", compose:"別の物語を書く", copied:"クリップボードにコピーしました" },
  ar: { your_story:"قصتك", short:"مشهد قصير", chapter:"فصل واحد", multi:"فصول متعددة", keep:"احتفظ", share:"شارك", compose:"اكتب قصة أخرى", copied:"تم النسخ" },
  de: { your_story:"Deine Geschichte", short:"Kurze Szene", chapter:"Ein Kapitel", multi:"Mehrere Kapitel", keep:"Behalten", share:"Teilen", compose:"Eine weitere schreiben", copied:"In die Zwischenablage kopiert" },
  it: { your_story:"La Tua Storia", short:"Scena breve", chapter:"Un capitolo", multi:"Multi-capitolo", keep:"Tieni", share:"Condividi", compose:"Componi un'altra", copied:"Copiato negli appunti" },
  zh: { your_story:"你的故事", short:"短篇场景", chapter:"一个章节", multi:"多章节", keep:"保存", share:"分享", compose:"再写一篇", copied:"已复制到剪贴板" },
};

const Story = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang] = useState(() => { try { return localStorage.getItem("tender_lang") || "en"; } catch { return "en"; } });
  const tr = (k: string) => T[lang]?.[k] ?? T.en[k] ?? k;

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth"); return; }
      const { data, error } = await supabase.from("stories").select("*").eq("id", id).maybeSingle();
      if (error || !data) { toast.error("Story not found"); navigate("/library"); return; }
      setStory(data);
      setLoading(false);
    })();
  }, [id, navigate]);

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(`${story.title}\n\n${story.content}`); toast.success(tr("copied")); }
    catch { toast.error("Could not copy"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-reading relative grain">
      <Header />
      <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-ember opacity-40 pointer-events-none" />
      <article className="relative max-w-2xl mx-auto px-6 pt-40 pb-20 animate-fade-up">
        <p className="text-[10px] uppercase tracking-[0.5em] text-primary text-center">— {tr("your_story")} —</p>
        <h1 className="font-display text-5xl md:text-7xl text-center mt-8 mb-4 leading-[0.95] text-balance">{story.title}</h1>
        <div className="flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-16">
          <span>{new Date(story.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="w-1 h-1 bg-primary rounded-full" />
          <span>{story.length === "short" ? tr("short") : story.length === "chapter" ? tr("chapter") : tr("multi")}</span>
        </div>
        <div className="font-serif text-lg md:text-xl leading-[1.85] text-foreground/90 whitespace-pre-wrap first-letter:font-display first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary first-letter:leading-[0.85]">
          {story.content}
        </div>
        <div className="mt-20 pt-10 border-t border-border flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => toast.success("Kept in your archive")} variant="outline" className="rounded-none border-border hover:border-primary hover:text-primary text-[11px] uppercase tracking-[0.3em] h-11 px-6">
            <Bookmark className="w-3.5 h-3.5 mr-2" /> {tr("keep")}
          </Button>
          <Button variant="outline" onClick={handleShare} className="rounded-none border-border hover:border-primary hover:text-primary text-[11px] uppercase tracking-[0.3em] h-11 px-6">
            <Share2 className="w-3.5 h-3.5 mr-2" /> {tr("share")}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/create")} className="rounded-none text-[11px] uppercase tracking-[0.3em] h-11 px-6 hover:text-primary hover:bg-transparent">
            {tr("compose")}
          </Button>
        </div>
      </article>
    </div>
  );
};

export default Story;
