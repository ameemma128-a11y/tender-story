import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const Header = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <Heart className="w-5 h-5 text-primary fill-primary/40 group-hover:animate-heartbeat" />
        <span className="font-serif text-2xl text-foreground">Tender</span>
      </Link>
      <nav className="flex items-center gap-2">
        {userId ? (
          <>
            <Button variant="ghost" onClick={() => navigate("/profile")}>My stories</Button>
            <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>Sign out</Button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => navigate("/auth")}>Sign in</Button>
        )}
      </nav>
    </header>
  );
};
