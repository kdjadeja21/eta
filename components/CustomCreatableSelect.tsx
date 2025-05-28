"use client";

import CreatableSelect from "react-select/creatable";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const CustomCreatableSelect = (props: any) => {
  const { theme } = useTheme(); // 'light', 'dark', or 'system'
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "#1f2937" : "#ffffff", // Tailwind slate-800 or white
      borderColor: isDark ? "#374151" : "#d1d5db", // slate-700 or gray-300
      color: isDark ? "#ffffff" : "#000000",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      maxHeight: "200px", // Set max height for dropdown
      overflowY: "auto", // Enable vertical scrolling
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#000000",
    }),
    input: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#000000",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280", // gray-400 / gray-500
    }),
    option: (base: any, { isFocused }: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: isFocused
        ? isDark
          ? "#374151" // slate-700
          : "#e5e7eb" // gray-200
        : isDark
        ? "#1f2937" // slate-800
        : "#ffffff",
      color: isDark ? "#ffffff" : "#000000",
    }),
    // ✅ Multi-select tags
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "#374151" : "#e5e7eb", // slate-700 / gray-200
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#000000",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: isDark ? "#f87171" : "#ef4444", // red-400 / red-500
      ":hover": {
        backgroundColor: isDark ? "#991b1b" : "#fee2e2", // darker red bg on hover
        color: isDark ? "#ffffff" : "#b91c1c", // white or red-700
      },
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: "114px", // Approx height for 3 options (3 * 38px)
    }),
  };

  return (
    <CreatableSelect
      {...props}
      menuPlacement="auto"
      styles={customStyles}
      theme={(baseTheme) => ({
        ...baseTheme,
        borderRadius: 6,
        colors: {
          ...baseTheme.colors,
          primary: isDark ? "#3b82f6" : "#2563eb", // blue-500 / blue-600
          neutral0: isDark ? "#1f2937" : "#ffffff",
          neutral80: isDark ? "#ffffff" : "#000000",
        },
      })}
    />
  );
};

export default CustomCreatableSelect;
