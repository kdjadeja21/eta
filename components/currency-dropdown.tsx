"use client";

import React from "react";
import { useCurrency } from "@/components/currency-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";

const currencyOptions = [
  { code: "IN", symbol: "₹", name: "INR" },
  { code: "US", symbol: "$", name: "USD" },
  { code: "GB", symbol: "£", name: "GBP" },
  { code: "EU", symbol: "€", name: "EUR" },
  // Add more options as needed
];

export const CurrencyDropdown = () => {
  const { currency, updateCurrency } = useCurrency();

  const handleChange = (code: string) => {
    const selectedCurrency = currencyOptions.find((c) => c.name === code);
    if (selectedCurrency) {
      updateCurrency(selectedCurrency);
    }
  };

  return (
    <div className="w-auto">
      <Select
        value={currency.name}
        onValueChange={(value: string) => handleChange(value)}
      >
        {/* <FormControl> */}
        <SelectTrigger>
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        {/* </FormControl> */}
        <SelectContent>
          {currencyOptions.map((option) => (
            <SelectItem key={option.code} value={option.name}>
              {option.symbol} - {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
