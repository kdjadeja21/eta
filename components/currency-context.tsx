"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { fetchGeolocation } from "@/lib/geolocation-service";

// Currency data mapping countries to currency symbols
const currencyData = {
  IN: { symbol: "₹", name: "INR" },
  US: { symbol: "$", name: "USD" },
  GB: { symbol: "£", name: "GBP" },
  EU: { symbol: "€", name: "EUR" },
  // Add more countries and currencies as needed
};

const defaultCurrency = { symbol: "₹", name: "INR" };

// Create a context for currency management
const CurrencyContext = createContext({
  currency: defaultCurrency,
  updateCurrency: (newCurrency: { symbol: string; name: string }) => {},
});

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [currency, setCurrency] = useState(defaultCurrency);

  useEffect(() => {
    const fetchCurrency = async () => {
      if (user?.unsafeMetadata?.currency) {
        setCurrency(
          user.unsafeMetadata.currency as { symbol: string; name: string }
        );
      } else {
        const data = await fetchGeolocation();
        if (data) {
          const countryCode: keyof typeof currencyData = data.country_code;
          if (currencyData[countryCode]) {
            setCurrency(currencyData[countryCode]);
          }
        }
      }
    };

    fetchCurrency();
  }, [user]);

  const updateCurrency = (newCurrency: { symbol: string; name: string }) => {
    setCurrency(newCurrency);
    if (user) {
      user.update({
        unsafeMetadata: { ...user.unsafeMetadata, currency: newCurrency },
      });
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
