import { Globe, Scan, ShieldCheck, ShieldX } from "lucide-react";

const steps = [
  {
    icon: Globe,
    step: "01",
    title: "Du besöker en webbplats",
    description: "När du navigerar till en ny webbsida aktiveras vårt skydd automatiskt.",
  },
  {
    icon: Scan,
    step: "02",
    title: "AI analyserar sidan",
    description: "Vår AI skannar webbplatsen efter kända bedrägerimönster, falska certifikat och misstänkt beteende.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Säker eller blockerad",
    description: "Om sidan är säker fortsätter du som vanligt. Om den är farlig blockeras den omedelbart.",
  },
  {
    icon: ShieldX,
    step: "04",
    title: "Du skyddas",
    description: "Du får en varning och kan välja att gå tillbaka i säkerhet utan risk för dataförlust.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hur <span className="text-gradient">det fungerar</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fyra enkla steg som skyddar dig varje gång du surfar på nätet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-card border border-border flex items-center justify-center group hover:border-primary/50 transition-all duration-300">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
