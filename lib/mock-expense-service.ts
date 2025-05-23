import { Expense, ExpenseFormData } from "./expense-service";
import { v4 as uuidv4 } from 'uuid';

// Sample mock data for guest users
const mockExpenses: Expense[] = [
  {
    id: "1",
    date: new Date(2025, 4, 15),
    amount: 45.99,
    description: "Grocery shopping",
    paidBy: "Credit Card",
    category: "Food",
    subcategory: "Groceries",
    tags: ["essentials"],
    type: "need",
    createdAt: new Date(2025, 4, 15),
    updatedAt: new Date(2025, 4, 15)
  },
  {
    id: "2",
    date: new Date(2025, 4, 16),
    amount: 12.50,
    description: "Coffee and snacks",
    paidBy: "Cash",
    category: "Food",
    subcategory: "Eating Out",
    tags: ["coffee"],
    type: "want",
    createdAt: new Date(2025, 4, 16),
    updatedAt: new Date(2025, 4, 16)
  },
  {
    id: "3",
    date: new Date(2025, 4, 17),
    amount: 150.00,
    description: "Electricity bill",
    paidBy: "Bank Transfer",
    category: "Utilities",
    subcategory: "Electricity",
    tags: ["bills", "monthly"],
    type: "need",
    createdAt: new Date(2025, 4, 17),
    updatedAt: new Date(2025, 4, 17)
  },
  {
    id: "4",
    date: new Date(2025, 4, 18),
    amount: 200.00,
    description: "Cash Withdrawal",
    paidBy: "ATM",
    category: "Cash Withdrawal",
    subcategory: "",
    tags: ["cash"],
    type: "need",
    createdAt: new Date(2025, 4, 18),
    updatedAt: new Date(2025, 4, 18)
  },
  {
    id: "5",
    date: new Date(2025, 4, 19),
    amount: 35.00,
    description: "Movie tickets",
    paidBy: "Cash",
    category: "Entertainment",
    subcategory: "Movies",
    tags: ["weekend"],
    type: "want",
    createdAt: new Date(2025, 4, 19),
    updatedAt: new Date(2025, 4, 19)
  }
];

// Mock categories
const mockCategories = [
  { id: "1", name: "Food", subcategories: ["Groceries", "Eating Out", "Delivery"] },
  { id: "2", name: "Transportation", subcategories: ["Fuel", "Public Transport", "Taxi"] },
  { id: "3", name: "Utilities", subcategories: ["Electricity", "Water", "Internet", "Phone"] },
  { id: "4", name: "Entertainment", subcategories: ["Movies", "Games", "Events"] },
  { id: "5", name: "Cash Withdrawal", subcategories: [] }
];

// In-memory storage for guest session
let guestExpenses = [...mockExpenses];

export const mockExpenseService = {
  async getExpenses(_userId: string, startDate?: Date, endDate?: Date) {
    let filteredExpenses = [...guestExpenses];
    
    if (startDate && endDate) {
      filteredExpenses = filteredExpenses.filter(
        expense => expense.date >= startDate && expense.date <= endDate
      );
    }
    
    return filteredExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
  },

  async addExpense(_userId: string, expense: ExpenseFormData) {
    const now = new Date();
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    guestExpenses.push(newExpense);
    return newExpense;
  },

  async updateExpense(_userId: string, id: string, expense: Partial<ExpenseFormData>) {
    const index = guestExpenses.findIndex(e => e.id === id);
    if (index !== -1) {
      guestExpenses[index] = {
        ...guestExpenses[index],
        ...expense,
        updatedAt: new Date()
      };
    }
  },

  async deleteExpense(_userId: string, id: string) {
    guestExpenses = guestExpenses.filter(e => e.id !== id);
  },

  async getCategories(_userId: string) {
    return mockCategories;
  },

  async addCategory(_userId: string, name: string, subcategories: string[] = []) {
    mockCategories.push({
      id: uuidv4(),
      name,
      subcategories
    });
  }
};
