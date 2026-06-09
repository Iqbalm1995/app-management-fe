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
  ProjectImportLegacyDataBindModel, 
  ProjectImportLegacyDataBatchBindModel 
} from "@/app/services/useProjects";

interface ImportedLegacyData {
  fieldKeys: Record<string, string>;
  dataRows: Record<string, any>[];
}

interface ImportLegacyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ImportedLegacyData;
  onImport: () => void;
}

export default function ImportLegacyPreviewModal({
  isOpen,
  onClose,
  data,
  onImport,
}: ImportLegacyPreviewModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  
  // Auth setup
  const [tokenData, setTokenData] = useState<string>("");
  
  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  // State
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isApiValidated, setIsApiValidated] = useState(false);
  const [validationResult, setValidationResult] = useState<{valid: number, invalid: number} | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "invalid">("all");

  // Service
  const { ProjectImportLegacyValidationBatch, ProjectImportLegacyBatch } = useProjects();

  // Field mapping: Excel column to API property
  const fieldMapping: Record<string, string> = {
    'PROJECT_NUMBER': 'ProjectNumber',
    'PROJECT_NAME': 'ProjectName',
    'DIVISION_CODE_INITIATION': 'DivisionCodeInitiation',
    'GROUP_CODE_INVOLVED': 'GroupCodeInvolved',
    'PROJET_TYPE': 'ProjetType',
    'PROJECT_CURRENT_STATUS': 'ProjectCurrentStatus',
    'PROJECT_START_DATE': 'ProjectStartDate',
    'PROJECT_GOLIVE_DATE': 'ProjectGoLivePlanDate',
    'PROJECT_GOOPS_DATE': 'ProjectGoLiveRealizationDate',
    'PROJECT_CLOSING_DATE': 'ProjectClosingDate',
  };

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

      // Convert data to API format
      const batchData: ProjectImportLegacyDataBindModel[] = data.dataRows.map(row => {
        const convertedRow: ProjectImportLegacyDataBindModel = {};
        
        Object.entries(data.fieldKeys).forEach(([colKey, fieldName]) => {
          const colIndex = colKey.charCodeAt(0) - 65;
          const value = row[colIndex]?.toString() || "";
          const apiFieldName = fieldMapping[fieldName];
          
          if (apiFieldName) {
            (convertedRow as any)[apiFieldName] = value;
          }
        });
        
        return convertedRow;
      });

      const payload: ProjectImportLegacyDataBatchBindModel = { batchData };
      const response = await ProjectImportLegacyValidationBatch(payload, tokenData);

      if (!response || response.statusCode !== RES_CODE_OK || !response.data) {
        showToast({
          description: response?.message || "Validation failed",
          statusToast: "error",
        });
        return;
      }

      setValidationResult({
        valid: response.data.countValid,
        invalid: response.data.countInvalid
      });
      setApiResponse(response.data);
      setIsApiValidated(true);

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

      const batchData: ProjectImportLegacyDataBindModel[] = data.dataRows.map(row => {
        const convertedRow: ProjectImportLegacyDataBindModel = {};
        
        Object.entries(data.fieldKeys).forEach(([colKey, fieldName]) => {
          const colIndex = colKey.charCodeAt(0) - 65;
          const value = row[colIndex]?.toString() || "";
          const apiFieldName = fieldMapping[fieldName];
          
          if (apiFieldName) {
            (convertedRow as any)[apiFieldName] = value;
          }
        });
        
        return convertedRow;
      });

      const payload: ProjectImportLegacyDataBatchBindModel = { batchData };
      const response = await ProjectImportLegacyBatch(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Legacy projects imported successfully",
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

  const fieldKeysArray = Object.values(data.fieldKeys).filter(key => key);

  // Filter data based on validation status
  const filteredRows = data.dataRows.filter((row, index) => {
    if (!isApiValidated || statusFilter === "all") return true;
    const rowValidation = apiResponse?.batchResponse?.[index];
    const isRowValid = rowValidation?.isValid ?? true;
    return statusFilter === "valid" ? isRowValid : !isRowValid;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiDatabase} color="blue.500" />
            <Text>Legacy Import Preview - {fieldKeysArray.length} Columns</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Statistics */}
            <Card bg={colorMode === "light" ? "gray.50" : "gray.700"} rounded={radiusStyle}>
              <CardBody>
                <StatGroup>
                  <Stat>
                    <StatLabel>Total Records</StatLabel>
                    <StatNumber color="blue.500">{data.dataRows.length}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Valid Records</StatLabel>
                    <StatNumber color="green.500">{validationResult?.valid || "—"}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Invalid Records</StatLabel>
                    <StatNumber color="red.500">{validationResult?.invalid || "—"}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Status</StatLabel>
                    <StatNumber color={isApiValidated ? "green.500" : "orange.500"}>
                      {isApiValidated ? "Validated" : "Pending"}
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </CardBody>
            </Card>

            {/* Validation Alert */}
            <Alert 
              status={!isApiValidated ? "info" : validationResult?.invalid === 0 ? "success" : "warning"}
              rounded={radiusStyle}
            >
              <AlertIcon />
              <Text>
                {!isApiValidated 
                  ? "Click 'Validate with API' to check data"
                  : validationResult?.invalid === 0
                    ? "All records validated - Ready to submit"
                    : `${validationResult?.invalid} records have validation errors`
                }
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
                        size="sm"
                        variant={statusFilter === "all" ? "solid" : "outline"}
                        colorScheme="blue"
                        onClick={() => setStatusFilter("all")}
                      >
                        All ({data.dataRows.length})
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "valid" ? "solid" : "outline"}
                        colorScheme="green"
                        onClick={() => setStatusFilter("valid")}
                      >
                        Valid ({validationResult?.valid || 0})
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "invalid" ? "solid" : "outline"}
                        colorScheme="red"
                        onClick={() => setStatusFilter("invalid")}
                      >
                        Invalid ({validationResult?.invalid || 0})
                      </Button>
                    </HStack>
                  )}
                </HStack>
                <Box overflowX="auto" maxH="400px" overflowY="auto">
                  <Table size="sm" variant="simple">
                    <Thead position="sticky" top={0} bg={colorMode === "light" ? "gray.50" : "gray.700"} zIndex={1}>
                      <Tr>
                        <Th>Row</Th>
                        <Th>Status</Th>
                        {fieldKeysArray.map((field, index) => (
                          <Th key={index} minW="150px">{field}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredRows.map((row, displayIndex) => {
                        const originalIndex = data.dataRows.indexOf(row);
                        const rowValidation = apiResponse?.batchResponse?.[originalIndex];
                        const isRowValid = isApiValidated ? (rowValidation?.isValid ?? true) : null;
                        
                        return (
                          <Tr key={originalIndex} bg={isApiValidated ? (isRowValid ? "green.50" : "red.50") : "transparent"}>
                            <Td fontWeight="medium">{originalIndex + 1}</Td>
                            <Td textAlign="center">
                              {isApiValidated ? (
                                isRowValid ? (
                                  <Icon as={FiCheck} color="green.500" boxSize={4} />
                                ) : (
                                  <Icon as={FiX} color="red.500" boxSize={4} />
                                )
                              ) : (
                                <Text fontSize="xs" color="gray.400">—</Text>
                              )}
                            </Td>
                            {fieldKeysArray.map((field, colIndex) => {
                              const colKey = Object.keys(data.fieldKeys).find(key => data.fieldKeys[key] === field);
                              const colIndexNum = colKey ? colKey.charCodeAt(0) - 65 : 0;
                              const value = row[colIndexNum]?.toString() || "-";
                              
                              const apiFieldName = fieldMapping[field];
                              const validationResponse = rowValidation?.validationResponse;
                              
                              let validationError = null;
                              if (validationResponse && apiFieldName) {
                                // Convert PascalCase to camelCase for API response
                                const camelCaseField = apiFieldName.charAt(0).toLowerCase() + apiFieldName.slice(1);
                                validationError = validationResponse[camelCaseField];
                              }
                              
                              const hasError = isApiValidated && validationError != null && validationError.trim() !== "";
                              const tooltipText = hasError ? validationError : value;
                              
                              return (
                                <Td key={colIndex} bg={isApiValidated ? (hasError ? "red.100" : "transparent") : "transparent"}>
                                  <Tooltip label={tooltipText} placement="top" hasArrow isDisabled={!hasError && value === "-"}>
                                    <Text 
                                      fontSize="sm" 
                                      color={hasError ? "red.700" : "inherit"}
                                      fontWeight={hasError ? "medium" : "normal"}
                                      cursor={hasError ? "help" : "default"}
                                      whiteSpace="normal"
                                      wordBreak="break-word"
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
              isDisabled={!isApiValidated || (validationResult?.invalid || 0) > 0}
            >
              Submit Upload ({validationResult?.valid || 0} records)
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
