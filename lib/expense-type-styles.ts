import { ExpenseType } from "./types";

export interface ExpenseTypeStyle {
  card: string;
  tint: string;
  badge: string;
  accent: string;
  hover: string;
}

const EXPENSE_TYPE_STYLES: Record<ExpenseType, ExpenseTypeStyle> = {
  [ExpenseType.Need]: {
    card: "bg-card dark:bg-card/95",
    tint:
      "bg-[linear-gradient(90deg,rgba(16,185,129,0.08),rgba(16,185,129,0.025)_34%,transparent_72%)] dark:bg-[linear-gradient(90deg,rgba(16,185,129,0.09),rgba(16,185,129,0.025)_34%,transparent_72%)]",
    badge:
      "bg-emerald-500/[0.08] text-emerald-700/80 dark:bg-emerald-500/[0.1] dark:text-emerald-400/80",
    accent: "border-l-emerald-600/35 dark:border-l-emerald-500/30",
    hover: "sm:hover:border-emerald-600/20 dark:sm:hover:border-emerald-500/20",
  },
  [ExpenseType.Want]: {
    card: "bg-card dark:bg-card/95",
    tint:
      "bg-[linear-gradient(90deg,rgba(59,130,246,0.08),rgba(59,130,246,0.025)_34%,transparent_72%)] dark:bg-[linear-gradient(90deg,rgba(59,130,246,0.09),rgba(59,130,246,0.025)_34%,transparent_72%)]",
    badge:
      "bg-blue-500/[0.08] text-blue-700/80 dark:bg-blue-500/[0.1] dark:text-blue-400/80",
    accent: "border-l-blue-600/35 dark:border-l-blue-500/30",
    hover: "sm:hover:border-blue-600/20 dark:sm:hover:border-blue-500/20",
  },
  [ExpenseType.NotSure]: {
    card: "bg-card dark:bg-card/95",
    tint:
      "bg-[linear-gradient(90deg,rgba(245,158,11,0.08),rgba(245,158,11,0.025)_34%,transparent_72%)] dark:bg-[linear-gradient(90deg,rgba(245,158,11,0.09),rgba(245,158,11,0.025)_34%,transparent_72%)]",
    badge:
      "bg-amber-500/[0.08] text-amber-700/80 dark:bg-amber-500/[0.1] dark:text-amber-400/80",
    accent: "border-l-amber-600/35 dark:border-l-amber-500/30",
    hover: "sm:hover:border-amber-600/20 dark:sm:hover:border-amber-500/20",
  },
};

const DEFAULT_STYLE: ExpenseTypeStyle = {
  card: "bg-card",
  tint: "bg-transparent",
  badge: "bg-muted text-muted-foreground",
  accent: "border-l-border",
  hover: "sm:hover:border-border",
};

export function getExpenseTypeStyle(type: ExpenseType): ExpenseTypeStyle {
  return EXPENSE_TYPE_STYLES[type] ?? DEFAULT_STYLE;
}
