import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Pencil, Check, X, ImagePlus, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATE_LABELS: Record<string, string> = {
  "toxic-love":"Toxic Love","enemies-to-lovers":"Enemies to Lovers","royal-romance":"Royal Romance",
  "fantasy-academy":"Fantasy Academy","villains-revenge":"Villain's Revenge","secret-admirer":"Secret Admirer",
  "arranged-marriage":"Arranged Marriage","forbidden-bond":"Forbidden Bond","slow-burn":"Slow Burn",
  "fake-dating":"Fake Dating","ceo-romance":"CEO Romance","idol-romance":"Idol Romance",
};

interface Story { id:string; title:string; template:string; created_at:string; cover_url:string|null; user_id:string; }

const T: Record<string, Record<string, string>> = {
  en: { bookshelf:"Bookshelf", sub:"Every story you've written, kept close.", new_story:"Write a new story", empty:"Your shelf is empty.", write_first:"Write your first", add_cover:"Add cover", change_cover:"Change cover", rewrite:"Rewrite" },
  fr: { bookshelf:"Bibliothèque", sub:"Toutes vos histoires, toujours proches.", new_story:"Écrire une nouvelle histoire", empty:"Votre bibliothèque est vide.", write_first:"Écrire la première", add_cover:"Ajouter couverture", change_cover:"Changer couverture", rewrite:"Réécrire" },
  es: { bookshelf:"Biblioteca", sub:"Cada historia que has escrito, siempre cerca.", new_story:"Escribir una nueva historia", empty:"Tu biblioteca está vacía.", write_first:"Escribir la primera", add_cover:"Añadir portada", change_cover:"Cambiar portada", rewrite:"Reescribir" },
  pt: { bookshelf:"Biblioteca", sub:"Cada história que você escreveu, sempre perto.", new_story:"Escrever uma nova história", empty:"Sua biblioteca está vazia.", write_first:"Escrever a primeira", add_cover:"Adicionar capa", change_cover:"Trocar capa", rewrite:"Reescrever" },
  ko: { bookshelf:"서재", sub:"당신이 쓴 모든 이야기.", new_story:"새 이야기 쓰기", empty:"서재가 비어 있습니다.", write_first:"첫 번째 이야기 쓰기", add_cover:"표지 추가", change_cover:"표지 변경", rewrite:"다시 쓰기" },
  ja: { bookshelf:"書架", sub:"書いたすべての物語。", new_story:"新しい物語を書く", empty:"書架は空です。", write_first:"最初の物語を書く", add_cover:"表紙を追加", change_cover:"表紙を変更", rewrite:"書き直す" },
  ar: { bookshelf:"رف الكتب", sub:"كل قصة كتبتها.", new_story:"اكتب قصة جديدة", empty:"رفك فارغ.", write_first:"اكتب أولى قصصك", add_cover:"إضافة غلاف", change_cover:"تغيير الغلاف", rewrite:"أعد الكتابة" },
  de: { bookshelf:"Regal", sub:"Jede Geschichte, immer nah.", new_story:"Neue Geschichte schreiben", empty:"Dein Regal ist leer.", write_first:"Erste Geschichte schreiben", add_cover:"Cover hinzufügen", change_cover:"Cover ändern", rewrite:"Neu schreiben" },
  it: { bookshelf:"Libreria", sub:"Ogni storia che hai scritto.", new_story:"Scrivi una nuova storia", empty:"Il tuo scaffale è vuoto.", write_first:"Scrivi la prima", add_cover:"Aggiungi copertina", change_cover:"Cambia copertina", rewrite:"Riscrivi" },
  zh: { bookshelf:"书架", sub:"你写过的每一个故事。", new_story:"写一个新故事", empty:"你的书架是空的。", write_first:"写第一个故事", add_cover:"添加封面", change_cover:"更换封面", rewrite:"重新创作" },
};

