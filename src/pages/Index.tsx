import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { HeroSphere } from "@/components/HeroSphere";

const chapters = [
  { num: "01", title: "Pick a world", desc: "Choose a genre that sparks you — from royal romance to fantasy academies. The mood is yours to set." },
  { num: "02", title: "Bring your characters", desc: "Real, fictional, or somewhere in between. Build the cast you want to read about." },
  { num: "03", title: "Read your story", desc: "An immersive scene, written for you in seconds. Save it, share it, keep it forever." },
];

const Index = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background grain relative">
      <Header />

      {/* HERO */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-gradient-noir">
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0005})`,
            opacity: Math.max(0, 1 - scrollY / 700),
          }}
        >
          <HeroSphere />
        </div>

        <div className="absolute inset-0 bg-gradient-aurora pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div
          className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 vertical-text text-[10px] uppercase tracking-[0.5em] text-muted-foreground z-10"
          style={{ transform: `translateY(calc(-50% + ${scrollY * -0.15}px))` }}
        >
          A Creative Platform for Storytellers — MMXXVI
        </div>
        <div
          className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 vertical-text text-[10px] uppercase tracking-[0.5em] text-muted-foreground z-10"
          style={{ transform: `translateY(calc(-50% + ${scrollY * -0.1}px)) rotate(180deg)` }}
        >
          Issue No. 001 — Imagine
        </div>

        <div
          className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
          style={{ transform: `translateY(${scrollY * -0.25}px)`, opacity: Math.max(0, 1 - scrollY / 500) }}
        >
          <h1 className="font-display text-[26vw] md:text-[16vw] leading-[0.85] text-accent italic animate-fade-up drop-shadow-[0_0_60px_hsl(38_70%_55%/0.35)]">
            Tender
          </h1>
          <p className="font-serif italic text-xl md:text-2xl text-foreground/85 mt-10 animate-fade-up delay-200 max-w-2xl text-balance">
            Every imagination deserves to be written.
          </p>

          <div className="mt-16 animate-fade-up delay-300">
            <HeartButton glow onClick={() => navigate("/create")}>
              Begin your story
            </HeartButton>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in delay-700">
          <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative py-8 border-y border-border/50 overflow-hidden bg-background">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6 font-display text-3xl md:text-5xl text-foreground/30">
              {["IMAGINE", "CREATE", "WRITE", "EXPLORE", "DREAM", "BUILD", "STORY", "WORLDS"].map((w) => (
                <span key={w + i} className="flex items-center gap-12">
                  <span>{w}</span>
                  <span className="text-primary text-xl">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CHAPTERS */}
      <section className="relative py-32 md:py-48 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-4">— How it works —</p>
          <h2 className="font-display text-5xl md:text-7xl text-balance">
            Three simple steps.<br/>
            <span className="italic font-normal text-muted-foreground">One story made for you.</span>
          </h2>
        </div>

        <div className="space-y-px">
          {chapters.map((c) => (
            <div
              key={c.num}
              className="group grid md:grid-cols-12 gap-6 md:gap-12 py-12 md:py-16 border-t border-border hover:border-primary transition-soft"
            >
              <div className="md:col-span-2 font-display text-6xl md:text-7xl text-primary/40 group-hover:text-primary transition-soft">
                {c.num}
              </div>
              <div className="md:col-span-4">
                <h3 className="font-display text-3xl md:text-4xl">{c.title}</h3>
              </div>
              <div className="md:col-span-6 flex items-center">
                <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed text-balance">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative py-32 md:py-48 px-6 text-center bg-gradient-noir border-t border-border">
        <div className="absolute inset-0 bg-gradient-aurora opacity-50" />
        <div className="relative max-w-3xl mx-auto">
          <h2 className="font-display text-5xl md:text-7xl text-balance leading-[0.95]">
            Your next story is <span className="italic text-primary">waiting</span>.
          </h2>
          <p className="text-muted-foreground mt-8 max-w-lg mx-auto font-light">
            Bring your imagination to the page. It only takes a few seconds.
          </p>
          <div className="mt-12">
            <HeartButton glow onClick={() => navigate("/create")}>
              Create your story
            </HeartButton>
          </div>
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
