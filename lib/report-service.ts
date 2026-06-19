import { db } from "./firebase";
import {
  collection,
  setDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DailyTotal {
  date: string;
  amount: number;
}

export interface PaymentMethodBreakdown {
  paidBy: string;
  amount: number;
  count: number;
}

export interface TypeBreakdown {
  need: number;
  want: number;
  not_sure: number;
}

export interface ReportSummary {
  totalSpent: number;
  transactionCount: number;
  avgDaily: number;
  largestExpense: number;
  largestExpenseDescription: string;
  byCategory: CategoryBreakdown[];
  byType: TypeBreakdown;
  byPaymentMethod: PaymentMethodBreakdown[];
  dailyTotals: DailyTotal[];
  topCategories: CategoryBreakdown[];
}

export interface Report {
  id: string;
  userId: string;
  month: string;
  monthLabel: string;
  generatedAt: Date;
  summary: ReportSummary;
  aiCategorizedCount: number;
  aiInsights: string;
}

export const reportService = {
  async getReportByMonth(
    userId: string,
    month: string
  ): Promise<Report | null> {
    const reportsRef = collection(db, "reports");
    const q = query(
      reportsRef,
      where("userId", "==", userId),
      where("month", "==", month)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      generatedAt: data.generatedAt?.toDate(),
    } as Report;
  },

  async getReport(id: string): Promise<Report | null> {
    const docRef = doc(db, "reports", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      generatedAt: data.generatedAt?.toDate(),
    } as Report;
  },

  async createReport(
    report: Omit<Report, "id" | "generatedAt">
  ): Promise<string> {
    const now = new Date();
    // Use a deterministic doc ID so concurrent calls for the same
    // userId + month always overwrite the same document instead of
    // creating duplicates.
    const docId = `${report.userId}_${report.month}`;
    const docRef = doc(db, "reports", docId);
    await setDoc(docRef, {
      ...report,
      generatedAt: Timestamp.fromDate(now),
    });
    return docId;
  },

  async deleteReport(id: string): Promise<void> {
    await deleteDoc(doc(db, "reports", id));
  },

  async listReports(userId: string): Promise<Report[]> {
    const reportsRef = collection(db, "reports");
    const q = query(
      reportsRef,
      where("userId", "==", userId),
      orderBy("generatedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        generatedAt: data.generatedAt?.toDate(),
      } as Report;
    });
  },
};
