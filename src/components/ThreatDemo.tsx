import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, ShieldCheck, ShieldX, Search, AlertTriangle } from "lucide-react";

const demoSites = [
  { url: "paypal-secure-login.scam.com", status: "blocked", type: "Phishing" },
  { url: "amazon.com", status: "safe", type: "Legitimt" },
  { url: "free-iphone-winner.xyz", status: "blocked", type: "Bedrägeri" },
  { url: "google.com", status: "safe", type: "Legitimt" },
  { url: "bank-verification-required.ru", status: "blocked", type: "Phishing" },
];

export const ThreatDemo = () => {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  const analyzeSite = (url: string, status: string) => {
    setAnalyzing(url);
    setTimeout(() => {
      setResults((prev) => ({ ...prev, [url]: status }));
      setAnalyzing(null);
    }, 1500);
  };

  return (
    <section className="py-24 px-4 bg-secondary/20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Se AI:n i <span className="text-gradient">aktion</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Testa hur vår AI analyserar och klassificerar webbplatser i realtid.
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
              <div className="bg-background rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="w-4 h-4" />
                <span>Klicka på en webbplats för att analysera...</span>
              </div>
            </div>
          </div>

          {/* Site list */}
          <div className="p-4 space-y-3">
            {demoSites.map((site) => (
              <div
                key={site.url}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                  results[site.url]
                    ? results[site.url] === "safe"
                      ? "border-success/50 bg-success/5"
                      : "border-destructive/50 bg-destructive/5"
                    : "border-border bg-secondary/30 hover:border-primary/50 cursor-pointer"
                }`}
                onClick={() => !results[site.url] && !analyzing && analyzeSite(site.url, site.status)}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{site.url}</p>
                    <p className="text-sm text-muted-foreground">{site.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {analyzing === site.url ? (
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Analyserar...</span>
                    </div>
                  ) : results[site.url] ? (
                    results[site.url] === "safe" ? (
                      <div className="flex items-center gap-2 text-success">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-sm font-medium">Säker</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <ShieldX className="w-5 h-5" />
                        <span className="text-sm font-medium">Blockerad</span>
                      </div>
                    )
                  ) : (
                    <Button variant="glow" size="sm">
                      Analysera
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Warning banner */}
          {Object.values(results).includes("blocked") && (
            <div className="border-t border-border bg-destructive/10 px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">
                <strong>Varning:</strong> Farliga webbplatser har identifierats och blockerats för din säkerhet.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
