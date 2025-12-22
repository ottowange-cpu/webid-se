import { Brain, Shield, Zap, Lock, AlertTriangle } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Driven Analys",
    description: "Vår avancerade AI analyserar webbsidor i realtid och identifierar bedrägliga mönster innan de kan skada dig.",
  },
  {
    icon: Shield,
    title: "Automatisk Blockering",
    description: "Farliga webbplatser blockeras automatiskt innan du ens hinner se dem, vilket ger dig sömlöst skydd.",
  },
  {
    icon: Zap,
    title: "Blixtsnabbt Skydd",
    description: "Skyddet aktiveras på millisekunder utan att påverka din surfhastighet eller upplevelse.",
  },
  {
    icon: Lock,
    title: "Betalningsskydd",
    description: "Extra säkerhet när du handlar online, med verifiering av betalningssidor och certifikat.",
  },
  {
    icon: AlertTriangle,
    title: "Phishing-Detektion",
    description: "Identifierar och blockerar phishing-försök som försöker imitera legitima webbplatser.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Kraftfullt <span className="text-gradient">AI-Skydd</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upptäck hur vår teknik håller dig säker från de senaste hoten på internet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-gradient-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
