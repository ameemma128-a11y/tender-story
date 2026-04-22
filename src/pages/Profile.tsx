import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { Loader2, BookHeart } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <Header />
      <div className="bokeh absolute inset-0 pointer-events-none" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-12 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Your private library</p>
          <h1 className="font-serif text-5xl mt-3">My stories</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 animate-fade-up">
            <BookHeart className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-8">Your library is waiting for its first story.</p>
            <HeartButton glow onClick={() => navigate("/create")}>Start your story</HeartButton>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {stories.map((s, i) => (
              <button key={s.id} onClick={() => navigate(`/story/${s.id}`)}
                className="text-left p-7 rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-card hover:shadow-soft transition-spring hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="inline-block text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground mb-4">
                  {TEMPLATE_LABELS[s.template] ?? s.template}
                </span>
                <h3 className="font-serif text-2xl mb-2 leading-tight">{s.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{s.content.slice(0, 140)}…</p>
                <p className="text-xs text-muted-foreground/80">
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
