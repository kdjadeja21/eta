"use client";

import Select from "react-select";
import {
  lumenSelectStyles,
  lumenSelectTheme,
} from "@/lib/react-select-styles";

const CustomSelect = (props: any) => {
  return (
    <Select
      {...props}
      menuPlacement="auto"
      styles={lumenSelectStyles}
      theme={lumenSelectTheme}
    />
  );
};

export default CustomSelect;
