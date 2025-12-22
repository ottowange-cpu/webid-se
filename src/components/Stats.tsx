import { TrendingUp, Users, ShieldOff, Clock } from "lucide-react";

const stats = [
  {
    icon: ShieldOff,
    value: "2.3M",
    label: "Blockerade hot",
    description: "Sedan starten",
  },
  {
    icon: Users,
    value: "50,000+",
    label: "Aktiva användare",
    description: "Världen över",
  },
  {
    icon: Clock,
    value: "<50ms",
    label: "Responstid",
    description: "Genomsnitt",
  },
  {
    icon: TrendingUp,
    value: "99.97%",
    label: "Upptäcktsgrad",
    description: "Av kända hot",
  },
];

export const Stats = () => {
  return (
    <section className="py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="bg-gradient-card border border-border rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-foreground font-medium">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
