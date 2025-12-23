import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Settings, 
  CheckCircle2, 
  ChevronRight,
  Smartphone,
  Globe,
  Lock,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SetupStep {
  id: number;
  title: string;
  description: string;
  instruction: string;
  completed: boolean;
}

export const SafeBrowser = () => {
  const { toast } = useToast();
  const [copiedDNS, setCopiedDNS] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // DNS server for content blocking (placeholder - would need actual DNS service)
  const DNS_SERVER = "webid.safedns.se";

  const iosSteps: SetupStep[] = [
    {
      id: 1,
      title: "Öppna Inställningar",
      description: "Gå till din iPhones inställningar",
      instruction: "Tryck på Inställningar-appen på din hemskärm",
      completed: completedSteps.includes(1)
    },
    {
      id: 2,
      title: "Safari-inställningar",
      description: "Navigera till Safari",
      instruction: "Scrolla ner och tryck på Safari",
      completed: completedSteps.includes(2)
    },
    {
      id: 3,
      title: "Tillägg",
      description: "Aktivera innehållsblockerare",
      instruction: "Tryck på Tillägg → Innehållsblockerare och aktivera WebID",
      completed: completedSteps.includes(3)
    }
  ];

  const androidSteps: SetupStep[] = [
    {
      id: 1,
      title: "Öppna Inställningar",
      description: "Gå till telefonens inställningar",
      instruction: "Tryck på Inställningar-appen",
      completed: completedSteps.includes(1)
    },
    {
      id: 2,
      title: "Nätverk & Internet",
      description: "Hitta nätverksinställningar",
      instruction: "Tryck på Nätverk & Internet eller Anslutningar",
      completed: completedSteps.includes(2)
    },
    {
      id: 3,
      title: "Privat DNS",
      description: "Konfigurera säker DNS",
      instruction: `Tryck på Privat DNS → Ange: ${DNS_SERVER}`,
      completed: completedSteps.includes(3)
    }
  ];

  const [selectedPlatform, setSelectedPlatform] = useState<"ios" | "android" | null>(null);

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const copyDNS = () => {
    navigator.clipboard.writeText(DNS_SERVER);
    setCopiedDNS(true);
    toast({
      title: "Kopierad!",
      description: "DNS-adressen har kopierats till urklipp",
    });
    setTimeout(() => setCopiedDNS(false), 2000);
  };

  const steps = selectedPlatform === "ios" ? iosSteps : androidSteps;
  const allCompleted = steps.every(step => completedSteps.includes(step.id));

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="glass-strong border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Aktivera Skydd</h1>
            <p className="text-xs text-muted-foreground">Koppla WebID till din webbläsare</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Platform selection */}
        {!selectedPlatform ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Lock className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Välj din enhet</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                För att blockera farliga webbplatser automatiskt behöver du koppla WebID till din webbläsare.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setSelectedPlatform("ios")}
                className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">iPhone / iPad</h3>
                  <p className="text-sm text-muted-foreground">Safari innehållsblockerare</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => setSelectedPlatform("android")}
                className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Globe className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Android</h3>
                  <p className="text-sm text-muted-foreground">Privat DNS-konfiguration</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="glass rounded-xl p-4 bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-sm">Hur fungerar det?</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    WebID analyserar alla webbplatser du besöker i realtid och blockerar automatiskt farliga sidor innan de laddas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedPlatform(null);
                setCompletedSteps([]);
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-sm">Tillbaka</span>
            </button>

            {/* Platform header */}
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {selectedPlatform === "ios" ? "iPhone / iPad" : "Android"} Setup
              </h2>
              <p className="text-muted-foreground text-sm">
                Följ stegen nedan för att aktivera skyddet
              </p>
            </div>

            {/* DNS copy for Android */}
            {selectedPlatform === "android" && (
              <div className="glass rounded-xl p-4 bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-2">DNS-adress att kopiera:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background rounded-lg px-3 py-2 text-sm font-mono text-foreground">
                    {DNS_SERVER}
                  </code>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={copyDNS}
                    className="shrink-0"
                  >
                    {copiedDNS ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`w-full glass rounded-xl p-4 text-left transition-all ${
                    completedSteps.includes(step.id) 
                      ? "bg-success/10 border border-success/30" 
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      completedSteps.includes(step.id)
                        ? "bg-success text-success-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        completedSteps.includes(step.id) ? "text-success" : "text-foreground"
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                      <p className="text-xs text-muted-foreground mt-2 bg-secondary/50 rounded-lg px-3 py-2">
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Completion state */}
            {allCompleted && (
              <div className="glass rounded-xl p-6 bg-success/10 border border-success/30 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-bold text-success text-lg mb-2">Skyddet är aktiverat!</h3>
                <p className="text-sm text-muted-foreground">
                  WebID blockerar nu automatiskt farliga webbplatser när du surfar.
                </p>
              </div>
            )}

            {/* iOS specific: Open settings button */}
            {selectedPlatform === "ios" && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // On iOS, this would open settings
                  window.location.href = "App-Prefs:";
                }}
              >
                <Settings className="w-4 h-4" />
                Öppna Inställningar
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            )}

            {/* Help text */}
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-muted-foreground text-center">
                Behöver du hjälp? Kontakta vår support på support@webid.se
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
