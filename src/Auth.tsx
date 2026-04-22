import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { toast } from "sonner";

const T: Record<string, Record<string, string>> = {
  en: { welcome:"Welcome back.", start:"Let's get started.", waiting:"Your stories are waiting where you left them.", ready:"Your creative space, ready when you are.", email:"Email", password:"Password", enter:"Enter", begin:"Begin", or:"or", google:"Continue with Google", new_here:"New here?", already:"Already inside?", begin_vol:"Begin a volume", re_enter:"Re-enter" },
  fr: { welcome:"Bon retour.", start:"Commençons.", waiting:"Vos histoires vous attendent là où vous les avez laissées.", ready:"Votre espace créatif, prêt quand vous l'êtes.", email:"Email", password:"Mot de passe", enter:"Entrer", begin:"Commencer", or:"ou", google:"Continuer avec Google", new_here:"Nouveau ici ?", already:"Déjà inscrit ?", begin_vol:"Créer un compte", re_enter:"Se connecter" },
  es: { welcome:"Bienvenido de nuevo.", start:"Comencemos.", waiting:"Tus historias te esperan donde las dejaste.", ready:"Tu espacio creativo, listo cuando tú lo estés.", email:"Email", password:"Contraseña", enter:"Entrar", begin:"Comenzar", or:"o", google:"Continuar con Google", new_here:"¿Nuevo aquí?", already:"¿Ya tienes cuenta?", begin_vol:"Crear cuenta", re_enter:"Iniciar sesión" },
  pt: { welcome:"Bem-vindo de volta.", start:"Vamos começar.", waiting:"Suas histórias esperam onde você as deixou.", ready:"Seu espaço criativo, pronto quando você estiver.", email:"Email", password:"Senha", enter:"Entrar", begin:"Começar", or:"ou", google:"Continuar com Google", new_here:"Novo aqui?", already:"Já tem conta?", begin_vol:"Criar conta", re_enter:"Entrar" },
  ko: { welcome:"다시 오셨군요.", start:"시작해봅시다.", waiting:"이야기들이 기다리고 있어요.", ready:"당신의 창작 공간이 준비되었습니다.", email:"이메일", password:"비밀번호", enter:"입장", begin:"시작", or:"또는", google:"Google로 계속하기", new_here:"처음이신가요?", already:"이미 계정이 있나요?", begin_vol:"계정 만들기", re_enter:"로그인" },
  ja: { welcome:"おかえりなさい。", start:"始めましょう。", waiting:"あなたの物語が待っています。", ready:"創作空間の準備ができています。", email:"メール", password:"パスワード", enter:"入る", begin:"始める", or:"または", google:"Googleで続ける", new_here:"初めての方？", already:"すでにアカウントをお持ちですか？", begin_vol:"アカウント作成", re_enter:"サインイン" },
  ar: { welcome:"أهلاً بعودتك.", start:"لنبدأ.", waiting:"قصصك تنتظرك.", ready:"مساحتك الإبداعية جاهزة.", email:"البريد الإلكتروني", password:"كلمة المرور", enter:"دخول", begin:"ابدأ", or:"أو", google:"المتابعة مع Google", new_here:"جديد هنا؟", already:"لديك حساب؟", begin_vol:"إنشاء حساب", re_enter:"تسجيل الدخول" },
  de: { welcome:"Willkommen zurück.", start:"Legen wir los.", waiting:"Deine Geschichten warten, wo du sie gelassen hast.", ready:"Dein kreativer Raum ist bereit.", email:"E-Mail", password:"Passwort", enter:"Eintreten", begin:"Beginnen", or:"oder", google:"Mit Google fortfahren", new_here:"Neu hier?", already:"Schon dabei?", begin_vol:"Konto erstellen", re_enter:"Anmelden" },
  it: { welcome:"Bentornato.", start:"Iniziamo.", waiting:"Le tue storie ti aspettano dove le hai lasciate.", ready:"Il tuo spazio creativo è pronto.", email:"Email", password:"Password", enter:"Entra", begin:"Inizia", or:"o", google:"Continua con Google", new_here:"Nuovo qui?", already:"Hai già un account?", begin_vol:"Crea account", re_enter:"Accedi" },
  zh: { welcome:"欢迎回来。", start:"让我们开始吧。", waiting:"你的故事在你离开的地方等待着。", ready:"你的创作空间，随时为你准备。", email:"邮箱", password:"密码", enter:"进入", begin:"开始", or:"或", google:"使用 Google 继续", new_here:"第一次来？", already:"已有账户？", begin_vol:"创建账户", re_enter:"登录" },
};

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang] = useState(() => { try { return localStorage.getItem("tender_lang") || "en"; } catch { return "en"; } });
  const tr = (k: string) => T[lang]?.[k] ?? T.en[k] ?? k;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate("/create"); });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/create` } });
        if (error) {
          if ((error as any).code === "weak_password" || /weak|pwned/i.test(error.message)) throw new Error("This password has appeared in a data breach. Please choose a stronger one.");
          if (/already/i.test(error.message)) throw new Error("An account with this email already exists. Try signing in instead.");
          throw error;
        }
        if (data.session) { toast.success("Welcome to Tender"); navigate("/create"); }
        else {
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) { toast.success("Account created. You can sign in now."); setMode("signin"); }
          else navigate("/create");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { if (/invalid/i.test(error.message)) throw new Error("Wrong email or password."); throw error; }
        navigate("/create");
      }
    } catch (err: any) { toast.error(err.message ?? "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/create` } });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-noir relative overflow-hidden flex items-center justify-center px-6 grain">
      <Header />
      <div className="absolute inset-0 bg-gradient-ember opacity-40 pointer-events-none" />
      <div className="absolute -left-40 -top-40 w-[500px] h-[500px] rounded-full border border-primary/20 pointer-events-none" />
      <div className="absolute -right-60 -bottom-60 w-[700px] h-[700px] rounded-full border border-primary/10 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md p-12 bg-card/60 backdrop-blur-xl border border-border animate-fade-up shadow-luxe">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-4">— Tender —</p>
          <h1 className="font-display text-4xl leading-tight">{mode === "signin" ? tr("welcome") : tr("start")}</h1>
          <p className="text-sm text-muted-foreground mt-3 font-light">{mode === "signin" ? tr("waiting") : tr("ready")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{tr("email")}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-none h-12 bg-transparent border-0 border-b border-border focus-visible:ring-0 focus-visible:border-primary px-0 font-serif text-base" />
          </div>
          <div>
            <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{tr("password")}</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 rounded-none h-12 bg-transparent border-0 border-b border-border focus-visible:ring-0 focus-visible:border-primary px-0 font-serif text-base" />
          </div>
          <div className="pt-4">
            <HeartButton type="submit" disabled={loading} className="w-full">
              {loading ? "..." : mode === "signin" ? tr("enter") : tr("begin")}
            </HeartButton>
          </div>
        </form>
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.4em]">{tr("or")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <Button variant="outline" onClick={handleGoogle} className="w-full rounded-none h-12 border-border hover:border-primary hover:text-primary hover:bg-transparent text-[11px] uppercase tracking-[0.3em]">
          {tr("google")}
        </Button>
        <p className="text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-8">
          {mode === "signin" ? tr("new_here") : tr("already")}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline underline-offset-4 ml-1">
            {mode === "signin" ? tr("begin_vol") : tr("re_enter")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
