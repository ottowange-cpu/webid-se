import { Brain, Shield, Zap, Lock, AlertTriangle, Eye } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Driven Analys",
    description: "Vår avancerade AI analyserar webbsidor i realtid och identifierar bedrägliga mönster.",
    gradient: "from-primary to-cyan-400",
  },
  {
    icon: Shield,
    title: "Automatisk Blockering",
    description: "Farliga webbplatser blockeras automatiskt innan du ens hinner se dem.",
    gradient: "from-primary to-emerald-400",
  },
  {
    icon: Zap,
    title: "Blixtsnabbt Skydd",
    description: "Skyddet aktiveras på millisekunder utan att påverka din surfhastighet.",
    gradient: "from-warning to-orange-400",
  },
  {
    icon: Lock,
    title: "Betalningsskydd",
    description: "Extra säkerhet vid online-shopping med verifiering av betalningssidor.",
    gradient: "from-accent to-pink-400",
  },
  {
    icon: AlertTriangle,
    title: "Phishing-Detektion",
    description: "Identifierar phishing-försök som imiterar legitima webbplatser.",
    gradient: "from-destructive to-red-400",
  },
  {
    icon: Eye,
    title: "Realtidsövervakning",
    description: "Kontinuerlig scanning av alla webbplatser du besöker.",
    gradient: "from-blue-500 to-indigo-400",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-32 px-4 relative">
      <div className="absolute inset-0 pointer-events-none bg-gradient-mesh opacity-50" />

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Funktioner</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Kraftfullt <span className="text-gradient">AI-Skydd</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Upptäck hur vår teknik håller dig säker från de senaste hoten på internet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative glass rounded-2xl p-8 hover:border-primary/30 transition-all duration-500 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-gradient transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};