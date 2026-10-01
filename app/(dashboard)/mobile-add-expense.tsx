"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type OpenAddExpense = () => void;

interface MobileAddExpenseContextValue {
  openAddExpense: () => void;
  registerOpenAddExpense: (handler: OpenAddExpense | null) => void;
}

const MobileAddExpenseContext =
  createContext<MobileAddExpenseContextValue | null>(null);

export function MobileAddExpenseProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const handlerRef = useRef<OpenAddExpense | null>(null);

  const registerOpenAddExpense = useCallback((handler: OpenAddExpense | null) => {
    handlerRef.current = handler;
  }, []);

  const openAddExpense = useCallback(() => {
    if (handlerRef.current) {
      handlerRef.current();
      return;
    }
    router.push("/daily-view?add=1");
  }, [router]);

  const value = useMemo(
    () => ({ openAddExpense, registerOpenAddExpense }),
    [openAddExpense, registerOpenAddExpense],
  );

  return (
    <MobileAddExpenseContext.Provider value={value}>
      {children}
    </MobileAddExpenseContext.Provider>
  );
}

export function useMobileAddExpense() {
  const context = useContext(MobileAddExpenseContext);
  if (!context) {
    throw new Error(
      "useMobileAddExpense must be used within MobileAddExpenseProvider",
    );
  }
  return context;
}

export function useRegisterMobileAddExpense(handler: OpenAddExpense) {
  const context = useContext(MobileAddExpenseContext);

  useEffect(() => {
    if (!context) return;
    context.registerOpenAddExpense(handler);
    return () => context.registerOpenAddExpense(null);
  }, [context, handler]);
}
