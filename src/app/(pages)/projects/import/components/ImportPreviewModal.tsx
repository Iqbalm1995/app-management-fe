"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  HStack,
  VStack,
  Alert,
  AlertIcon,
  Icon,
  useColorMode,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
} from "@chakra-ui/react";
import { FiUpload, FiDatabase, FiCheck, FiX } from "react-icons/fi";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useProjects, {
  ProjectImportDataBindModel,
  ProjectImportDataBatchBindModel,
} from "@/app/services/useProjects";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";

interface ImportedData {
  requiredFlags: Record<string, string>;
  fieldKeys: Record<string, string>;
  dataRows: Record<string, any>[];
}

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ImportedData;
  onImport: () => void;
}

export default function ImportPreviewModal({
  isOpen,
  onClose,
  data,
  onImport,
}: ImportPreviewModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();

  // Auth setup (minimal)
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  // State
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isApiValidated, setIsApiValidated] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: number;
    invalid: number;
  } | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "invalid">("all");

  // Service
  const { ProjectImportValidationBatch, ProjectImportBatch } = useProjects();

  // API validation function
  const handleApiValidation = async () => {
    if (!tokenData) {
      showToast({
        description: "Authentication required",
        statusToast: "error",
      });
      return;
    }

    try {
      setIsValidating(true);

      // Convert data to API format (lightweight)
      const batchData: ProjectImportDataBindModel[] = data.dataRows.map(
        (row) => {
          const convertedRow: ProjectImportDataBindModel = {};

          // Map only essential fields
          Object.entries(data.fieldKeys).forEach(([colKey, fieldName]) => {
            const colIndex =
              colKey.length === 1
                ? colKey.charCodeAt(0) - 65
                : (colKey.charCodeAt(0) - 65 + 1) * 26 +
                  (colKey.charCodeAt(1) - 65);

            let value = row[colIndex]?.toString() || "";

            // Handle numeric fields - set 0 if empty/null
            if (
              fieldName === "WORKPROGRAM_AMOUNT_EXTERNAL" ||
              fieldName === "WORKPROGRAM_AMOUNT_INTERNAL" ||
              fieldName === "WORKPROGRAM_REALIZATION_EXTENAL" ||
              fieldName === "WORKPROGRAM_REALIZATION_INTERNAL"
            ) {
              const numValue = parseFloat(value) || 0;
              (convertedRow as any)[fieldName.replace(/[^a-zA-Z0-9]/g, "")] =
                numValue;
            } else {
              (convertedRow as any)[fieldName.replace(/[^a-zA-Z0-9]/g, "")] =
                value;
            }
          });

          return convertedRow;
        }
      );

      const payload: ProjectImportDataBatchBindModel = { batchData };
      const response = await ProjectImportValidationBatch(payload, tokenData);

      if (!response || response.statusCode !== RES_CODE_OK || !response.data) {
        showToast({
          description: response?.message || "Validation failed",
          statusToast: "error",
        });
        return;
      }

      setValidationResult({
        valid: response.data.countValid,
        invalid: response.data.countInvalid,
      });
      setApiResponse(response.data);
      setIsApiValidated(true);

      // Debug logging
      console.log("API Response:", response.data);
      console.log("Batch Response:", response.data.batchResponse);
      if (response.data.batchResponse?.[0]) {
        console.log(
          "First row validation:",
          response.data.batchResponse[0].validationResponse
        );
      }

      showToast({
        description: `Validation completed: ${response.data.countValid} valid, ${response.data.countInvalid} invalid`,
        statusToast: response.data.countInvalid > 0 ? "warning" : "success",
      });
    } catch (error) {
      console.error("Validation error:", error);
      showToast({
        description: "Validation failed",
        statusToast: "error",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!tokenData || !isApiValidated) return;

    try {
      setIsImporting(true);

      const batchData: ProjectImportDataBindModel[] = data.dataRows.map(
        (row) => {
          const convertedRow: ProjectImportDataBindModel = {};

          Object.entries(data.fieldKeys).forEach(([colKey, fieldName]) => {
            const colIndex =
              colKey.length === 1
                ? colKey.charCodeAt(0) - 65
                : (colKey.charCodeAt(0) - 65 + 1) * 26 +
                  (colKey.charCodeAt(1) - 65);

            let value = row[colIndex]?.toString() || "";

            if (
              fieldName === "WORKPROGRAM_AMOUNT_EXTERNAL" ||
              fieldName === "WORKPROGRAM_AMOUNT_INTERNAL" ||
              fieldName === "WORKPROGRAM_REALIZATION_EXTENAL" ||
              fieldName === "WORKPROGRAM_REALIZATION_INTERNAL"
            ) {
              const numValue = parseFloat(value) || 0;
              (convertedRow as any)[fieldName.replace(/[^a-zA-Z0-9]/g, "")] =
                numValue;
            } else {
              (convertedRow as any)[fieldName.replace(/[^a-zA-Z0-9]/g, "")] =
                value;
            }
          });

          return convertedRow;
        }
      );

      const payload: ProjectImportDataBatchBindModel = { batchData };
      const response = await ProjectImportBatch(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Projects imported successfully",
          statusToast: "success",
        });
        onImport();
        onClose();
      } else {
        showToast({
          description: response?.message || "Import failed",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "Import failed",
        statusToast: "error",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const fieldKeysArray = Object.values(data.fieldKeys).filter((key) => key);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiDatabase} color="blue.500" />
            <Text>Import Preview - {fieldKeysArray.length} Columns</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Statistics */}
            <Card
              bg={colorMode === "light" ? "gray.50" : "gray.700"}
              rounded={radiusStyle}
            >
              <CardBody>
                <StatGroup>
                  <Stat>
                    <StatLabel>Total Records</StatLabel>
                    <StatNumber color="blue.500">
                      {data.dataRows.length}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Valid Records</StatLabel>
                    <StatNumber color="green.500">
                      {validationResult?.valid || "—"}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Invalid Records</StatLabel>
                    <StatNumber color="red.500">
                      {validationResult?.invalid || "—"}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Status</StatLabel>
                    <StatNumber
                      color={isApiValidated ? "green.500" : "orange.500"}
                    >
                      {isApiValidated ? "Validated" : "Pending"}
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </CardBody>
            </Card>

            {/* Validation Alert */}
            <Alert
              status={
                !isApiValidated
                  ? "info"
                  : validationResult?.invalid === 0
                  ? "success"
                  : "warning"
              }
              rounded={radiusStyle}
            >
              <AlertIcon />
              <Text>
                {!isApiValidated
                  ? "Click 'Validate with API' to check data"
                  : validationResult?.invalid === 0
                  ? "All records validated - Ready to submit"
                  : `${validationResult?.invalid} records have validation errors`}
              </Text>
            </Alert>

            {/* Data Table */}
            <Card rounded={radiusStyle}>
              <CardBody>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="semibold">Data Preview</Text>
                  {isApiValidated && (
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        colorScheme={statusFilter === "all" ? "blue" : "gray"}
                        variant={statusFilter === "all" ? "solid" : "outline"}
                        onClick={() => setStatusFilter("all")}
                      >
                        All ({data.dataRows.length})
                      </Button>
                      <Button
                        size="xs"
                        colorScheme={statusFilter === "valid" ? "green" : "gray"}
                        variant={statusFilter === "valid" ? "solid" : "outline"}
                        onClick={() => setStatusFilter("valid")}
                      >
                        Valid ({validationResult?.valid || 0})
                      </Button>
                      <Button
                        size="xs"
                        colorScheme={statusFilter === "invalid" ? "red" : "gray"}
                        variant={statusFilter === "invalid" ? "solid" : "outline"}
                        onClick={() => setStatusFilter("invalid")}
                      >
                        Invalid ({validationResult?.invalid || 0})
                      </Button>
                    </HStack>
                  )}
                </HStack>
                <Box overflowX="auto" maxH="300px" overflowY="auto">
                  <Table size="sm" variant="simple">
                    <Thead
                      position="sticky"
                      top={0}
                      bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    >
                      <Tr>
                        <Th>Row</Th>
                        <Th>Status</Th>
                        {fieldKeysArray.map((field, index) => (
                          <Th key={index} minW="120px">
                            {field}
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.dataRows
                        .map((row, rowIndex) => {
                          const rowValidation = apiResponse?.batchResponse?.[rowIndex];
                          const isRowValid = isApiValidated ? rowValidation?.isValid ?? true : null;
                          return { row, rowIndex, isRowValid };
                        })
                        .filter(({ isRowValid }) => {
                          if (!isApiValidated || statusFilter === "all") return true;
                          if (statusFilter === "valid") return isRowValid === true;
                          if (statusFilter === "invalid") return isRowValid === false;
                          return true;
                        })
                        .map(({ row, rowIndex, isRowValid }) => {
                          return (
                          <Tr
                            key={rowIndex}
                            bg={
                              isApiValidated
                                ? isRowValid
                                  ? "green.50"
                                  : "red.50"
                                : "transparent"
                            }
                          >
                            <Td fontWeight="medium">{rowIndex + 1}</Td>
                            <Td textAlign="center">
                              {isApiValidated ? (
                                isRowValid ? (
                                  <Icon
                                    as={FiCheck}
                                    color="green.500"
                                    boxSize={4}
                                  />
                                ) : (
                                  <Icon as={FiX} color="red.500" boxSize={4} />
                                )
                              ) : (
                                <Text fontSize="xs" color="gray.400">
                                  —
                                </Text>
                              )}
                            </Td>
                            {fieldKeysArray.map((field, colIndex) => {
                              const colKey = Object.keys(data.fieldKeys).find(
                                (key) => data.fieldKeys[key] === field
                              );
                              const colIndexNum =
                                colKey?.length === 1
                                  ? colKey.charCodeAt(0) - 65
                                  : colKey
                                  ? (colKey.charCodeAt(0) - 65 + 1) * 26 +
                                    (colKey.charCodeAt(1) - 65)
                                  : 0;
                              const value = row[colIndexNum]?.toString() || "-";

                              // Convert field name to camelCase to match backend response
                              const toCamelCase = (str: string) => {
                                return str
                                  .toLowerCase()
                                  .replace(/_([a-z])/g, (match, letter) =>
                                    letter.toUpperCase()
                                  );
                              };

                              const fieldNameCamel = toCamelCase(field);
                              const validationResponse =
                                apiResponse?.batchResponse?.[rowIndex]
                                  ?.validationResponse;

                              let validationError = null;
                              if (validationResponse) {
                                validationError =
                                  validationResponse[fieldNameCamel];
                              }

                              const hasError =
                                isApiValidated &&
                                validationError &&
                                validationError.trim() !== "";
                              const tooltipText = hasError
                                ? validationError
                                : value;

                              // Debug logging for first row
                              if (rowIndex === 0 && colIndex < 5) {
                                console.log(
                                  `Field: ${field}, CamelCase: ${fieldNameCamel}, Error: ${validationError}, HasError: ${hasError}`
                                );
                              }

                              return (
                                <Td
                                  key={colIndex}
                                  bg={
                                    isApiValidated
                                      ? hasError
                                        ? "red.100"
                                        : "green.50"
                                      : "transparent"
                                  }
                                >
                                  <Tooltip
                                    label={tooltipText}
                                    placement="top"
                                    hasArrow
                                  >
                                    <Text
                                      fontSize="sm"
                                      noOfLines={1}
                                      color={
                                        isApiValidated
                                          ? hasError
                                            ? "red.700"
                                            : "green.700"
                                          : "inherit"
                                      }
                                    >
                                      {value}
                                    </Text>
                                  </Tooltip>
                                </Td>
                              );
                            })}
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleApiValidation}
              isLoading={isValidating}
              loadingText="Validating..."
              leftIcon={<Icon as={FiDatabase} />}
              isDisabled={isValidating}
            >
              Validate with API ({data.dataRows.length} records)
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleImport}
              isLoading={isImporting}
              loadingText="Importing..."
              leftIcon={<Icon as={FiUpload} />}
              isDisabled={
                !isApiValidated || (validationResult?.invalid || 0) > 0
              }
            >
              Submit Upload ({validationResult?.valid || 0} records)
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
