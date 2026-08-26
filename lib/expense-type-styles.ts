import { ExpenseType } from "./types";

export interface ExpenseTypeStyle {
  badge: string;
}

/*
 * Lumen: expense types are quiet markers, not colored cards.
 * Need gets the single sage accent; Want and Not sure stay ink.
 */
const EXPENSE_TYPE_STYLES: Record<ExpenseType, ExpenseTypeStyle> = {
  [ExpenseType.Need]: {
    badge: "border border-primary/35 text-primary",
  },
  [ExpenseType.Want]: {
    badge: "border border-border text-muted-foreground",
  },
  [ExpenseType.NotSure]: {
    badge: "border border-dashed border-input text-muted-foreground",
  },
};

const DEFAULT_STYLE: ExpenseTypeStyle = {
  badge: "border border-border text-muted-foreground",
};

export function getExpenseTypeStyle(type: ExpenseType): ExpenseTypeStyle {
  return EXPENSE_TYPE_STYLES[type] ?? DEFAULT_STYLE;
}
