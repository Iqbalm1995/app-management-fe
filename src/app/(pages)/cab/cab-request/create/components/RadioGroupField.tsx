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
import { FiFileText, FiFolder, FiPaperclip, FiX } from "react-icons/fi";

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
  onFileChange?: (file: File | string | null) => void;
  onOpenProjectFilesModal?: () => void;
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
  onOpenProjectFilesModal,
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
            <Flex w="full" as={HStack} spacing={4} align="center" wrap="wrap">
              {options.map((opt) => (
                <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
              ))}

              {/* Choose from Project when value is ADA or YA */}
              {isPositiveValue && (onFileChange || onOpenProjectFilesModal) && (
                <HStack spacing={2} pl={2} wrap="wrap">
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
                        maxW={{ base: "140px", md: "220px" }}
                        isTruncated
                        title={getFileName(fileAttachment)}
                      >
                        {getFileName(fileAttachment)}
                      </Text>
                      {onOpenProjectFilesModal && (
                        <Button
                          size="2xs"
                          variant="ghost"
                          colorScheme="blue"
                          fontSize="2xs"
                          h="20px"
                          px={1.5}
                          onClick={onOpenProjectFilesModal}
                          title="Ganti dokumen dari project"
                        >
                          Ganti
                        </Button>
                      )}
                      <IconButton
                        size="2xs"
                        icon={<FiX />}
                        aria-label="Hapus file"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => onFileChange?.(null)}
                      />
                    </HStack>
                  ) : (
                    onOpenProjectFilesModal && (
                      <Button
                        variant="outline"
                        size="xs"
                        colorScheme="blue"
                        leftIcon={<FiFolder />}
                        fontWeight="semibold"
                        rounded="md"
                        h="28px"
                        px={2.5}
                        onClick={onOpenProjectFilesModal}
                      >
                        Pilih dari Dokumen Project
                      </Button>
                    )
                  )}
                </HStack>
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
