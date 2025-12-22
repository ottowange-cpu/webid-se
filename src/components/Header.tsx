import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">SafeGuard AI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funktioner
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Hur det fungerar
            </a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="glow" size="sm">
              Aktivera Skydd
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Funktioner
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Hur det fungerar
              </a>
              <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </a>
              <Button variant="glow" size="sm" className="w-full">
                Aktivera Skydd
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
