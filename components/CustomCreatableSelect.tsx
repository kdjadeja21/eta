"use client";

import CreatableSelect from "react-select/creatable";
import {
  lumenSelectStyles,
  lumenSelectTheme,
} from "@/lib/react-select-styles";

const CustomCreatableSelect = (props: any) => {
  return (
    <CreatableSelect
      {...props}
      styles={lumenSelectStyles}
      theme={lumenSelectTheme}
    />
  );
};

export default CustomCreatableSelect;
