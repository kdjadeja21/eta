import { useCurrency } from "@/components/currency-context";

/**
 * A hook to format amounts with the selected currency symbol.
 * @returns A function that formats a number with the current currency symbol.
 */
export function useFormattedCurrency() {
  const { currency } = useCurrency();

  return (amount: number) => `${currency.symbol}${amount.toFixed(2)}`;
}
