import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang, UI_LANGUAGES } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Header = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { lang, setLang, tr } = useLang();

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

  const currentLang = UI_LANGUAGES.find(l => l.id === lang);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between transition-soft ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : ""
      }`}
    >
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
            className="flex items-center gap-1.5 text-foreground/60 hover:text-primary transition-soft font-sans-ui"
          >
            <span>{currentLang?.native}</span>
            <ChevronDown className={cn("w-3 h-3 transition-soft", langOpen ? "rotate-180" : "")} />
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-2 bg-background border border-border shadow-luxe z-50 min-w-[140px]">
              {UI_LANGUAGES.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setLang(l.id); setLangOpen(false); }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.2em] font-sans-ui transition-soft flex items-center justify-between",
                    lang === l.id ? "bg-primary text-primary-foreground" : "hover:bg-card hover:text-primary"
                  )}
                >
                  <span>{l.native}</span>
                  {lang === l.id && <span className="text-[8px]">✦</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {userId ? (
          <>
            <button onClick={() => navigate("/library")} className="text-foreground/80 hover:text-primary transition-soft">
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
