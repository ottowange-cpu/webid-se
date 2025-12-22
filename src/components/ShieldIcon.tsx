import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface ShieldIconProps {
  variant?: "default" | "check" | "alert" | "blocked";
  className?: string;
  size?: number;
}

export const ShieldIcon = ({ variant = "default", className = "", size = 24 }: ShieldIconProps) => {
  const icons = {
    default: Shield,
    check: ShieldCheck,
    alert: ShieldAlert,
    blocked: ShieldX,
  };

  const Icon = icons[variant];
  
  return <Icon className={className} size={size} />;
};
