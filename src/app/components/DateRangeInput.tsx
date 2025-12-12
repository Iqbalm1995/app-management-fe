"use client";

import React, { useState, useEffect } from "react";
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
  HStack,
  Box,
  Text,
  Button,
  Stack,
} from "@chakra-ui/react";
import { FiCalendar, FiX, FiArrowRight } from "react-icons/fi";
import { radiusStyle } from "../constants/applicationConstants";

interface DateRangeInputProps {
  startValue: string | null;
  endValue: string | null;
  onStartChange: (value: string | null) => void;
  onEndChange: (value: string | null) => void;
  label?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  minDate?: string;
  maxDate?: string;
  size?: "sm" | "md" | "lg";
  showClearAll?: boolean;
  validateRange?: boolean;
}

export const DateRangeInput: React.FC<DateRangeInputProps> = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  label,
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
  helperText,
  errorMessage,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  minDate,
  maxDate,
  size = "md",
  showClearAll = true,
  validateRange = true,
}) => {
  const [rangeError, setRangeError] = useState<string | null>(null);

  const formatDateForInput = (date: string | null): string => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (validateRange && startValue && endValue) {
      if (new Date(endValue) < new Date(startValue)) {
        setRangeError("End date must be after start date");
      } else {
        setRangeError(null);
      }
    } else {
      setRangeError(null);
    }
  }, [startValue, endValue, validateRange]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onStartChange(new Date(newValue).toISOString());
    } else {
      onStartChange(null);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onEndChange(new Date(newValue).toISOString());
    } else {
      onEndChange(null);
    }
  };

  const handleClearStart = () => {
    onStartChange(null);
  };

  const handleClearEnd = () => {
    onEndChange(null);
  };

  const handleClearAll = () => {
    onStartChange(null);
    onEndChange(null);
  };

  const isError = isInvalid || !!rangeError;
  const displayError = errorMessage || rangeError;

  return (
    <FormControl isInvalid={isError} isRequired={isRequired} isDisabled={isDisabled}>
      {label && <FormLabel fontSize={size === "sm" ? "sm" : "md"}>{label}</FormLabel>}

      <Stack direction={{ base: "column", md: "row" }} spacing={2} align="start">
        <Box flex={1} w="full">
          <InputGroup size={size}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiCalendar} color="gray.400" />
            </InputLeftElement>

            <Input
              type="date"
              value={formatDateForInput(startValue)}
              onChange={handleStartChange}
              placeholder={startPlaceholder}
              min={minDate}
              max={endValue ? formatDateForInput(endValue) : maxDate}
              rounded={radiusStyle}
              pl={10}
            />

            {startValue && !isDisabled && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear start date"
                  icon={<FiX />}
                  size="xs"
                  variant="ghost"
                  onClick={handleClearStart}
                />
              </InputRightElement>
            )}
          </InputGroup>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Start
          </Text>
        </Box>

        <Icon
          as={FiArrowRight}
          mt={{ base: 0, md: size === "sm" ? 2 : size === "lg" ? 4 : 3 }}
          color="gray.400"
          display={{ base: "none", md: "block" }}
        />

        <Box flex={1} w="full">
          <InputGroup size={size}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiCalendar} color="gray.400" />
            </InputLeftElement>

            <Input
              type="date"
              value={formatDateForInput(endValue)}
              onChange={handleEndChange}
              placeholder={endPlaceholder}
              min={startValue ? formatDateForInput(startValue) : minDate}
              max={maxDate}
              rounded={radiusStyle}
              pl={10}
            />

            {endValue && !isDisabled && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear end date"
                  icon={<FiX />}
                  size="xs"
                  variant="ghost"
                  onClick={handleClearEnd}
                />
              </InputRightElement>
            )}
          </InputGroup>
          <Text fontSize="xs" color="gray.500" mt={1}>
            End
          </Text>
        </Box>
      </Stack>

      {(startValue || endValue) && showClearAll && !isDisabled && (
        <Button size="xs" variant="ghost" colorScheme="red" onClick={handleClearAll} mt={2}>
          Clear All
        </Button>
      )}

      {helperText && !isError && <FormHelperText>{helperText}</FormHelperText>}
      {displayError && isError && <FormErrorMessage>{displayError}</FormErrorMessage>}
    </FormControl>
  );
};
