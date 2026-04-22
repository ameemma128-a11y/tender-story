import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { id: "en", label: "EN", native: "English" },
  { id: "fr", label: "FR", native: "Français" },
  { id: "es", label: "ES", native: "Español" },
  { id: "pt", label: "PT", native: "Português" },
  { id: "ko", label: "KO", native: "한국어" },
  { id: "ja", label: "JA", native: "日本語" },
  { id: "ar", label: "AR", native: "العربية" },
  { id: "de", label: "DE", native: "Deutsch" },
  { id: "it", label: "IT", native: "Italiano" },
];

const NAV: Record<string, Record<string, string>> = {
  en: { library:"Library", write:"Write", exit:"Exit", enter:"Enter" },
  fr: { library:"Bibliothèque", write:"Écrire", exit:"Quitter", enter:"Entrer" },
  es: { library:"Biblioteca", write:"Escribir", exit:"Salir", enter:"Entrar" },
  pt: { library:"Biblioteca", write:"Escrever", exit:"Sair", enter:"Entrar" },
  ko: { library:"서재", write:"쓰기", exit:"나가기", enter:"입장" },
  ja: { library:"書架", write:"書く", exit:"退出", enter:"入る" },
  ar: { library:"المكتبة", write:"اكتب", exit:"خروج", enter:"دخول" },
  de: { library:"Bibliothek", write:"Schreiben", exit:"Abmelden", enter:"Eintreten" },
  it: { library:"Libreria", write:"Scrivi", exit:"Esci", enter:"Entra" },
};

export const Header = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem("tender_lang") || "en"; } catch { return "en"; }
  });
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const setLang = (l: string) => {
    try { localStorage.setItem("tender_lang", l); } catch {}
    setLangState(l);
    setLangOpen(false);
    window.location.reload();
  };

  const tr = (key: string) => NAV[lang]?.[key] ?? NAV.en[key] ?? key;
  const currentLang = LANGUAGES.find(l => l.id === lang) ?? LANGUAGES[0];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id ?? null));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    const onClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between transition-soft ${
      scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : ""
    }`}>
      <Link to="/" className="flex items-center gap-3 group">
        <span className="w-2 h-2 bg-primary rounded-full group-hover:shadow-amber transition-soft" />
        <span className="font-display text-2xl tracking-tight italic text-accent">Tender</span>
        <span className="hidden md:inline text-[10px] uppercase tracking-[0.35em] text-muted-foreground border-l border-border pl-3 ml-1 font-sans-ui">
          Vol. I
        </span>
      </Link>

      <nav className="flex items-center gap-4 md:gap-6 text-[11px] uppercase tracking-[0.3em]">

        {/* Language selector */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(o => !o)}
            className="flex items-center gap-1 text-foreground/60 hover:text-primary transition-soft font-sans-ui text-[10px]"
          >
            <span>{currentLang.label}</span>
            <ChevronDown className={cn("w-3 h-3 transition-soft", langOpen ? "rotate-180" : "")} />
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-2 bg-background border border-border z-50 min-w-[130px] shadow-lg">
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.2em] font-sans-ui transition-soft flex items-center justify-between gap-3",
                    lang === l.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-card hover:text-primary"
                  )}
                >
                  <span>{l.native}</span>
                  <span className="opacity-50 text-[8px]">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {userId ? (
          <>
            <button onClick={() => navigate("/library")} className="text-foreground/80 hover:text-primary transition-soft hidden sm:inline">
              {tr("library")}
            </button>
            <button onClick={() => navigate("/create")} className="text-foreground/80 hover:text-primary transition-soft hidden sm:inline">
              {tr("write")}
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
              className="text-foreground/60 hover:text-primary transition-soft"
            >
              {tr("exit")}
            </button>
          </>
        ) : (
          <button onClick={() => navigate("/auth")} className="text-foreground/80 hover:text-primary transition-soft">
            {tr("enter")}
          </button>
        )}
      </nav>
    </header>
  );
};
