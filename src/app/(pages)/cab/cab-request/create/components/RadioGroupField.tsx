"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef } from "react";
import { FiFileText, FiPaperclip, FiX } from "react-icons/fi";

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
  fileAttachment?: File | string | null;
  onFileChange?: (file: File | null) => void;
  fileAccept?: string;
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
  fileAttachment,
  onFileChange,
  fileAccept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
}: RadioGroupFieldProps) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = colorMode === "dark";

  const isPositiveValue = value === "ADA" || value === "YA";

  const getFileName = (file: File | string | null | undefined): string => {
    if (!file) return "";
    if (typeof file === "string") return file;
    return file.name;
  };

  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <InputLayout>
        <FormLabel h="full" mt={2}>{label}</FormLabel>
        <Stack spacing={0} h="full">
          <RadioGroup onChange={onChange} value={value}>
            <Flex w="full" as={HStack} spacing={6} align="center" wrap="wrap">
              {options.map((opt) => (
                <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
              ))}

              {/* Add File text link / Attached file chip when value is ADA or YA and onFileChange is provided */}
              {isPositiveValue && onFileChange && (
                <Box pl={2}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept={fileAccept}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      onFileChange(file);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />

                  {fileAttachment ? (
                    <HStack
                      spacing={1.5}
                      bg={isDark ? "blue.900" : "blue.50"}
                      border="1px solid"
                      borderColor={isDark ? "blue.700" : "blue.200"}
                      px={2.5}
                      py={0.5}
                      rounded="md"
                    >
                      <Icon as={FiFileText} color="blue.500" fontSize="xs" />
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color={isDark ? "blue.200" : "blue.700"}
                        maxW={{ base: "140px", md: "240px" }}
                        isTruncated
                        title={getFileName(fileAttachment)}
                      >
                        {getFileName(fileAttachment)}
                      </Text>
                      <IconButton
                        size="2xs"
                        icon={<FiX />}
                        aria-label="Hapus file"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => onFileChange(null)}
                      />
                    </HStack>
                  ) : (
                    <Button
                      variant="link"
                      size="xs"
                      colorScheme="blue"
                      leftIcon={<FiPaperclip />}
                      fontWeight="semibold"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Add File
                    </Button>
                  )}
                </Box>
              )}
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
