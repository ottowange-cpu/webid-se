import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, Chrome, Smartphone, Apple, Download, Copy, Check, Globe, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface InstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InstallModal = ({ open, onOpenChange }: InstallModalProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const extensionsUrl = "chrome://extensions";

  const copyExtensionsUrl = () => {
    navigator.clipboard.writeText(extensionsUrl);
    setCopied(true);
    toast({
      title: "Kopierat!",
      description: "Klistra in chrome://extensions i din webbläsares adressfält",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      id: "chrome",
      name: "Chrome / Edge / Brave",
      icon: Chrome,
      description: "Tillägg med automatisk blockering",
      available: true,
      instructions: [
        "Klicka på 'Ladda ner från GitHub' nedan",
        "Klicka på den gröna 'Code'-knappen → 'Download ZIP'",
        "Packa upp ZIP-filen på din dator",
        "Kopiera länken nedan och klistra in i adressfältet",
        "Aktivera 'Utvecklarläge' uppe till höger",
        "Klicka 'Läs in okomprimerat tillägg'",
        "Välj mappen 'chrome-extension' från den uppackade filen",
        "Klart! Tillägget blockerar farliga sidor automatiskt"
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
      name: "Mobil (iOS / Android)",
      icon: Smartphone,
      description: "Säker webbläsare + länkkontroll",
      available: true,
      instructions: []
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-strong border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            Aktivera Web Guard AI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Välj din plattform för att aktivera skydd mot bedrägerier.
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
                <div className="mt-4 pt-4 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                  
                  {platform.id === "chrome" && (
                    <>
                      <h4 className="font-medium text-foreground mb-3">Installationssteg:</h4>
                      <ol className="space-y-2 mb-4">
                        {platform.instructions.map((step, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      
                      <div className="space-y-3">
                        <Button 
                          variant="premium" 
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open("https://github.com/nicholasprogdev/webid-scam-blocker-se", "_blank");
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Ladda ner från GitHub
                        </Button>
                        
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                          <code className="flex-1 text-sm text-primary font-mono">chrome://extensions</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyExtensionsUrl();
                            }}
                            className="shrink-0"
                          >
                            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Kopiera och klistra in i adressfältet
                        </p>
                      </div>
                    </>
                  )}

                  {platform.id === "mobile" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Välj hur du vill använda Web Guard AI på mobilen:
                      </p>

                      <div className="grid gap-3">
                        <Button 
                          variant="premium" 
                          size="default"
                          className="w-full justify-start h-auto py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChange(false);
                            navigate("/browser");
                          }}
                        >
                          <Globe className="w-5 h-5 mr-3" />
                          <div className="text-left">
                            <div className="font-semibold">Säker Webbläsare</div>
                            <div className="text-xs opacity-80">Surfa med automatisk blockering</div>
                          </div>
                        </Button>

                        <Button 
                          variant="outline" 
                          size="default"
                          className="w-full justify-start h-auto py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChange(false);
                            navigate("/check");
                          }}
                        >
                          <LinkIcon className="w-5 h-5 mr-3" />
                          <div className="text-left">
                            <div className="font-semibold">Länkkontroll</div>
                            <div className="text-xs opacity-80">Dela eller klistra in misstänkta länkar</div>
                          </div>
                        </Button>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground">
                          <strong className="text-foreground">Tips:</strong> Lägg till appen på hemskärmen för snabb åtkomst.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          iOS: Dela → "Lägg till på hemskärmen"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Android: Meny (⋮) → "Lägg till på startskärmen"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Web Guard AI skyddar dig mot phishing, bedrägerier och farliga webbplatser.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};