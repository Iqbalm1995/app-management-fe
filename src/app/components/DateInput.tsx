"use client";

import React from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { FiCalendar, FiX } from "react-icons/fi";
import { format } from "date-fns";
import { radiusStyle } from "../constants/applicationConstants";

interface DateInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  minDate?: string;
  maxDate?: string;
  size?: "sm" | "md" | "lg";
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select date",
  helperText,
  errorMessage,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  minDate,
  maxDate,
  size = "md",
}) => {
  const formatDateForInput = (date: string | null): string => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onChange(new Date(newValue).toISOString());
    } else {
      onChange(null);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <FormControl isInvalid={isInvalid} isRequired={isRequired} isDisabled={isDisabled}>
      {label && <FormLabel fontSize={size === "sm" ? "sm" : "md"}>{label}</FormLabel>}

      <InputGroup size={size}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiCalendar} color="gray.400" />
        </InputLeftElement>

        <Input
          type="date"
          value={formatDateForInput(value)}
          onChange={handleChange}
          placeholder={placeholder}
          min={minDate}
          max={maxDate}
          rounded={radiusStyle}
          pl={10}
        />

        {value && !isDisabled && (
          <InputRightElement>
            <IconButton
              aria-label="Clear date"
              icon={<FiX />}
              size="xs"
              variant="ghost"
              onClick={handleClear}
            />
          </InputRightElement>
        )}
      </InputGroup>

      {helperText && !isInvalid && <FormHelperText>{helperText}</FormHelperText>}
      {errorMessage && isInvalid && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </FormControl>
  );
};
