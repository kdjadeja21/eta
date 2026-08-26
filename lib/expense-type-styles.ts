import { ExpenseType } from "./types";

export interface ExpenseTypeStyle {
  label: string;
}

const EXPENSE_TYPE_STYLES: Record<ExpenseType, ExpenseTypeStyle> = {
  [ExpenseType.Need]: { label: "Need" },
  [ExpenseType.Want]: { label: "Want" },
  [ExpenseType.NotSure]: { label: "Not sure" },
};

export function getExpenseTypeStyle(type: ExpenseType): ExpenseTypeStyle {
  return EXPENSE_TYPE_STYLES[type] ?? { label: type };
}
