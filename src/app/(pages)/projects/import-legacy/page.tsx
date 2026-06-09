"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  useDisclosure,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  Card,
  CardBody,
  Grid,
  GridItem,
  useColorMode,
  Progress,
  Divider,
  Badge,
  Heading,
} from "@chakra-ui/react";
import { FiUpload, FiDownload, FiFileText, FiCheckCircle, FiInfo } from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import ImportLegacyPreviewModal from "./components/ImportLegacyPreviewModal";
import * as XLSX from 'xlsx';
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

interface ImportedLegacyData {
  fieldKeys: Record<string, string>;
  dataRows: Record<string, any>[];
}

export default function ProjectImportLegacyPage() {
  useDocumentTitle("Import Legacy Projects");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Auth setup (MANDATORY pattern)
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    
    if (token) setTokenData(token);
  }, [DataAuth]);

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedLegacyData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertExcelDate = (value: any): string => {
    if (typeof value === 'number' && value > 25000 && value < 100000) {
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00.000Z`;
    }
    return value?.toString() || '';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.xlsx')) {
      showToast({
        description: "Please select an Excel file (.xlsx)",
        statusToast: "error",
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const XLSX = await import('xlsx');
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Extract field keys from row 3 (A3:J3)
      const keysRange = XLSX.utils.decode_range("A3:J3");
      const fieldKeys: Record<string, string> = {};
      for (let col = keysRange.s.c; col <= keysRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 2, c: col }); // row 3 = index 2
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const colName = XLSX.utils.encode_col(col);
          fieldKeys[colName] = cell.v.toString();
        }
      }

      // Validate expected columns
      const expectedColumns = [
        'PROJECT_NUMBER',
        'PROJECT_NAME', 
        'DIVISION_CODE_INITIATION',
        'GROUP_CODE_INVOLVED',
        'PROJET_TYPE',
        'PROJECT_CURRENT_STATUS',
        'PROJECT_START_DATE',
        'PROJECT_GOLIVE_DATE',
        'PROJECT_GOOPS_DATE',
        'PROJECT_CLOSING_DATE'
      ];

      const actualColumns = Object.values(fieldKeys);
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length > 0) {
        showToast({
          description: `Missing columns: ${missingColumns.join(', ')}`,
          statusToast: "error",
        });
        setIsProcessing(false);
        setUploadProgress(0);
        return;
      }

      // Extract data rows from row 4 onwards (A4:I...)
      const dataRows = XLSX.utils.sheet_to_json(worksheet, { 
        range: 3, // Start from row 4 (index 3)
        header: 1,
        defval: "",
        raw: false,
      });

      // Process date columns (F, G, H, I = columns 5, 6, 7, 8)
      const processedRows = (dataRows as Record<string, any>[])
        .filter(row => Object.values(row).some(val => val !== ""))
        .map(row => {
          const processedRow: Record<string, any> = {};
          Object.keys(row).forEach((key, index) => {
            const value = row[key];
            if (index >= 5 && index <= 8) {
              processedRow[key] = convertExcelDate(value);
            } else {
              processedRow[key] = value;
            }
          });
          return processedRow;
        });

      if (processedRows.length === 0) {
        showToast({
          description: "No data found starting from row 4",
          statusToast: "error",
        });
        setIsProcessing(false);
        setUploadProgress(0);
        return;
      }

      // Check if data exceeds 1000 rows limit
      if (processedRows.length >= 1000) {
        showToast({
          description: "Import limit is 1000 data for better performance. Please split your file.",
          statusToast: "error",
        });
        resetFile();
        setIsProcessing(false);
        setUploadProgress(0);
        return;
      }

      setImportedData({
        fieldKeys,
        dataRows: processedRows
      });

      setUploadProgress(100);
      
      showToast({
        description: `File processed successfully! Found ${processedRows.length} rows`,
        statusToast: "success",
      });

      onOpen();
    } catch (error) {
      console.error("Error processing Excel file:", error);
      showToast({
        description: "Error processing Excel file",
        statusToast: "error",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template-import/TEMPLATE_IMPORT_PROJECT_LEGACY_KOBRA.xlsx';
    link.download = 'TEMPLATE_IMPORT_PROJECT_LEGACY_KOBRA.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast({
      description: "Template downloaded successfully!",
      statusToast: "success",
    });
  };

  const resetFile = () => {
    setSelectedFile(null);
    setImportedData(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = () => {
    resetFile();
    onClose();
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Import Legacy Projects"
        breadCrumb={["Home", "Projects", "Import Legacy Projects"]}
      />
      
      <Box px={6} py={4}>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Instructions Card */}
              <Card
                bg={colorMode === "light" ? "blue.50" : "blue.900"}
                border="1px"
                borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                rounded={radiusStyle}
              >
                <CardBody>
                  <HStack spacing={3} mb={4}>
                    <Icon as={FiInfo} color="blue.500" boxSize={5} />
                    <Heading size="md" color="blue.600">
                      Import Instructions
                    </Heading>
                  </HStack>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color={colorMode === "light" ? "blue.700" : "blue.200"}>
                      1. Download the Excel template below
                    </Text>
                    <Text fontSize="sm" color={colorMode === "light" ? "blue.700" : "blue.200"}>
                      2. Fill in legacy project data starting from row 4 (9 columns)
                    </Text>
                    <Text fontSize="sm" color={colorMode === "light" ? "blue.700" : "blue.200"}>
                      3. Upload the completed Excel file for validation and import
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Template Download Card */}
              <Card
                bg={colorMode === "light" ? "white" : "gray.800"}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                rounded={radiusStyle}
              >
                <CardBody>
                  <VStack spacing={4}>
                    <HStack spacing={3}>
                      <Icon as={FiDownload} color="green.500" boxSize={6} />
                      <Box>
                        <Text fontWeight="semibold" fontSize="lg">
                          Download Template
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Excel template for legacy projects
                        </Text>
                      </Box>
                    </HStack>
                    <Button
                      leftIcon={<Icon as={FiDownload} />}
                      colorScheme="green"
                      size="lg"
                      onClick={handleDownloadTemplate}
                      w="full"
                    >
                      Download Excel Template
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* File Upload Card */}
              <Card
                bg={colorMode === "light" ? "white" : "gray.800"}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                rounded={radiusStyle}
              >
                <CardBody>
                  <VStack spacing={4}>
                    <HStack spacing={3}>
                      <Icon as={FiUpload} color="blue.500" boxSize={6} />
                      <Box>
                        <Text fontWeight="semibold" fontSize="lg">
                          Upload Excel File
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Select your completed Excel file
                        </Text>
                      </Box>
                    </HStack>
                    
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileSelect}
                      disabled={isProcessing}
                      p={2}
                      border="2px dashed"
                      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                      rounded="lg"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                    />

                    {isProcessing && uploadProgress > 0 && (
                      <Box w="full">
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="blue.600">Processing file...</Text>
                          <Text fontSize="sm" color="blue.600">{uploadProgress}%</Text>
                        </HStack>
                        <Progress value={uploadProgress} colorScheme="blue" size="sm" rounded="full" />
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Selected File Info */}
              {selectedFile && (
                <Card
                  bg={colorMode === "light" ? "green.50" : "green.900"}
                  border="1px"
                  borderColor={colorMode === "light" ? "green.200" : "green.700"}
                  rounded={radiusStyle}
                >
                  <CardBody>
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                        <Box>
                          <Text fontWeight="medium" color="green.700">{selectedFile.name}</Text>
                          <Text fontSize="sm" color="green.600">
                            Size: {(selectedFile.size / 1024).toFixed(1)} KB
                          </Text>
                        </Box>
                      </HStack>
                      <Button size="sm" variant="ghost" colorScheme="red" onClick={resetFile}>
                        Remove
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem>
            <Card
              bg={colorMode === "light" ? "white" : "gray.800"}
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              rounded={radiusStyle}
              position="sticky"
              top="20px"
            >
              <CardBody>
                <VStack spacing={4} align="start">
                  <HStack spacing={2}>
                    <Icon as={FiFileText} color="purple.500" />
                    <Text fontWeight="semibold">Import Guidelines</Text>
                  </HStack>
                  
                  <Divider />
                  
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Badge colorScheme="blue" mb={2}>File Format</Badge>
                      <Text fontSize="sm" color="gray.600">Only .xlsx files are supported</Text>
                    </Box>
                    
                    <Box>
                      <Badge colorScheme="green" mb={2}>Template Structure</Badge>
                      <Text fontSize="sm" color="gray.600">Row 1-2: Template info</Text>
                      <Text fontSize="sm" color="gray.600">Row 3: Field headers (9 columns)</Text>
                      <Text fontSize="sm" color="gray.600">Row 4+: Legacy project data</Text>
                    </Box>
                    
                    <Box>
                      <Badge colorScheme="orange" mb={2}>Required Fields</Badge>
                      <Text fontSize="sm" color="gray.600">• PROJECT_NUMBER (unique)</Text>
                      <Text fontSize="sm" color="gray.600">• PROJECT_NAME</Text>
                      <Text fontSize="sm" color="gray.600">• DIVISION_CODE_INITIATION</Text>
                      <Text fontSize="sm" color="gray.600">• GROUP_CODE_INVOLVED</Text>
                      <Text fontSize="sm" color="gray.600">• PROJET_TYPE</Text>
                    </Box>

                    <Box>
                      <Badge colorScheme="purple" mb={2}>Project Types</Badge>
                      <Text fontSize="sm" color="gray.600">• PROCUREMENT</Text>
                      <Text fontSize="sm" color="gray.600">• DEPLOYMENT</Text>
                      <Text fontSize="sm" color="gray.600">• INTERNAL_PROGRAM</Text>
                    </Box>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>

      {/* Import Preview Modal */}
      {importedData && (
        <ImportLegacyPreviewModal
          isOpen={isOpen}
          onClose={handleModalClose}
          data={importedData}
          onImport={() => {
            showToast({
              description: "Legacy projects imported successfully!",
              statusToast: "success",
            });
            handleModalClose();
          }}
        />
      )}
    </LayoutAdmin>
  );
}
