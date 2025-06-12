"use client";

import {
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface CurrencyInputProps extends Omit<InputProps, "onChange"> {
  value: number;
  name: string;
  fieldCustom?: string;
  onChange: (field: string, value: number, shouldValidate?: boolean) => void;
}

export default function CurrencyInput({
  value,
  onChange,
  name,
  fieldCustom,
  ...rest
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  const formatCurrency = (amount: number): string => {
    return "Rp. " + amount.toLocaleString("id-ID");
  };

  const parseCurrency = (str: string): number => {
    const cleaned = str.replace(/[^0-9]/g, "");
    return parseInt(cleaned || "0", 10);
  };

  useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const parsed = parseCurrency(input);
    setDisplayValue(formatCurrency(parsed));
    onChange(fieldCustom != null ? fieldCustom : name, parsed);
  };

  return (
    <InputGroup>
      <Input
        value={displayValue}
        onChange={handleChange}
        placeholder="Rp. 0"
        {...rest}
      />
      <InputRightElement
        pointerEvents="none"
        color="gray.400"
        fontSize="sm"
        mr={2}
      >
        ,00 &nbsp;,-
      </InputRightElement>
    </InputGroup>
  );
}
