import type { Expense, ExpenseFormData } from "@/lib/expense-service";

export type OptimisticExpense = Expense & { pending?: boolean };

export type OptimisticExpenseAction =
  | { type: "add"; expense: OptimisticExpense }
  | { type: "update"; id: string; patch: Partial<Expense> }
  | { type: "delete"; ids: string[] };

export function createPendingExpense(
  data: ExpenseFormData,
  id: string = crypto.randomUUID(),
): OptimisticExpense {
  const now = new Date();
  return {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
    pending: true,
  };
}

export function reduceOptimisticExpenses(
  current: OptimisticExpense[],
  action: OptimisticExpenseAction,
): OptimisticExpense[] {
  switch (action.type) {
    case "add":
      return [action.expense, ...current];
    case "update":
      return current.map((expense) =>
        expense.id === action.id
          ? { ...expense, ...action.patch, pending: true }
          : expense,
      );
    case "delete":
      return current.filter((expense) => !action.ids.includes(expense.id));
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
