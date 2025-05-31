"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { fetchGeolocation } from "@/lib/geolocation-service";
import { showSuccessToast } from "./ui/toast";

// Define types for currency data
type CurrencyInfo = {
  symbol: string;
  name: string;
};

type CurrencyMap = {
  [key: string]: CurrencyInfo;
};

// Currency data mapping countries to currency symbols
const currencyData: CurrencyMap = {
  IN: { symbol: "₹", name: "INR" },
  US: { symbol: "$", name: "USD" },
  GB: { symbol: "£", name: "GBP" },
  EU: { symbol: "€", name: "EUR" },
  // Add more countries and currencies as needed
};

const defaultCurrency: CurrencyInfo = { symbol: "₹", name: "INR" };

// Create a context for currency management
const CurrencyContext = createContext({
  currency: defaultCurrency,
  updateCurrency: (newCurrency: CurrencyInfo) => {},
});

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [currency, setCurrency] = useState<CurrencyInfo>(defaultCurrency);

  useEffect(() => {
    if (!isLoaded) return; // Wait until user data is loaded

    const fetchCurrency = async () => {
      try {
        // First try to get currency from user metadata
        if (user?.unsafeMetadata?.currency) {
          const userCurrency = user.unsafeMetadata.currency as CurrencyInfo;
          if (userCurrency.symbol && userCurrency.name) {
            setCurrency(userCurrency);
            return;
          }
        }

        // If no user currency, try geolocation
        const data = await fetchGeolocation();
        if (data?.country_code) {
          const countryCode = data.country_code;
          if (currencyData[countryCode]) {
            setCurrency(currencyData[countryCode]);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching currency:", error);
        // Keep using default currency on error
      }
    };

    fetchCurrency();
  }, [user]);

  const updateCurrency = async (newCurrency: CurrencyInfo) => {
    try {
      setCurrency(newCurrency);
      if (user) {
        await user.update({
          unsafeMetadata: { ...user.unsafeMetadata, currency: newCurrency },
        });
        showSuccessToast("Currency updated successfully!");
      }
    } catch (error) {
      console.error("Error updating currency:", error);
      // Revert to previous currency on error
      setCurrency(currency);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
