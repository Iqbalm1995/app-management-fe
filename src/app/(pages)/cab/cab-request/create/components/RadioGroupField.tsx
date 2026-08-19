"use client";

import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { InputLayout } from "@/app/components/layoutContentBody";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  options: RadioOption[];
  isRequired?: boolean;
  helperText?: string;
  children?: React.ReactNode;
  showChildren?: boolean;
  error?: string;
}

const RadioGroupField = ({
  label,
  name,
  value,
  onChange,
  options,
  isRequired,
  helperText,
  children,
  showChildren,
  error,
}: RadioGroupFieldProps) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <InputLayout>
        <FormLabel h="full" mt={2}>{label}</FormLabel>
        <Stack spacing={0} h="full">
          <RadioGroup onChange={onChange} value={value}>
            <Flex w="full" as={HStack} spacing={8}>
              {options.map((opt) => (
                <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
              ))}
            </Flex>
          </RadioGroup>
          {helperText && <FormHelperText as="i" fontSize="xs">{helperText}</FormHelperText>}
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </Stack>
      </InputLayout>

      {/* Conditional children with animation */}
      <AnimatePresence>
        {showChildren && children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box mt={3} pl={{ base: 0, md: "25%" }}>{children}</Box>
          </motion.div>
        )}
      </AnimatePresence>
    </FormControl>
  );
};

export default RadioGroupField;

// ─── Shortcut helpers ────────────────────────────────────────────────────────
export const RadioAdaTidak = (props: Omit<RadioGroupFieldProps, "options">) => (
  <RadioGroupField
    {...props}
    options={[
      { label: "Ada", value: "ADA" },
      { label: "Tidak Ada", value: "TIDAK_ADA" },
    ]}
  />
);

export const RadioYaTidak = (props: Omit<RadioGroupFieldProps, "options">) => (
  <RadioGroupField
    {...props}
    options={[
      { label: "Ya", value: "YA" },
      { label: "Tidak", value: "TIDAK" },
    ]}
  />
);

export const RadioAdaTidakSimple = (props: Omit<RadioGroupFieldProps, "options">) => (
  <RadioGroupField
    {...props}
    options={[
      { label: "Ada", value: "ADA" },
      { label: "Tidak", value: "TIDAK" },
    ]}
  />
);
