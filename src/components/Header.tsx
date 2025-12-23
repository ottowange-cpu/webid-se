import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
              <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-50 blur-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">Web Guard</span>
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">AI Protection</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
              Funktioner
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all group-hover:w-full" />
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
              Hur det fungerar
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all group-hover:w-full" />
            </a>
            <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
              Demo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all group-hover:w-full" />
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="premium" size="sm">
              Aktivera Skydd
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-foreground rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-6 border-t border-border/50">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                Funktioner
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                Hur det fungerar
              </a>
              <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                Demo
              </a>
              <Button variant="premium" size="sm" className="w-full mt-2">
                Aktivera Skydd
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};