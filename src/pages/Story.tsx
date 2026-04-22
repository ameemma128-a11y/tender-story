import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Bookmark, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Story = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth"); return; }
      const { data, error } = await supabase.from("stories").select("*").eq("id", id).maybeSingle();
      if (error || !data) { toast.error("Story not found"); navigate("/profile"); return; }
      setStory(data);
      setLoading(false);
    })();
  }, [id, navigate]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${story.title}\n\n${story.content}`);
      toast.success("Copied to clipboard");
    } catch { toast.error("Could not copy"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-reading relative grain">
      <Header />

      {/* Crimson glow header */}
      <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-ember opacity-40 pointer-events-none" />

      <article className="relative max-w-2xl mx-auto px-6 pt-40 pb-20 animate-fade-up">
        <p className="text-[10px] uppercase tracking-[0.5em] text-primary text-center">— A Tender Composition —</p>
        <h1 className="font-display text-5xl md:text-7xl text-center mt-8 mb-4 leading-[0.95] text-balance">
          {story.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-16">
          <span>{new Date(story.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="w-1 h-1 bg-primary rounded-full" />
          <span>{story.length === "short" ? "Short scene" : story.length === "chapter" ? "One chapter" : "Multi-chapter"}</span>
        </div>

        <div className="font-serif text-lg md:text-xl leading-[1.85] text-foreground/90 whitespace-pre-wrap first-letter:font-display first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary first-letter:leading-[0.85]">
          {story.content}
        </div>

        <div className="mt-20 pt-10 border-t border-border flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => toast.success("Kept in your archive")} variant="outline"
            className="rounded-none border-border hover:border-primary hover:text-primary text-[11px] uppercase tracking-[0.3em] h-11 px-6">
            <Bookmark className="w-3.5 h-3.5 mr-2" /> Keep
          </Button>
          <Button variant="outline" onClick={handleShare}
            className="rounded-none border-border hover:border-primary hover:text-primary text-[11px] uppercase tracking-[0.3em] h-11 px-6">
            <Share2 className="w-3.5 h-3.5 mr-2" /> Share
          </Button>
          <Button variant="ghost" onClick={() => navigate("/create")}
            className="rounded-none text-[11px] uppercase tracking-[0.3em] h-11 px-6 hover:text-primary hover:bg-transparent">
            Compose another
          </Button>
        </div>
      </article>
    </div>
  );
};

export default Story;
