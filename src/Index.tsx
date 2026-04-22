import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { HeroSphere } from "@/components/HeroSphere";

const T: Record<string, Record<string, string>> = {
  en: { tagline:"Every imagination deserves to be written.", cta:"Begin your story", cta2:"Create your story", how:"How it works", steps:"Three simple steps.", steps_sub:"One story made for you.", s1_title:"Pick a world", s1_desc:"Choose a genre that sparks you — from royal romance to fantasy academies. The mood is yours to set.", s2_title:"Bring your characters", s2_desc:"Real, fictional, or somewhere in between. Build the cast you want to read about.", s3_title:"Read your story", s3_desc:"An immersive scene, written for you in seconds. Save it, share it, keep it forever.", closing:"Your next story is", closing_bold:"waiting.", closing_sub:"Bring your imagination to the page. It only takes a few seconds." },
  fr: { tagline:"Chaque imagination mérite d'être écrite.", cta:"Commencer mon histoire", cta2:"Créer mon histoire", how:"Comment ça marche", steps:"Trois étapes simples.", steps_sub:"Une histoire écrite pour vous.", s1_title:"Choisir un univers", s1_desc:"Sélectionnez un genre — de la romance royale aux académies fantastiques.", s2_title:"Vos personnages", s2_desc:"Réels, fictifs ou quelque part entre les deux.", s3_title:"Lire votre histoire", s3_desc:"Une scène immersive, écrite en quelques secondes.", closing:"Votre prochaine histoire vous", closing_bold:"attend.", closing_sub:"Donnez vie à votre imagination." },
  es: { tagline:"Cada imaginación merece ser escrita.", cta:"Comenzar mi historia", cta2:"Crear mi historia", how:"Cómo funciona", steps:"Tres pasos simples.", steps_sub:"Una historia hecha para ti.", s1_title:"Elige un mundo", s1_desc:"Elige un género que te inspire.", s2_title:"Tus personajes", s2_desc:"Reales, ficticios o algo intermedio.", s3_title:"Lee tu historia", s3_desc:"Una escena inmersiva, escrita en segundos.", closing:"Tu próxima historia te", closing_bold:"espera.", closing_sub:"Dale vida a tu imaginación." },
  pt: { tagline:"Cada imaginação merece ser escrita.", cta:"Começar minha história", cta2:"Criar minha história", how:"Como funciona", steps:"Três passos simples.", steps_sub:"Uma história feita para você.", s1_title:"Escolha um mundo", s1_desc:"Escolha um gênero que te inspire.", s2_title:"Seus personagens", s2_desc:"Reais, fictícios ou algo no meio.", s3_title:"Leia sua história", s3_desc:"Uma cena imersiva, escrita em segundos.", closing:"Sua próxima história está", closing_bold:"esperando.", closing_sub:"Dê vida à sua imaginação." },
  ko: { tagline:"모든 상상은 글로 쓰일 자격이 있습니다.", cta:"내 이야기 시작하기", cta2:"내 이야기 만들기", how:"이용 방법", steps:"세 가지 간단한 단계.", steps_sub:"당신만을 위한 이야기.", s1_title:"세계 선택", s1_desc:"장르를 선택하세요.", s2_title:"캐릭터 소개", s2_desc:"실제이든 가상이든.", s3_title:"이야기 읽기", s3_desc:"몇 초 만에 쓰인 몰입감 있는 장면.", closing:"다음 이야기가 당신을", closing_bold:"기다립니다.", closing_sub:"상상력을 글로 옮겨보세요." },
  ja: { tagline:"すべての想像は、書かれる価値がある。", cta:"物語を始める", cta2:"物語を作る", how:"使い方", steps:"シンプルな3ステップ。", steps_sub:"あなたのための物語。", s1_title:"世界を選ぶ", s1_desc:"ジャンルを選んでください。", s2_title:"キャラクターを連れてくる", s2_desc:"実在、架空、どちらでも。", s3_title:"物語を読む", s3_desc:"数秒で書かれた没入感のある場面。", closing:"次の物語が", closing_bold:"待っています。", closing_sub:"想像力をページに込めましょう。" },
  ar: { tagline:"كل خيال يستحق أن يُكتب.", cta:"ابدأ قصتي", cta2:"أنشئ قصتي", how:"كيف يعمل", steps:"ثلاث خطوات بسيطة.", steps_sub:"قصة مصنوعة لك.", s1_title:"اختر عالماً", s1_desc:"اختر نوعاً يلهمك.", s2_title:"أحضر شخصياتك", s2_desc:"حقيقيون أو خياليون.", s3_title:"اقرأ قصتك", s3_desc:"مشهد غامر، مكتوب لك في ثوانٍ.", closing:"قصتك التالية", closing_bold:"تنتظرك.", closing_sub:"أعطِ خيالك صوتاً." },
  de: { tagline:"Jede Vorstellung verdient es, geschrieben zu werden.", cta:"Meine Geschichte beginnen", cta2:"Meine Geschichte erstellen", how:"So funktioniert es", steps:"Drei einfache Schritte.", steps_sub:"Eine Geschichte für dich.", s1_title:"Wähle eine Welt", s1_desc:"Wähle ein Genre.", s2_title:"Bringe deine Charaktere", s2_desc:"Real, fiktiv oder irgendwo dazwischen.", s3_title:"Lies deine Geschichte", s3_desc:"Eine immersive Szene, in Sekunden geschrieben.", closing:"Deine nächste Geschichte", closing_bold:"wartet.", closing_sub:"Bring deine Fantasie auf die Seite." },
  it: { tagline:"Ogni immaginazione merita di essere scritta.", cta:"Inizia la mia storia", cta2:"Crea la mia storia", how:"Come funziona", steps:"Tre semplici passi.", steps_sub:"Una storia fatta per te.", s1_title:"Scegli un mondo", s1_desc:"Scegli un genere.", s2_title:"Porta i tuoi personaggi", s2_desc:"Reali, fittizi o qualcosa nel mezzo.", s3_title:"Leggi la tua storia", s3_desc:"Una scena immersiva, scritta in secondi.", closing:"La tua prossima storia ti", closing_bold:"aspetta.", closing_sub:"Porta la tua immaginazione sulla pagina." },
  zh: { tagline:"每一个想象都值得被书写。", cta:"开始我的故事", cta2:"创作我的故事", how:"如何使用", steps:"简单三步。", steps_sub:"专属于你的故事。", s1_title:"选择世界", s1_desc:"选择一个激励你的类型。", s2_title:"带来你的角色", s2_desc:"真实的、虚构的，或介于两者之间。", s3_title:"阅读你的故事", s3_desc:"几秒钟内为你写好的沉浸式场景。", closing:"你的下一个故事正在", closing_bold:"等待。", closing_sub:"把你的想象力带到页面上。" },
};

