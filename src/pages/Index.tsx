import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { Sparkles, Users, BookHeart } from "lucide-react";

const features = [
  { icon: Sparkles, title: "Choose your universe", desc: "Pick a trope that sets the mood — from forbidden bonds to royal romance." },
  { icon: Users, title: "Build your characters", desc: "Bring in anyone you love. Add yourself if you dare." },
  { icon: BookHeart, title: "Live your story", desc: "An immersive scene written just for you, in seconds." },
];

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <Header />
      <div className="bokeh absolute inset-0 pointer-events-none" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-24 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-primary/70 animate-fade-in">A private creative space</p>
        <h1 className="font-serif text-7xl md:text-9xl mt-6 text-foreground animate-fade-up">
          Tender
        </h1>
        <p className="font-serif italic text-2xl md:text-3xl text-primary mt-6 animate-fade-up delay-100">
          Your imagination, written.
        </p>
        <p className="max-w-xl mx-auto mt-6 text-muted-foreground text-lg animate-fade-up delay-200">
          Create your own immersive story with the characters you love — in seconds.
        </p>

        <div className="mt-12 animate-fade-up delay-300">
          <HeartButton glow onClick={() => navigate("/create")}>
            Start your story
          </HeartButton>
        </div>

        <section className="grid md:grid-cols-3 gap-6 mt-32">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group p-8 rounded-3xl bg-card/70 backdrop-blur-sm border border-border/50 shadow-card hover:shadow-soft transition-spring hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-rose flex items-center justify-center mx-auto mb-5 group-hover:animate-heartbeat">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-serif text-xl mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Index;
