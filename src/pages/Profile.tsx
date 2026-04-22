import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { Loader2, BookOpen } from "lucide-react";

const TEMPLATE_LABELS: Record<string, string> = {
  "toxic-love": "Toxic Love", "enemies-to-lovers": "Enemies to Lovers",
  "royal-romance": "Royal Romance", "fantasy-academy": "Fantasy Academy",
  "villains-revenge": "Villain's Revenge", "secret-admirer": "Secret Admirer",
  "arranged-marriage": "Arranged Marriage", "forbidden-bond": "Forbidden Bond",
};

const Profile = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth"); return; }
      const { data } = await supabase.from("stories").select("*").order("created_at", { ascending: false });
      setStories(data ?? []);
      setLoading(false);
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-noir relative grain">
      <Header />
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-ember opacity-25 pointer-events-none" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-20">
        <div className="mb-16 animate-fade-up flex items-end justify-between border-b border-border pb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3">— Your Library —</p>
            <h1 className="font-display text-6xl md:text-7xl">Your Stories</h1>
          </div>
          <span className="hidden md:block text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            {stories.length} {stories.length === 1 ? "Entry" : "Entries"}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : stories.length === 0 ? (
          <div className="text-center py-32 animate-fade-up">
            <BookOpen className="w-10 h-10 text-primary/40 mx-auto mb-6" />
            <p className="text-muted-foreground mb-10 font-light tracking-wide">Your library is waiting for its first story.</p>
            <HeartButton glow onClick={() => navigate("/create")}>Write your first story</HeartButton>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {stories.map((s, i) => (
              <button key={s.id} onClick={() => navigate(`/story/${s.id}`)}
                className="group text-left p-8 bg-background hover:bg-card transition-soft animate-fade-up min-h-[280px] flex flex-col"
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                    {TEMPLATE_LABELS[s.template] ?? s.template}
                  </span>
                  <span className="font-display text-xs text-muted-foreground">
                    № {String(stories.length - i).padStart(3, "0")}
                  </span>
                </div>
                <h3 className="font-display text-3xl mb-4 leading-tight group-hover:text-primary transition-soft">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 font-light leading-relaxed flex-1">
                  {s.content.slice(0, 180)}…
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 pt-4 border-t border-border/50">
                  {new Date(s.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
