"use client";

import {
  Input,
  InputProps,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";

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
  const isTypingRef = useRef(false);

  const formatNumberWithDecimals = (val?: number | null): string => {
    if (val === undefined || val === null || isNaN(val)) return "";
    return val.toLocaleString("id-ID", {
      minimumFractionDigits: val % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    if (!isTypingRef.current) {
      if (value === 0 || !value) {
        setDisplayValue(value === 0 ? "0" : "");
      } else {
        setDisplayValue(formatNumberWithDecimals(value));
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true;
    let input = e.target.value;

    // Remove "Rp" or "Rp." or spaces
    input = input.replace(/Rp\.?\s?/gi, "");

    let integerPart = "";
    let decimalPart = "";
    let hasDecimal = false;

    // Detect decimal separator (comma or period)
    const lastComma = input.lastIndexOf(",");
    const lastDot = input.lastIndexOf(".");

    let decSeparatorIdx = -1;
    if (lastComma > -1 && lastComma >= lastDot) {
      decSeparatorIdx = lastComma;
    } else if (
      lastDot > -1 &&
      (input.length - lastDot <= 3) &&
      (input.match(/\./g) || []).length === 1 &&
      lastComma === -1
    ) {
      // Single dot near the end (1-2 digits after it) treated as decimal dot
      decSeparatorIdx = lastDot;
    }

    if (decSeparatorIdx > -1) {
      hasDecimal = true;
      const rawInt = input.slice(0, decSeparatorIdx);
      const rawDec = input.slice(decSeparatorIdx + 1);
      integerPart = rawInt.replace(/[^0-9]/g, "");
      decimalPart = rawDec.replace(/[^0-9]/g, "").slice(0, 2);
    } else {
      integerPart = input.replace(/[^0-9]/g, "");
    }

    // Format integer part with thousand separator dots
    const formattedInt = integerPart
      ? parseInt(integerPart, 10).toLocaleString("id-ID")
      : "";

    let newDisplay = formattedInt;
    if (hasDecimal) {
      newDisplay = `${formattedInt || "0"},${decimalPart}`;
    }

    setDisplayValue(newDisplay);

    // Compute actual float value to pass to onChange
    const numericString = `${integerPart || "0"}${decimalPart ? `.${decimalPart}` : ""}`;
    const parsed = parseFloat(numericString);
    const finalVal = isNaN(parsed) ? 0 : parsed;

    onChange(fieldCustom != null ? fieldCustom : name, finalVal);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isTypingRef.current = false;
    if (value !== undefined && value !== null && !isNaN(value)) {
      setDisplayValue(value === 0 ? "0" : formatNumberWithDecimals(value));
    }
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };

  return (
    <InputGroup size={rest.size as any || "sm"}>
      <InputLeftElement pointerEvents="none" color="gray.500" fontSize="xs" pl={1}>
        <Text fontSize="xs" fontWeight="bold">Rp</Text>
      </InputLeftElement>
      <Input
        pl={8}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0"
        {...rest}
      />
    </InputGroup>
  );
}

