import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Pricing = () => {
  const handlePurchase = () => {
    // Placeholder for payment integration
    alert("Betalningsfunktion kommer snart!");
  };

  return (
    <section id="pricing" className="py-24 px-4 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Skydda Dig <span className="text-gradient">Idag</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Engångsbetalning - livstids skydd. Inga dolda avgifter eller prenumerationer.
          </p>
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
            Populärast
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">SafeGuard Pro</h3>
                  <p className="text-muted-foreground">Livstids licens</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {[
                  "AI-driven scam-blockering",
                  "Automatisk uppdatering av hotdatabas",
                  "Betalningsskydd vid shopping",
                  "Phishing-detektion",
                  "Livstids support",
                  "Alla framtida uppdateringar",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center md:text-right">
              <div className="mb-4">
                <span className="text-muted-foreground line-through text-lg">99 kr</span>
                <div className="text-5xl font-bold text-foreground">29 kr</div>
                <span className="text-muted-foreground">engångsbetalning</span>
              </div>
              
              <Button 
                variant="hero" 
                size="xl" 
                onClick={handlePurchase}
                className="w-full md:w-auto"
              >
                Köp Nu
              </Button>
              
              <p className="text-xs text-muted-foreground mt-3">
                30 dagars pengarna tillbaka-garanti
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Säker betalning via krypterade betalningsmetoder
          </p>
        </div>
      </div>
    </section>
  );
};
