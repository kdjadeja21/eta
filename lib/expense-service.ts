import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
  getDoc,
} from "firebase/firestore";
import { ExpenseType } from "./types";

export interface Expense {
  id: string;
  amount: number;
  type: ExpenseType;
  date: Date;
  category: string;
  subcategory?: string;
  description?: string;
  paidBy: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ExpenseFormData = Omit<Expense, "createdAt" | "updatedAt" | "id">;

export const expenseService = {
  async getExpenses(userId: string, startDate?: Date, endDate?: Date) {
    const expensesRef = collection(db, "expenses");
    let q = query(
      expensesRef,
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    if (startDate && endDate) {
      q = query(
        expensesRef,
        where("userId", "==", userId),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Expense;
    });
  },

  async addExpense(userId: string, expense: ExpenseFormData) {
    const { id, ...expenseWithoutId } = expense as any;
    const now = new Date();
    const expenseData = {
      ...expenseWithoutId,
      userId,
      date: Timestamp.fromDate(expense.date),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, "expenses"), expenseData);

    return {
      id: docRef.id,
      ...expenseWithoutId,
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateExpense(id: string, expense: Partial<ExpenseFormData>) {
    const expenseRef = doc(db, "expenses", id);
    const docSnap = await getDoc(expenseRef);
    if (docSnap.exists()) {
      const updateData: DocumentData = {
        ...expense,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (expense.date) {
        updateData.date = Timestamp.fromDate(expense.date);
      }

      await updateDoc(expenseRef, updateData);
    } else {
      console.error("Document does not exist!");
    }
  },

  async deleteExpense(id: string) {
    const expenseRef = doc(db, "expenses", id);
    await deleteDoc(expenseRef);
  },

  async getCategories(userId: string) {
    const categoriesRef = collection(db, `users/${userId}/categories`);
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async addCategory(
    userId: string,
    name: string,
    subcategories: string[] = []
  ) {
    const now = Timestamp.fromDate(new Date());
    await addDoc(collection(db, `users/${userId}/categories`), {
      name,
      subcategories,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getCashTransactions(userId: string) {
    const cashRef = collection(db, "cashTransactions");
    const snapshot = await getDocs(
      query(cashRef, where("userId", "==", userId), orderBy("date", "desc"))
    );
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });
  },

  async addCashTransaction(
    userId: string,
    amount: number,
    description?: string
  ) {
    const now = new Date();
    const cashData = {
      userId,
      amount,
      description: description ? description : "",
      date: Timestamp.fromDate(now),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, "cashTransactions"), cashData);

    return {
      id: docRef.id,
      ...cashData,
      date: now,
      createdAt: now,
      updatedAt: now,
    };
  },

  async getTotalExpenses(userId: string, startDate?: Date, endDate?: Date) {
    const expenses = await this.getExpenses(userId, startDate, endDate);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  },

  async getExpensesByCategory(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const expenses = await this.getExpenses(userId, startDate, endDate);
    return expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
  },
};
