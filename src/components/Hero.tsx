import { Button } from "@/components/ui/button";
import { Shield, Zap, Globe, Sparkles } from "lucide-react";
import { useState } from "react";
import { InstallModal } from "./InstallModal";
export const Hero = () => {
  const [installModalOpen, setInstallModalOpen] = useState(false);
  return <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-24 pt-32">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-mesh" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 animate-fade-in" style={{
              animationDelay: "0.1s"
            }}>
                Skydda dig mot{" "}
                <span className="text-gradient">bedrägerier</span>{" "}
                på nätet
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-xl font-light leading-relaxed animate-fade-in" style={{
              animationDelay: "0.2s"
            }}>
                Vår AI blockerar automatiskt scam-sidor och skyddar dig från bedrägliga webbplatser i realtid.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{
              animationDelay: "0.3s"
            }}>
                <Button variant="premium" size="xl" onClick={() => setInstallModalOpen(true)}>
                  <Shield className="w-5 h-5" />
                  Aktivera Skydd
                </Button>
                <Button variant="outline" size="xl" className="border-border/50 hover:border-primary/50 hover:bg-primary/5" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({
                behavior: 'smooth'
              })}>
                  Läs Mer
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-10 mt-14 justify-center lg:justify-start animate-fade-in" style={{
              animationDelay: "0.4s"
            }}>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gradient">50K+</p>
                  <p className="text-sm text-muted-foreground mt-1">Användare</p>
                </div>
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-gradient">99.9%</p>
                  <p className="text-sm text-muted-foreground mt-1">Blockerade hot</p>
                </div>
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-gradient">24/7</p>
                  <p className="text-sm text-muted-foreground mt-1">Realtidsskydd</p>
                </div>
              </div>
            </div>

            {/* Right visual */}
            <div className="flex-1 relative animate-fade-in" style={{
            animationDelay: "0.3s"
          }}>
              <div className="relative w-full max-w-lg mx-auto">
                {/* Glowing shield */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-card border border-border/50 flex items-center justify-center animate-shield shadow-premium">
                    <div className="w-56 h-56 md:w-72 md:h-72 rounded-full glass border border-primary/20 flex items-center justify-center">
                      <div className="relative">
                        <Shield className="w-28 h-28 md:w-36 md:h-36 text-primary animate-pulse-glow" />
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-8 right-0 glass rounded-xl px-5 py-3 shadow-card animate-float" style={{
                animationDelay: "0.5s"
              }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-foreground">Skyddad</span>
                  </div>
                </div>

                <div className="absolute bottom-12 -left-4 glass rounded-xl px-5 py-3 shadow-card animate-float border-destructive/20" style={{
                animationDelay: "1s"
              }}>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-muted-foreground font-mono">scam-site.xyz</span>
                    <span className="text-xs text-destructive font-bold uppercase tracking-wide">Blockerad</span>
                  </div>
                </div>

                <div className="absolute top-1/2 -left-8 glass rounded-xl px-4 py-2 shadow-card animate-float" style={{
                animationDelay: "1.5s"
              }}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-warning" />
                    <span className="text-xs text-muted-foreground">AI Scanning...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InstallModal open={installModalOpen} onOpenChange={setInstallModalOpen} />
    </>;
};