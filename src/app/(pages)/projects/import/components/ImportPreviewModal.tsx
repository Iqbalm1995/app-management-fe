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
} from "@chakra-ui/react";
import { FiUpload, FiDatabase } from "react-icons/fi";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useProjects, { 
  ProjectImportDataBindModel, 
  ProjectImportDataBatchBindModel 
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
  const [validationResult, setValidationResult] = useState<{valid: number, invalid: number} | null>(null);

  // Service
  const { ProjectImportValidationBatch } = useProjects();

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
      const batchData: ProjectImportDataBindModel[] = data.dataRows.map(row => {
        const convertedRow: ProjectImportDataBindModel = {};
        
        // Map only essential fields
        Object.entries(data.fieldKeys).forEach(([colKey, fieldName]) => {
          const colIndex = colKey.length === 1 
            ? colKey.charCodeAt(0) - 65 
            : (colKey.charCodeAt(0) - 65 + 1) * 26 + (colKey.charCodeAt(1) - 65);
          
          let value = row[colIndex]?.toString() || "";
          
          // Handle numeric fields - set 0 if empty/null
          if (fieldName === 'WORKPROGRAM_AMOUNT_EXTERNAL' || 
              fieldName === 'WORKPROGRAM_AMOUNT_INTERNAL' ||
              fieldName === 'WORKPROGRAM_REALIZATION_EXTENAL' ||
              fieldName === 'WORKPROGRAM_REALIZATION_INTERNAL') {
            const numValue = parseFloat(value) || 0;
            (convertedRow as any)[fieldName.replace(/[^a-zA-Z0-9]/g, '')] = numValue;
          } else {
            (convertedRow as any)[fieldName.replace(/[^a-zA-Z0-9]/g, '')] = value;
          }
        });
        
        return convertedRow;
      });

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
        invalid: response.data.countInvalid
      });
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
    setIsImporting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsImporting(false);
    onImport();
  };

  const fieldKeysArray = Object.values(data.fieldKeys).filter(key => key);

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

            {/* Simple Data Preview */}
            <Card rounded={radiusStyle}>
              <CardBody>
                <Text fontWeight="semibold" mb={3}>Data Preview</Text>
                <Text fontSize="sm" color="gray.600">
                  {data.dataRows.length} records with {fieldKeysArray.length} fields ready for validation
                </Text>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Fields: {fieldKeysArray.slice(0, 5).join(", ")}
                  {fieldKeysArray.length > 5 && ` ... +${fieldKeysArray.length - 5} more`}
                </Text>
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
