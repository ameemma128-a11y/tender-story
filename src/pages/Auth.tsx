import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Heart } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate("/create"); });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/create` },
        });
        if (error) throw error;
        toast.success("Welcome to Tender ✨");
        navigate("/create");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/create");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/create` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center px-6">
      <Header />
      <div className="bokeh absolute inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-md p-10 rounded-3xl shadow-soft border border-border/50 animate-fade-up">
        <div className="flex flex-col items-center mb-8">
          <Heart className="w-8 h-8 text-primary fill-primary/30 animate-heartbeat" />
          <h1 className="font-serif text-3xl mt-3">{mode === "signin" ? "Welcome back" : "Begin your journey"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Step back into your stories" : "Your private world awaits"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 rounded-xl" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-rose text-primary-foreground hover:opacity-90 h-11 font-serif text-base">
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" onClick={handleGoogle} className="w-full rounded-full h-11">
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary underline-offset-4 hover:underline">
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
