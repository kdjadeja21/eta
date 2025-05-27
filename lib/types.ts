export enum ExpenseType {
  Need = "need",
  Want = "want",
  NotSure = "not_sure"
}

export const formatExpenseType = (type: ExpenseType): string => {
  switch (type) {
    case ExpenseType.Need:
      return "Need";
    case ExpenseType.Want:
      return "Want";
    case ExpenseType.NotSure:
      return "Not Sure";
    default:
      return type;
  }
}; 