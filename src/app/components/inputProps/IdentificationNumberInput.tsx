"use client";

import { Input, InputProps } from "@chakra-ui/react";
import React, { useState } from "react";

interface IdentificationNumberInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onlyNum?: boolean;
}

const formatDotSeparated = (
  input: string,
  onlyNum: boolean = false
): string => {
  // Clean input
  const cleaned = input
    .replace(onlyNum ? /[^0-9]/g : /[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  // Slice into parts
  const part1 = cleaned.slice(0, 2);
  const part2 = cleaned.slice(2, 4);
  const part3 = cleaned.slice(4, 8);

  let formatted = part1;
  if (part2) formatted += `.${part2}`;
  if (part3) formatted += `.${part3}`;

  return formatted;
};

const IdentificationNumberInput: React.FC<IdentificationNumberInputProps> = ({
  value,
  onChange,
  onlyNum = false,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(() =>
    formatDotSeparated(value || "", onlyNum)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatDotSeparated(raw, onlyNum);
    setInternalValue(formatted);
    onChange(formatted);
  };

  return (
    <Input
      value={internalValue}
      onChange={handleChange}
      placeholder="xx.xx.xxxx"
      {...rest}
    />
  );
};

export default IdentificationNumberInput;
