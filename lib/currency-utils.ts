import { useCurrency } from "@/components/currency-context";

export type CurrencyInfo = {
  symbol: string;
  name: string;
};

const currencyLocales: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  GBP: "en-GB",
  EUR: "de-DE",
};

export function formatCurrencyAmount(
  amount: number,
  currency: CurrencyInfo,
  options?: Intl.NumberFormatOptions
) {
  const value = Number.isFinite(amount) ? amount : 0;
  const locale = currencyLocales[currency.name] ?? "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.name,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  } catch {
    return `${currency.symbol}${value.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    })}`;
  }
}

/**
 * A hook to format amounts with the selected currency symbol.
 * @returns A function that formats a number with the current currency symbol.
 */
export function useFormattedCurrency(options?: Intl.NumberFormatOptions) {
  const { currency } = useCurrency();

  return (amount: number) => formatCurrencyAmount(amount, currency, options);
}
