import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  ShieldX, 
  ShieldCheck, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home,
  X,
  Loader2,
  AlertTriangle,
  Lock,
  Unlock,
  ExternalLink
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

export const SafeBrowser = () => {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Safe domains that don't need analysis
  const SAFE_DOMAINS = [
    'google.com', 'google.se', 'youtube.com', 'facebook.com', 'instagram.com',
    'twitter.com', 'x.com', 'linkedin.com', 'github.com', 'microsoft.com',
    'apple.com', 'amazon.com', 'amazon.se', 'wikipedia.org', 'reddit.com',
    'netflix.com', 'spotify.com', 'bankid.com', 'swish.nu', 'klarna.com'
  ];

  const isSafeDomain = (urlString: string): boolean => {
    try {
      const hostname = new URL(urlString).hostname.toLowerCase();
      return SAFE_DOMAINS.some(safe => 
        hostname === safe || hostname.endsWith('.' + safe)
      );
    } catch {
      return false;
    }
  };

  const normalizeUrl = (inputUrl: string): string => {
    let normalized = inputUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    return normalized;
  };

  const analyzeUrl = async (urlToAnalyze: string): Promise<AnalysisResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-url', {
        body: { url: urlToAnalyze }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    } catch (error) {
      console.error('Analysis error:', error);
      return null;
    }
  };

  const navigateTo = async (inputUrl: string) => {
    if (!inputUrl.trim()) return;

    const normalizedUrl = normalizeUrl(inputUrl);
    setUrl(normalizedUrl);
    setIsBlocked(false);
    setAnalysisResult(null);

    // Check if it's a safe domain
    if (isSafeDomain(normalizedUrl)) {
      setCurrentUrl(normalizedUrl);
      setAnalysisResult({ safe: true, riskLevel: "low", category: "Verifierad", reasons: [], recommendation: "Känd säker webbplats" });
      
      // Add to history
      const newHistory = [...history.slice(0, historyIndex + 1), normalizedUrl];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return;
    }

    // Analyze URL before loading
    setIsAnalyzing(true);
    const result = await analyzeUrl(normalizedUrl);
    setIsAnalyzing(false);

    if (result) {
      setAnalysisResult(result);

      if (result.shouldBlock || (!result.safe && result.riskLevel === "high")) {
        // Block the page
        setIsBlocked(true);
        toast({
          title: "⛔ Sidan blockerad",
          description: `${result.category}: ${result.recommendation}`,
          variant: "destructive",
        });
        return;
      }
    }

    // Safe to load
    setCurrentUrl(normalizedUrl);
    
    // Add to history
    const newHistory = [...history.slice(0, historyIndex + 1), normalizedUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
      setIsBlocked(false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
    }
  };

  const refresh = () => {
    if (currentUrl && iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const goHome = () => {
    setUrl("");
    setCurrentUrl("");
    setIsBlocked(false);
    setAnalysisResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigateTo(url);
    }
  };

  const proceedAnyway = () => {
    if (url) {
      setIsBlocked(false);
      setCurrentUrl(url);
      
      const newHistory = [...history.slice(0, historyIndex + 1), url];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Browser toolbar */}
      <div className="glass-strong border-b border-border/50 p-2 safe-area-top">
        <div className="flex items-center gap-2">
          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={goBack}
              disabled={historyIndex <= 0}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={goForward}
              disabled={historyIndex >= history.length - 1}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={refresh}
              disabled={!currentUrl}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={goHome}
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>

          {/* URL bar */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
            {/* Security indicator */}
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : analysisResult ? (
              analysisResult.safe ? (
                <Lock className="w-4 h-4 text-success" />
              ) : (
                <Unlock className="w-4 h-4 text-destructive" />
              )
            ) : (
              <Search className="w-4 h-4 text-muted-foreground" />
            )}
            
            <Input
              type="url"
              placeholder="Sök eller skriv webbadress..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 p-0 h-auto text-sm"
            />
            
            {url && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setUrl("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Go button */}
          <Button 
            variant="premium" 
            size="sm"
            onClick={() => navigateTo(url)}
            disabled={isAnalyzing || !url.trim()}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gå"}
          </Button>
        </div>

        {/* Security status bar */}
        {analysisResult && !isBlocked && (
          <div className={`mt-2 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
            analysisResult.safe 
              ? "bg-success/10 text-success border border-success/20" 
              : "bg-warning/10 text-warning border border-warning/20"
          }`}>
            {analysisResult.safe ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span className="font-medium">{analysisResult.category}</span>
            <span className="opacity-70">•</span>
            <span className="opacity-70">{analysisResult.recommendation}</span>
          </div>
        )}
      </div>

      {/* Browser content */}
      <div className="flex-1 relative">
        {/* Welcome screen */}
        {!currentUrl && !isBlocked && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Shield className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Säker Webbläsare</h2>
              <p className="text-muted-foreground mb-6">
                Alla webbplatser analyseras av AI innan de laddas. Farliga sidor blockeras automatiskt.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateTo("https://google.com")}
                >
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateTo("https://youtube.com")}
                >
                  YouTube
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Blocked page */}
        {isBlocked && analysisResult && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-destructive/5 to-background">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center animate-pulse">
                <ShieldX className="w-12 h-12 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-destructive mb-2">Sidan Blockerad</h2>
              <p className="text-muted-foreground mb-4">
                Denna webbplats har identifierats som potentiellt farlig.
              </p>
              
              <div className="glass rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-destructive/20 text-destructive">
                    {analysisResult.category}
                  </span>
                </div>
                <p className="text-sm text-foreground font-medium mb-2">{analysisResult.recommendation}</p>
                {analysisResult.reasons && analysisResult.reasons.length > 0 && (
                  <ul className="space-y-1">
                    {analysisResult.reasons.slice(0, 3).map((reason, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 text-warning flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="premium" onClick={goHome}>
                  <Home className="w-4 h-4" />
                  Gå till startsidan
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={proceedAnyway}
                >
                  Fortsätt ändå (ej rekommenderat)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Iframe for loaded pages */}
        {currentUrl && !isBlocked && (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            onLoad={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}
          />
        )}

        {/* Loading overlay */}
        {isLoading && currentUrl && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Laddar...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};