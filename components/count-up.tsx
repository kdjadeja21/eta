import { useFormattedCurrency } from "@/lib/currency-utils";
import { useEffect, useState } from "react";

export default function CountUp({
  end,
  duration = 1000,
}: {
  end: number;
  duration?: number;
}) {
  const formattedAmount = useFormattedCurrency();
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 10);
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(interval);
        setValue(end);
      } else {
        setValue(start);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [end, duration]);

  return <span>{formattedAmount(value)}</span>;
}
