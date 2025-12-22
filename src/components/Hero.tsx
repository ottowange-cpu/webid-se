import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Globe } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Driven Protection</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Skydda dig mot{" "}
              <span className="text-gradient">bedrägerier</span>{" "}
              på nätet
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Vår AI blockerar automatiskt scam-sidor och skyddar dig från bedrägliga webbplatser som försöker stjäla din information eller dina pengar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl">
                <ShieldCheck className="w-5 h-5" />
                Aktivera Skydd
              </Button>
              <Button variant="outline" size="xl">
                Läs Mer
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Användare</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">99.9%</p>
                <p className="text-sm text-muted-foreground">Blockerade hot</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-muted-foreground">Realtidsskydd</p>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="flex-1 relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-full max-w-md mx-auto">
              {/* Glowing shield */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-card border border-primary/20 flex items-center justify-center animate-shield">
                  <div className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <ShieldCheck className="w-24 h-24 md:w-32 md:h-32 text-primary" />
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-4 right-0 bg-card border border-border rounded-lg px-4 py-2 shadow-card animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-foreground">Skyddad</span>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 bg-card border border-destructive/30 rounded-lg px-4 py-2 shadow-card animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">scam-site.com</span>
                  <span className="text-xs text-destructive font-medium">BLOCKERAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