const Library = () => {
  const navigate = useNavigate();
  const lang = (() => { try { return localStorage.getItem("tender_lang") || "en"; } catch { return "en"; } })();
  const tr = (k: string) => T[lang]?.[k] ?? T.en[k] ?? k;
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editValue, setEditValue] = useState("");
  const [uploadingId, setUploadingId] = useState<string|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingCoverFor, setPendingCoverFor] = useState<string|null>(null);
  const [userId, setUserId] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth"); return; }
      setUserId(sess.session.user.id);
      const { data, error } = await supabase.from("stories").select("id,title,template,created_at,cover_url,user_id").order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setStories(data ?? []);
      setLoading(false);
    })();
  }, [navigate]);

  const startEdit = (s: Story) => { setEditingId(s.id); setEditValue(s.title); };
  const cancelEdit = () => { setEditingId(null); setEditValue(""); };
  const saveEdit = async (id: string) => {
    const title = editValue.trim();
    if (!title) { toast.error("Title can't be empty"); return; }
    const { error } = await supabase.from("stories").update({ title }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setStories(s => s.map(x => x.id === id ? { ...x, title } : x));
    setEditingId(null);
    toast.success("Renamed");
  };

  const triggerCover = (id: string) => { setPendingCoverFor(id); fileInputRef.current?.click(); };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = pendingCoverFor;
    e.target.value = "";
    if (!file || !id || !userId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploadingId(id);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("story-covers").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("story-covers").getPublicUrl(path);
      const { error: updErr } = await supabase.from("stories").update({ cover_url: pub.publicUrl }).eq("id", id);
      if (updErr) throw updErr;
      setStories(s => s.map(x => x.id === id ? { ...x, cover_url: pub.publicUrl } : x));
      toast.success("Cover added");
    } catch (err: any) { toast.error(err.message ?? "Upload failed"); }
    finally { setUploadingId(null); setPendingCoverFor(null); }
  };

  return (
    <div className="min-h-screen bg-gradient-noir relative grain">
      <Header />
      <div className="absolute inset-0 bg-gradient-ember opacity-20 pointer-events-none" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-20">
        <div className="mb-10 md:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">— {tr("bookshelf")} —</p>
            <h1 className="font-display text-4xl md:text-6xl mb-2">{tr("bookshelf")}</h1>
            <p className="text-muted-foreground font-light text-sm">{tr("sub")}</p>
          </div>
          <Button onClick={() => navigate("/create")} className="group rounded-none text-[11px] uppercase tracking-[0.3em] h-12 px-6 shadow-ember self-start sm:self-auto">
            {tr("new_story")} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-soft" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 border border-border">
            <BookOpen className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6 font-light">{tr("empty")}</p>
            <Button onClick={() => navigate("/create")} className="rounded-none text-[11px] uppercase tracking-[0.3em]">{tr("write_first")}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-12">
            {stories.map(s => (
              <div key={s.id} className="group">
                <button onClick={() => navigate(`/story/${s.id}`)} className={cn("relative w-full aspect-[2/3] overflow-hidden border border-border shadow-luxe transition-soft group-hover:shadow-ember group-hover:-translate-y-1", !s.cover_url && "bg-gradient-to-br from-card via-background to-card")}>
                  {s.cover_url ? (
                    <img src={s.cover_url} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-[8px] uppercase tracking-[0.3em] text-primary mb-3">{TEMPLATE_LABELS[s.template] ?? s.template}</span>
                      <span className="font-display text-base leading-tight text-foreground/90 line-clamp-4">{s.title}</span>
                      <span className="absolute bottom-3 left-0 right-0 text-[7px] uppercase tracking-[0.4em] text-muted-foreground">Tender</span>
                    </div>
                  )}
                  <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                </button>

                <div className="mt-3 md:mt-4">
                  {editingId === s.id ? (
                    <div className="flex items-center gap-1">
                      <Input value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveEdit(s.id); if (e.key === "Escape") cancelEdit(); }} autoFocus className="h-8 rounded-none bg-transparent border-0 border-b border-primary text-sm font-display px-0 focus-visible:ring-0" />
                      <button onClick={() => saveEdit(s.id)} className="text-primary p-1"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={cancelEdit} className="text-muted-foreground p-1"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => navigate(`/story/${s.id}`)} className="font-display text-sm leading-tight text-left hover:text-primary transition-soft line-clamp-2 flex-1">{s.title}</button>
                      <button onClick={() => startEdit(s)} className="text-muted-foreground hover:text-primary p-1 -mt-1 shrink-0"><Pencil className="w-3 h-3" /></button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                    <span className="truncate">{TEMPLATE_LABELS[s.template] ?? s.template}</span>
                    <span className="w-1 h-1 bg-primary/60 rounded-full shrink-0" />
                    <span className="shrink-0">{new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <button onClick={() => triggerCover(s.id)} disabled={uploadingId === s.id} className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-foreground/60 hover:text-primary transition-soft disabled:opacity-50">
                      {uploadingId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
                      {s.cover_url ? tr("change_cover") : tr("add_cover")}
                    </button>
                    <button onClick={() => navigate("/create")} className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-foreground/60 hover:text-primary transition-soft">
                      <RotateCcw className="w-3 h-3" /> {tr("rewrite")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Library;