const Index = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("tender_lang") || "en"; } catch { return "en"; } });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    const interval = setInterval(() => {
      try { const l = localStorage.getItem("tender_lang") || "en"; setLang(l); } catch {}
    }, 500);
    return () => { window.removeEventListener("scroll", onScroll); clearInterval(interval); };
  }, []);

  const tr = (key: string) => T[lang]?.[key] ?? T.en[key] ?? key;

  const chapters = [
    { num: "01", title: tr("s1_title"), desc: tr("s1_desc") },
    { num: "02", title: tr("s2_title"), desc: tr("s2_desc") },
    { num: "03", title: tr("s3_title"), desc: tr("s3_desc") },
  ];

  return (
    <div className="min-h-screen bg-background grain relative">
      <Header />
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-gradient-noir">
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0005})`, opacity: Math.max(0, 1 - scrollY / 700) }}>
          <HeroSphere />
        </div>
        <div className="absolute inset-0 bg-gradient-aurora pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
        <div className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 vertical-text text-[10px] uppercase tracking-[0.5em] text-muted-foreground z-10" style={{ transform: `translateY(calc(-50% + ${scrollY * -0.15}px))` }}>
          A Creative Platform for Storytellers — MMXXVI
        </div>
        <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 vertical-text text-[10px] uppercase tracking-[0.5em] text-muted-foreground z-10" style={{ transform: `translateY(calc(-50% + ${scrollY * -0.1}px)) rotate(180deg)` }}>
          Issue No. 001 — Imagine
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center" style={{ transform: `translateY(${scrollY * -0.25}px)`, opacity: Math.max(0, 1 - scrollY / 500) }}>
          <h1 className="font-display text-[26vw] md:text-[16vw] leading-[0.85] text-accent italic animate-fade-up drop-shadow-[0_0_60px_hsl(38_70%_55%/0.35)]">Tender</h1>
          <p className="font-serif italic text-xl md:text-2xl text-foreground/85 mt-10 animate-fade-up delay-200 max-w-2xl text-balance">{tr("tagline")}</p>
          <div className="mt-16 animate-fade-up delay-300">
            <HeartButton glow onClick={() => navigate("/create")}>{tr("cta")}</HeartButton>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in delay-700">
          <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      <section className="relative py-8 border-y border-border/50 overflow-hidden bg-background">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6 font-display text-3xl md:text-5xl text-foreground/30">
              {["IMAGINE","CREATE","WRITE","EXPLORE","DREAM","BUILD","STORY","WORLDS"].map((w) => (
                <span key={w+i} className="flex items-center gap-12"><span>{w}</span><span className="text-primary text-xl">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-32 md:py-48 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-4">— {tr("how")} —</p>
          <h2 className="font-display text-5xl md:text-7xl text-balance">{tr("steps")}<br /><span className="italic font-normal text-muted-foreground">{tr("steps_sub")}</span></h2>
        </div>
        <div className="space-y-px">
          {chapters.map((c) => (
            <div key={c.num} className="group grid md:grid-cols-12 gap-6 md:gap-12 py-12 md:py-16 border-t border-border hover:border-primary transition-soft">
              <div className="md:col-span-2 font-display text-6xl md:text-7xl text-primary/40 group-hover:text-primary transition-soft">{c.num}</div>
              <div className="md:col-span-4"><h3 className="font-display text-3xl md:text-4xl">{c.title}</h3></div>
              <div className="md:col-span-6 flex items-center"><p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed text-balance">{c.desc}</p></div>
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      </section>

      <section className="relative py-32 md:py-48 px-6 text-center bg-gradient-noir border-t border-border">
        <div className="absolute inset-0 bg-gradient-aurora opacity-50" />
        <div className="relative max-w-3xl mx-auto">
          <h2 className="font-display text-5xl md:text-7xl text-balance leading-[0.95]">{tr("closing")} <span className="italic text-primary">{tr("closing_bold")}</span></h2>
          <p className="text-muted-foreground mt-8 max-w-lg mx-auto font-light">{tr("closing_sub")}</p>
          <div className="mt-12"><HeartButton glow onClick={() => navigate("/create")}>{tr("cta2")}</HeartButton></div>
        </div>
      </section>

      <footer className="border-t border-border py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        <span>© MMXXVI — Tender</span>
        <span>A Creative Platform · Vol. I</span>
      </footer>
    </div>
  );
};

export default Index;
