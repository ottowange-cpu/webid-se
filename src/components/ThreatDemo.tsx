import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ShieldCheck, ShieldX, Search, AlertTriangle, Loader2, Chrome, Shield, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InstallModal } from "./InstallModal";

interface AnalysisResult {
  safe: boolean;
  riskLevel: "low" | "medium" | "high";
  category: string;
  reasons: string[];
  recommendation: string;
  shouldBlock?: boolean;
}

export const ThreatDemo = () => {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const { toast } = useToast();

  const analyzeUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Ange en URL",
        description: "Skriv in en webbadress att analysera",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-url', {
        body: { url: url.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysfel",
        description: error instanceof Error ? error.message : "Kunde inte analysera URL:en",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !analyzing) {
      analyzeUrl();
    }
  };

  return (
    <>
      <section id="demo" className="py-32 px-4 relative">
        <div className="absolute inset-0 pointer-events-none bg-gradient-mesh opacity-30" />
        
        <div className="container max-w-5xl mx-auto relative z-10">
          {/* Automatic protection banner */}
          <div className="glass rounded-2xl p-6 mb-12 border border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Vill du ha automatiskt skydd?
                </h3>
                <p className="text-muted-foreground">
                  Med vårt Chrome-tillägg blockeras farliga sidor <strong className="text-foreground">automatiskt</strong> innan du ens ser dem. 
                  Ingen manuell kontroll behövs - AI:n skyddar dig i realtid.
                </p>
              </div>
              <Button 
                variant="premium" 
                size="lg"
                onClick={() => setInstallModalOpen(true)}
                className="shrink-0"
              >
                <Chrome className="w-5 h-5" />
                Installera tillägg
              </Button>
            </div>
          </div>

          <div className="text-center mb-12">
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Demo</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Testa <span className="text-gradient">AI-Analysen</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Se hur vår AI analyserar webbadresser. Klistra in en misstänkt länk för att testa.
            </p>
          </div>

          <div className="glass rounded-2xl overflow-hidden shadow-premium border border-border/50">
            {/* Browser chrome */}
            <div className="bg-secondary/30 border-b border-border/50 px-4 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 mx-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 flex-1">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Klistra in en URL att analysera (t.ex. paypal-secure-login.xyz)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-transparent border-none focus-visible:ring-0 p-0 h-auto text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button 
                    variant="premium" 
                    size="sm" 
                    onClick={analyzeUrl}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyserar...
                      </>
                    ) : (
                      "Analysera"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Results area */}
            <div className="p-8">
              {!result && !analyzing && (
                <div className="text-center py-16 text-muted-foreground">
                  <Globe className="w-16 h-16 mx-auto mb-6 opacity-30" />
                  <p className="text-lg mb-2">Klistra in en URL ovan för att analysera den</p>
                  <p className="text-sm opacity-70">Prova t.ex: paypal-secure-login.xyz, vinn-iphone-gratis.tk</p>
                </div>
              )}

              {analyzing && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <Shield className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg text-foreground font-medium">AI:n analyserar webbplatsen...</p>
                  <p className="text-sm text-muted-foreground mt-2">Kontrollerar mot 8 säkerhetskategorier</p>
                </div>
              )}

              {result && (
                <div className={`p-6 rounded-xl border ${
                  result.safe 
                    ? "border-success/30 bg-success/5" 
                    : "border-destructive/30 bg-destructive/5"
                }`}>
                  <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-xl ${
                      result.safe ? "bg-success/20" : "bg-destructive/20"
                    }`}>
                      {result.safe ? (
                        <ShieldCheck className="w-10 h-10 text-success" />
                      ) : (
                        <ShieldX className="w-10 h-10 text-destructive" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className={`text-2xl font-bold ${
                          result.safe ? "text-success" : "text-destructive"
                        }`}>
                          {result.safe ? "Säker webbplats" : "Osäker webbplats"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          result.riskLevel === "low" 
                            ? "bg-success/20 text-success" 
                            : result.riskLevel === "medium"
                            ? "bg-warning/20 text-warning"
                            : "bg-destructive/20 text-destructive"
                        }`}>
                          {result.category}
                        </span>
                        {result.shouldBlock && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-destructive text-destructive-foreground flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            Blockeras automatiskt
                          </span>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-5 text-lg">{result.recommendation}</p>
                      
                      {result.reasons && result.reasons.length > 0 && (
                        <div className="glass rounded-lg p-4">
                          <p className="text-sm font-semibold text-foreground mb-3">AI-analys:</p>
                          <ul className="space-y-2">
                            {result.reasons.map((reason, index) => (
                              <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  result.safe ? "text-success" : "text-warning"
                                }`} />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!result.safe && (
                        <div className="mt-5 p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">💡 Tips:</strong> Med Chrome-tillägget hade denna sida blockerats automatiskt innan du kunde se den.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => setInstallModalOpen(true)}
                          >
                            <Chrome className="w-4 h-4" />
                            Få automatiskt skydd
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <InstallModal open={installModalOpen} onOpenChange={setInstallModalOpen} />
    </>
  );
};