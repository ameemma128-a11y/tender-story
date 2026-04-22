import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { toast } from "sonner";

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
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/create` },
        });
        if (error) {
          if ((error as any).code === "weak_password" || /weak|pwned/i.test(error.message)) {
            throw new Error("This password has appeared in a data breach. Please choose a stronger one.");
          }
          if (/already/i.test(error.message)) {
            throw new Error("An account with this email already exists. Try signing in instead.");
          }
          throw error;
        }
        if (data.session) {
          toast.success("Welcome to Tender");
          navigate("/create");
        } else {
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            toast.success("Account created. You can sign in now.");
            setMode("signin");
          } else {
            navigate("/create");
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (/invalid/i.test(error.message)) {
            throw new Error("Wrong email or password.");
          }
          throw error;
        }
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
    <div className="min-h-screen bg-gradient-noir relative overflow-hidden flex items-center justify-center px-6 grain">
      <Header />
      <div className="absolute inset-0 bg-gradient-ember opacity-40 pointer-events-none" />
      {/* Decorative crimson ring */}
      <div className="absolute -left-40 -top-40 w-[500px] h-[500px] rounded-full border border-primary/20 pointer-events-none" />
      <div className="absolute -right-60 -bottom-60 w-[700px] h-[700px] rounded-full border border-primary/10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-12 bg-card/60 backdrop-blur-xl border border-border animate-fade-up shadow-luxe">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-4">— Tender —</p>
          <h1 className="font-display text-4xl leading-tight">
            {mode === "signin" ? "Welcome back." : "Let's get started."}
          </h1>
          <p className="text-sm text-muted-foreground mt-3 font-light">
            {mode === "signin" ? "Your stories are waiting where you left them." : "Your creative space, ready when you are."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 rounded-none h-12 bg-transparent border-0 border-b border-border focus-visible:ring-0 focus-visible:border-primary px-0 font-serif text-base" />
          </div>
          <div>
            <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 rounded-none h-12 bg-transparent border-0 border-b border-border focus-visible:ring-0 focus-visible:border-primary px-0 font-serif text-base" />
          </div>

          <div className="pt-4">
            <HeartButton type="submit" disabled={loading} className="w-full">
              {loading ? "..." : mode === "signin" ? "Enter" : "Begin"}
            </HeartButton>
          </div>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.4em]">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" onClick={handleGoogle}
          className="w-full rounded-none h-12 border-border hover:border-primary hover:text-primary hover:bg-transparent text-[11px] uppercase tracking-[0.3em]">
          Continue with Google
        </Button>

        <p className="text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-8">
          {mode === "signin" ? "New here?" : "Already inside?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline underline-offset-4 ml-1">
            {mode === "signin" ? "Begin a volume" : "Re-enter"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
