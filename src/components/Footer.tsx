import { ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/20 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">SafeGuard AI</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Integritetspolicy</a>
            <a href="#" className="hover:text-foreground transition-colors">Användarvillkor</a>
            <a href="#" className="hover:text-foreground transition-colors">Kontakt</a>
            <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 SafeGuard AI. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
};
