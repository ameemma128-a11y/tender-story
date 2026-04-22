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
      toast.success("Story copied to clipboard");
    } catch { toast.error("Could not copy"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-reading flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-reading relative">
      <Header />
      <article className="max-w-2xl mx-auto px-6 pt-32 pb-20 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/70 text-center">Your story</p>
        <h1 className="font-serif text-5xl md:text-6xl text-center mt-4 mb-12 leading-tight">{story.title}</h1>

        <div className="font-serif text-lg leading-[1.9] text-foreground/90 whitespace-pre-wrap">
          {story.content}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-16 pt-8 border-t border-border/50">
          <Button onClick={() => toast.success("Saved to your profile ✨")} className="rounded-full bg-gradient-rose text-primary-foreground hover:opacity-90">
            <Bookmark className="w-4 h-4 mr-1.5" /> Save to my profile
          </Button>
          <Button variant="outline" onClick={handleShare} className="rounded-full">
            <Share2 className="w-4 h-4 mr-1.5" /> Share my story
          </Button>
          <Button variant="ghost" onClick={() => navigate("/create")} className="rounded-full">
            Write another
          </Button>
        </div>
      </article>
    </div>
  );
};

export default Story;
