import type { Expense } from "@/lib/expense-service";
import { ExpenseType } from "@/lib/types";

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface PaymentMethodTotal {
  method: string;
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

function labeledAmount(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function summarizeDay(expenses: Expense[]) {
  const byCategory = new Map<string, number>();
  const byPaymentMethod = new Map<string, number>();
  const byType = new Map<ExpenseType, number>();

  for (const expense of expenses) {
    const category = expense.category?.trim();
    if (category) {
      byCategory.set(category, (byCategory.get(category) ?? 0) + expense.amount);
    }
    const method = labeledAmount(expense.paidBy, "Unspecified");
    byPaymentMethod.set(method, (byPaymentMethod.get(method) ?? 0) + expense.amount);
    byType.set(expense.type, (byType.get(expense.type) ?? 0) + expense.amount);
  }

  const categories = [...byCategory.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const paymentMethods = [...byPaymentMethod.entries()]
    .map(([method, amount]) => ({ method, amount }))
    .sort((a, b) => b.amount - a.amount);

  const types = TYPE_ORDER.map((type) => ({
    type,
    amount: byType.get(type) ?? 0,
  }));

  return {
    categories,
    paymentMethods,
    types,
    topCategory: categories[0] ?? null,
    transactionCount: expenses.length,
  };
}
