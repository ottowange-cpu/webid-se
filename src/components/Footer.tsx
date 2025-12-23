import { Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-gradient-card py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground tracking-tight">Web Guard</span>
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">AI Protection</span>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Integritetspolicy</a>
            <a href="#" className="hover:text-foreground transition-colors">Användarvillkor</a>
            <a href="#" className="hover:text-foreground transition-colors">Kontakt</a>
            <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 Web Guard AI. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
};