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

const categoryMap: Record<string, CategoryIconConfig> = {
  "Food & Dining": {
    icon: UtensilsCrossed,
    bg: "bg-amber-100 dark:bg-amber-500/20",
    color: "text-amber-600 dark:text-amber-400",
    label: "FOOD",
  },
  Transportation: {
    icon: Car,
    bg: "bg-blue-100 dark:bg-blue-500/20",
    color: "text-blue-600 dark:text-blue-400",
    label: "TRANSPORT",
  },
  Shopping: {
    icon: ShoppingBag,
    bg: "bg-pink-100 dark:bg-pink-500/20",
    color: "text-pink-600 dark:text-pink-400",
    label: "SHOPPING",
  },
  Utilities: {
    icon: Zap,
    bg: "bg-yellow-100 dark:bg-yellow-500/20",
    color: "text-yellow-600 dark:text-yellow-400",
    label: "UTILITIES",
  },
  Healthcare: {
    icon: HeartPulse,
    bg: "bg-red-100 dark:bg-red-500/20",
    color: "text-red-600 dark:text-red-400",
    label: "HEALTH",
  },
  Entertainment: {
    icon: Film,
    bg: "bg-purple-100 dark:bg-purple-500/20",
    color: "text-purple-600 dark:text-purple-400",
    label: "ENTERTAINMENT",
  },
  Education: {
    icon: GraduationCap,
    bg: "bg-indigo-100 dark:bg-indigo-500/20",
    color: "text-indigo-600 dark:text-indigo-400",
    label: "EDUCATION",
  },
  Housing: {
    icon: Home,
    bg: "bg-teal-100 dark:bg-teal-500/20",
    color: "text-teal-600 dark:text-teal-400",
    label: "HOUSING",
  },
  Travel: {
    icon: Plane,
    bg: "bg-sky-100 dark:bg-sky-500/20",
    color: "text-sky-600 dark:text-sky-400",
    label: "TRAVEL",
  },
  "Personal Care": {
    icon: Sparkles,
    bg: "bg-rose-100 dark:bg-rose-500/20",
    color: "text-rose-600 dark:text-rose-400",
    label: "PERSONAL",
  },
};

const defaultConfig: CategoryIconConfig = {
  icon: Receipt,
  bg: "bg-muted",
  color: "text-muted-foreground",
  label: "OTHER",
};

export function getCategoryIcon(category: string): CategoryIconConfig {
  return (
    categoryMap[category] ?? {
      ...defaultConfig,
      label:
        category?.split(" ")[0]?.toUpperCase().slice(0, 12) || "OTHER",
    }
  );
}
