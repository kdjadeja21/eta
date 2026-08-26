import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Zap,
  HeartPulse,
  Film,
  GraduationCap,
  Home,
  Plane,
  Sparkles,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export interface CategoryIconConfig {
  icon: LucideIcon;
  bg: string;
  color: string;
  label: string;
}

/* Lumen: icons stay distinct per category, chrome stays monochrome sage. */
const ICON_BG = "bg-secondary";
const ICON_COLOR = "text-primary";

const categoryIcons: Record<string, { icon: LucideIcon; label: string }> = {
  "Food & Dining": { icon: UtensilsCrossed, label: "FOOD" },
  Transportation: { icon: Car, label: "TRANSPORT" },
  Shopping: { icon: ShoppingBag, label: "SHOPPING" },
  Utilities: { icon: Zap, label: "UTILITIES" },
  Healthcare: { icon: HeartPulse, label: "HEALTH" },
  Entertainment: { icon: Film, label: "ENTERTAINMENT" },
  Education: { icon: GraduationCap, label: "EDUCATION" },
  Housing: { icon: Home, label: "HOUSING" },
  Travel: { icon: Plane, label: "TRAVEL" },
  "Personal Care": { icon: Sparkles, label: "PERSONAL" },
};

export function getCategoryIcon(category: string): CategoryIconConfig {
  const entry = categoryIcons[category];

  return {
    icon: entry?.icon ?? Receipt,
    bg: ICON_BG,
    color: ICON_COLOR,
    label:
      entry?.label ??
      (category?.split(" ")[0]?.toUpperCase().slice(0, 12) || "OTHER"),
  };
}
