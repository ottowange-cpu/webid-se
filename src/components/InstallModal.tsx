import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, Chrome, Smartphone, Apple, Download, ExternalLink, CheckCircle2 } from "lucide-react";

interface InstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InstallModal = ({ open, onOpenChange }: InstallModalProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const platforms = [
    {
      id: "chrome",
      name: "Chrome",
      icon: Chrome,
      description: "Chrome-tillägg med fullständigt skydd",
      available: true,
      instructions: [
        "Ladda ner tillägget från länken nedan",
        "Öppna chrome://extensions i din webbläsare",
        "Aktivera 'Utvecklarläge' uppe till höger",
        "Klicka 'Läs in okomprimerat tillägg'",
        "Välj mappen 'chrome-extension'",
        "Tillägget är nu aktivt och skyddar dig!"
      ]
    },
    {
      id: "safari",
      name: "Safari",
      icon: Apple,
      description: "Safari Web Extension för Mac",
      available: false,
      comingSoon: true,
      instructions: []
    },
    {
      id: "mobile",
      name: "Mobil",
      icon: Smartphone,
      description: "Manuell URL-scanning i appen",
      available: true,
      instructions: [
        "Kopiera länken du vill kontrollera",
        "Öppna Web Guard AI i din webbläsare",
        "Klistra in länken i demo-sektionen",
        "Klicka 'Analysera' för att se om sidan är säker",
        "Tips: Lägg till appen på hemskärmen för snabb åtkomst"
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-strong border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            Aktivera Web Guard AI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Välj din webbläsare för att aktivera automatiskt skydd mot bedrägerier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? null : platform.id)}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                selectedPlatform === platform.id
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/50 hover:border-primary/30 hover:bg-secondary/50"
              } ${platform.comingSoon ? "opacity-60" : ""}`}
              disabled={platform.comingSoon}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  platform.comingSoon ? "bg-muted" : "bg-gradient-primary"
                }`}>
                  <platform.icon className={`w-6 h-6 ${platform.comingSoon ? "text-muted-foreground" : "text-primary-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{platform.name}</h3>
                    {platform.comingSoon && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Kommer snart
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{platform.description}</p>
                </div>
              </div>

              {selectedPlatform === platform.id && platform.available && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="font-medium text-foreground mb-3">Installationssteg:</h4>
                  <ol className="space-y-2">
                    {platform.instructions.map((step, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                  {platform.id === "chrome" && (
                    <div className="mt-4 flex gap-3">
                      <Button 
                        variant="premium" 
                        size="sm"
                        onClick={() => window.open("https://github.com", "_blank")}
                      >
                        <Download className="w-4 h-4" />
                        Ladda ner tillägg
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open("chrome://extensions", "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Öppna Extensions
                      </Button>
                    </div>
                  )}

                  {platform.id === "mobile" && (
                    <div className="mt-4">
                      <Button 
                        variant="premium" 
                        size="sm"
                        onClick={() => {
                          onOpenChange(false);
                          document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Shield className="w-4 h-4" />
                        Gå till URL-scanner
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Web Guard AI skyddar dig mot phishing, bedrägerier och farliga webbplatser i realtid.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};