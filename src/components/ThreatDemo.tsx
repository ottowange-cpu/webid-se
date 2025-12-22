import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ShieldCheck, ShieldX, Search, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  safe: boolean;
  riskLevel: "low" | "medium" | "high";
  category: string;
  reasons: string[];
  recommendation: string;
}

export const ThreatDemo = () => {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
    <section className="py-24 px-4 bg-secondary/20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Testa <span className="text-gradient">AI-Analysen</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Skriv in en webbadress så analyserar vår AI om den är säker eller farlig.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          {/* Browser chrome */}
          <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Skriv in en URL att analysera (t.ex. paypal-secure.xyz)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-background border-none focus-visible:ring-0"
                />
                <Button 
                  variant="glow" 
                  size="sm" 
                  onClick={analyzeUrl}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
          <div className="p-6">
            {!result && !analyzing && (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Skriv in en URL ovan för att analysera den</p>
              </div>
            )}

            {analyzing && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">AI:n analyserar webbplatsen...</p>
              </div>
            )}

            {result && (
              <div className={`p-6 rounded-xl border ${
                result.safe 
                  ? "border-success/50 bg-success/5" 
                  : "border-destructive/50 bg-destructive/5"
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    result.safe ? "bg-success/20" : "bg-destructive/20"
                  }`}>
                    {result.safe ? (
                      <ShieldCheck className="w-8 h-8 text-success" />
                    ) : (
                      <ShieldX className="w-8 h-8 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-bold ${
                        result.safe ? "text-success" : "text-destructive"
                      }`}>
                        {result.safe ? "Säker webbplats" : "Varning - Osäker webbplats"}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.riskLevel === "low" 
                          ? "bg-success/20 text-success" 
                          : result.riskLevel === "medium"
                          ? "bg-warning/20 text-warning"
                          : "bg-destructive/20 text-destructive"
                      }`}>
                        {result.category}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{result.recommendation}</p>
                    
                    {result.reasons.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Analysresultat:</p>
                        <ul className="space-y-1">
                          {result.reasons.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
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
  );
};
