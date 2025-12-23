import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, Chrome, Smartphone, Apple, Download, Copy, Check, Globe, Link as LinkIcon, Monitor, Terminal, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { downloadChromeExtension } from "@/utils/extensionDownloader";

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

  const hostsApiUrl = "https://zotvdjgxsrzswmaalujv.supabase.co/functions/v1/content-blocker?format=hosts";

  const copyHostsUrl = () => {
    navigator.clipboard.writeText(hostsApiUrl);
    toast({
      title: "Kopierat!",
      description: "API-URL för hosts-fil kopierad",
    });
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
      id: "mac",
      name: "Mac (Safari / System)",
      icon: Monitor,
      description: "Hosts-fil eller Safari Content Blocker",
      available: true,
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
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-primary">
                  <platform.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{platform.name}</h3>
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
                          onClick={async (e) => {
                            e.stopPropagation();
                            await downloadChromeExtension();
                            toast({
                              title: "Nedladdat!",
                              description: "Packa upp ZIP-filen och följ stegen ovan",
                            });
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Ladda ner Chrome-tillägg
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
                          Kopiera och klistra in i adressfältet för att installera
                        </p>
                      </div>

                      {/* Uninstall Chrome extension */}
                      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3 mt-4">
                        <div className="flex items-center gap-2">
                          <ShieldOff className="w-5 h-5 text-destructive" />
                          <h5 className="font-semibold text-foreground">Avaktivera skydd</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ta bort tillägget för att inaktivera skyddet.
                        </p>
                        <ol className="space-y-1.5 text-xs text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                            <span>Gå till chrome://extensions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                            <span>Hitta "Web Guard AI" och klicka på "Ta bort"</span>
                          </li>
                        </ol>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyExtensionsUrl();
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Kopiera chrome://extensions
                        </Button>
                      </div>
                    </>
                  )}

                  {platform.id === "mac" && (
                    <div className="space-y-4">
                      {/* Quick install - like Chrome */}
                      <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <Download className="w-5 h-5 text-primary" />
                          <h5 className="font-semibold text-foreground">Snabbinstallation</h5>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ladda ner och kör vårt installationsskript för att blockera farliga sidor på systemnivå.
                        </p>
                        
                        <Button 
                          variant="premium" 
                          size="default"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Create download link
                            const link = document.createElement('a');
                            link.href = '/install-webguard.sh';
                            link.download = 'install-webguard.sh';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast({
                              title: "Nedladdat!",
                              description: "Följ stegen nedan för att installera",
                            });
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Ladda ner för Mac
                        </Button>

                        <div className="pt-3 border-t border-border/30 space-y-2">
                          <p className="text-xs font-medium text-foreground">Efter nedladdning:</p>
                          <ol className="space-y-1.5 text-xs text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                              <span>Öppna Terminal (Cmd + Space, skriv "Terminal")</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                              <span>Gå till din Downloads-mapp: <code className="bg-background/50 px-1 rounded">cd ~/Downloads</code></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                              <span>Kör: <code className="bg-background/50 px-1 rounded">sudo bash install-webguard.sh</code></span>
                            </li>
                          </ol>
                        </div>
                      </div>

                      {/* Uninstall button */}
                      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3">
                        <div className="flex items-center gap-2">
                          <ShieldOff className="w-5 h-5 text-destructive" />
                          <h5 className="font-semibold text-foreground">Avaktivera skydd</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ta bort blocklistan och inaktivera skyddet.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText('cd ~/Downloads && sudo bash install-webguard.sh --uninstall');
                            toast({
                              title: "Kommando kopierat!",
                              description: "Klistra in i Terminal för att avinstallera",
                            });
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Kopiera avinstallera-kommando
                        </Button>
                      </div>

                      {/* Link checker */}
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
                          <div className="font-semibold">Använd Länkkontroll</div>
                          <div className="text-xs opacity-80">Kontrollera misstänkta länkar manuellt</div>
                        </div>
                      </Button>
                    </div>
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