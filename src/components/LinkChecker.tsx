import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Link as LinkIcon, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  Share2,
  Clipboard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  safe: boolean;
  riskLevel: "low" | "medium" | "high";
  category: string;
  reasons: string[];
  recommendation: string;
  shouldBlock?: boolean;
}

export const LinkChecker = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  // Check for shared URL on mount (for share target functionality)
  useEffect(() => {
    // Check URL parameters for shared content
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text') || params.get('title');
    
    if (sharedUrl) {
      // Extract URL from shared content
      const urlMatch = sharedUrl.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        setUrl(urlMatch[0]);
        // Auto-analyze
        setTimeout(() => analyzeUrl(urlMatch[0]), 500);
      } else {
        setUrl(sharedUrl);
      }
    }

    // Check clipboard for URL on focus (optional)
    const handleFocus = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.match(/^https?:\/\//)) {
          setUrl(clipboardText);
        }
      } catch {
        // Clipboard access denied, ignore
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const analyzeUrl = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || url;
    
    if (!targetUrl.trim()) {
      toast({
        title: "Ange en URL",
        description: "Klistra in en länk att kontrollera",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      let normalizedUrl = targetUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const { data, error } = await supabase.functions.invoke('analyze-url', {
        body: { url: normalizedUrl }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysfel",
        description: error instanceof Error ? error.message : "Kunde inte analysera länken",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast({
        title: "Inklistrat",
        description: "Länk kopierad från urklipp",
      });
    } catch {
      toast({
        title: "Kunde inte läsa urklipp",
        description: "Ge appen tillgång till urklipp",
        variant: "destructive",
      });
    }
  };

  const clearAndReset = () => {
    setUrl("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Header */}
      <header className="glass-strong border-b border-border/50 p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Länkkontroll</h1>
            <p className="text-xs text-muted-foreground">Kolla om en länk är säker</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 flex flex-col">
        {/* URL input */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Klistra in misstänkt länk</span>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeUrl()}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={pasteFromClipboard}
            >
              <Clipboard className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 mt-3">
            <Button 
              variant="premium" 
              className="flex-1"
              onClick={() => analyzeUrl()}
              disabled={isAnalyzing || !url.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyserar...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Kontrollera
                </>
              )}
            </Button>
            {(url || result) && (
              <Button variant="outline" onClick={clearAndReset}>
                Rensa
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`glass rounded-2xl p-5 ${
            result.safe 
              ? "border-2 border-success/30" 
              : "border-2 border-destructive/30"
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                result.safe ? "bg-success/20" : "bg-destructive/20"
              }`}>
                {result.safe ? (
                  <ShieldCheck className="w-8 h-8 text-success" />
                ) : (
                  <ShieldX className="w-8 h-8 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${
                  result.safe ? "text-success" : "text-destructive"
                }`}>
                  {result.safe ? "Säker länk" : "Osäker länk"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    result.riskLevel === "low" 
                      ? "bg-success/20 text-success" 
                      : result.riskLevel === "medium"
                      ? "bg-warning/20 text-warning"
                      : "bg-destructive/20 text-destructive"
                  }`}>
                    {result.category}
                  </span>
                  <span className={`text-xs ${
                    result.riskLevel === "low" 
                      ? "text-success" 
                      : result.riskLevel === "medium"
                      ? "text-warning"
                      : "text-destructive"
                  }`}>
                    {result.riskLevel === "low" ? "Låg risk" : result.riskLevel === "medium" ? "Medel risk" : "Hög risk"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{result.recommendation}</p>

            {result.reasons && result.reasons.length > 0 && (
              <div className="bg-secondary/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">AI-analys:</h3>
                <ul className="space-y-2">
                  {result.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                      {result.safe ? (
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-warning flex-shrink-0" />
                      )}
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!result.safe && (
              <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Varning: Besök inte denna webbplats. Den kan försöka stjäla din information.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !isAnalyzing && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Share2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Dela en länk hit från SMS, mail eller andra appar</p>
              <p className="text-xs mt-1 opacity-70">eller klistra in direkt ovan</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom safe area */}
      <div className="safe-area-bottom" />
    </div>
  );
};