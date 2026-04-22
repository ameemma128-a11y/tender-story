import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id ?? null));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-8 md:px-12 py-5 flex items-center justify-between transition-soft ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : ""
      }`}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <span className="w-2 h-2 bg-primary rounded-full group-hover:shadow-crimson transition-soft" />
        <span className="font-display text-xl tracking-tight">TENDER</span>
        <span className="hidden md:inline text-[10px] uppercase tracking-[0.35em] text-muted-foreground border-l border-border pl-3 ml-1">
          Vol. I
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-[11px] uppercase tracking-[0.3em]">
        {userId ? (
          <>
            <button onClick={() => navigate("/library")} className="text-foreground/80 hover:text-primary transition-soft">
              Library
            </button>
            <button onClick={() => navigate("/create")} className="text-foreground/80 hover:text-primary transition-soft hidden sm:inline">
              Write
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
              className="text-foreground/60 hover:text-primary transition-soft"
            >
              Exit
            </button>
          </>
        ) : (
          <button onClick={() => navigate("/auth")} className="text-foreground/80 hover:text-primary transition-soft">
            Enter
          </button>
        )}
      </nav>
    </header>
  );
};
