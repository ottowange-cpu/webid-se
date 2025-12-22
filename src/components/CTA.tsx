import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container max-w-4xl mx-auto relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-8 animate-shield">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Börja skydda dig <span className="text-gradient">idag</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Anslut dig till tusentals användare som redan surfar säkrare med vår AI-drivna scam-blockerare.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ShieldCheck className="w-5 h-5" />
              Aktivera Gratis Skydd
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Kontakta Oss
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Gratis att använda • Ingen installation krävs • Fungerar i alla webbläsare
          </p>
        </div>
      </div>
    </section>
  );
};
