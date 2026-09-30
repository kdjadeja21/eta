import type { Expense } from "@/lib/expense-service";
import { ExpenseType } from "@/lib/types";

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface TypeTotal {
  type: ExpenseType;
  amount: number;
}

const TYPE_ORDER: ExpenseType[] = [
  ExpenseType.Need,
  ExpenseType.Want,
  ExpenseType.NotSure,
];

export function summarizeDay(expenses: Expense[]) {
  const byCategory = new Map<string, number>();
  const byType = new Map<ExpenseType, number>();

  for (const expense of expenses) {
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + expense.amount,
    );
    byType.set(expense.type, (byType.get(expense.type) ?? 0) + expense.amount);
  }

  const categories = [...byCategory.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const types = TYPE_ORDER.map((type) => ({
    type,
    amount: byType.get(type) ?? 0,
  }));

  return {
    categories,
    types,
    topCategory: categories[0] ?? null,
    transactionCount: expenses.length,
  };
}
