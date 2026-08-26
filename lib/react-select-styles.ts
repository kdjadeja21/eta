import type { StylesConfig, ThemeConfig } from "react-select";

/*
 * Lumen styling for react-select. Uses the app's CSS tokens directly, so
 * light/dark mode is handled by the cascade — no JS theme detection needed.
 */
export const lumenSelectStyles: StylesConfig<any, boolean> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "var(--card)",
    borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    boxShadow: state.isFocused ? "0 0 0 1px var(--ring)" : "none",
    color: "var(--foreground)",
    ":hover": {
      borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    maxHeight: "200px",
    overflowY: "auto",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--foreground)",
  }),
  input: (base) => ({
    ...base,
    color: "var(--foreground)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor:
      isFocused || isSelected ? "var(--accent)" : "var(--popover)",
    color:
      isFocused || isSelected
        ? "var(--accent-foreground)"
        : "var(--popover-foreground)",
    ":active": {
      backgroundColor: "var(--accent)",
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "var(--secondary)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--secondary-foreground)",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    ":hover": {
      backgroundColor: "var(--destructive)",
      color: "#ffffff",
    },
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "114px",
  }),
};

export const lumenSelectTheme: ThemeConfig = (baseTheme) => ({
  ...baseTheme,
  borderRadius: 8,
  colors: {
    ...baseTheme.colors,
    primary: "var(--primary)",
    primary25: "var(--accent)",
    primary50: "var(--accent)",
    primary75: "var(--accent)",
    neutral0: "var(--card)",
    neutral80: "var(--foreground)",
  },
});
