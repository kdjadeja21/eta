"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type AddExpenseHandler = () => void;

interface AddExpenseContextValue {
  registerAddHandler: (handler: AddExpenseHandler | null) => void;
  openAddExpense: () => void;
}

const AddExpenseContext = createContext<AddExpenseContextValue | null>(null);

export function AddExpenseProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<AddExpenseHandler | null>(null);

  const registerAddHandler = useCallback((handler: AddExpenseHandler | null) => {
    handlerRef.current = handler;
  }, []);

  const openAddExpense = useCallback(() => {
    handlerRef.current?.();
  }, []);

  return (
    <AddExpenseContext.Provider value={{ registerAddHandler, openAddExpense }}>
      {children}
    </AddExpenseContext.Provider>
  );
}

export function useAddExpense() {
  const ctx = useContext(AddExpenseContext);
  if (!ctx) {
    throw new Error("useAddExpense must be used within AddExpenseProvider");
  }
  return ctx;
}

/** Registers a page-level add handler while mounted. */
export function useRegisterAddExpense(handler: AddExpenseHandler) {
  const { registerAddHandler } = useAddExpense();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    registerAddHandler(() => handlerRef.current());
    return () => registerAddHandler(null);
  }, [registerAddHandler]);
}

/** Keyboard shortcut: A to add, Esc handled by dialogs. */
export function useAddExpenseShortcut(enabled: boolean) {
  const { openAddExpense } = useAddExpense();

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "a" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        openAddExpense();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, openAddExpense]);
}
