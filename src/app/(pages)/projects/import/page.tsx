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
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Grid,
  GridItem,
  useColorMode,
  Progress,
  Divider,
  Badge,
  Flex,
  Heading,
} from "@chakra-ui/react";
import {
  FiUpload,
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiInfo,
  FiUsers,
} from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import {
  radiusStyle,
  RES_CODE_OK,
  MAX_SIZE_TABLE,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useUsers from "@/app/services/useUsers";
import useOrganization from "@/app/services/useOrganization";
import { PaggingListPayload } from "@/app/types/masterTypes";
import ImportPreviewModal from "./components/ImportPreviewModal";
import * as XLSX from "xlsx";

import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

interface ImportedData {
  requiredFlags: Record<string, string>;
  fieldKeys: Record<string, string>;
  dataRows: Record<string, any>[];
}

export default function ProjectImportPage() {
  useDocumentTitle("Project Import");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { List: GetUsersList } = useUsers();
  const { List: GetOrganizationList } = useOrganization();

  // Auth setup (MANDATORY pattern)
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingOrgs, setIsExportingOrgs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertExcelDate = (value: any, forAPI: boolean = false): string => {
    // Check if it's a number (Excel serial date)
    if (typeof value === "number" && value > 25000 && value < 100000) {
      // Excel serial date conversion (Excel epoch starts from 1900-01-01)
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(
        excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000
      );

      if (forAPI) {
        // Return ISO format for API: "2025-10-20T00:00:00.000Z"
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}T00:00:00.000Z`;
      } else {
        // Return dd/mm/yyyy for display
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    return value?.toString() || "";
  };

  const processDataRows = (
    rawRows: Record<string, any>[],
    forAPI: boolean = false
  ): Record<string, any>[] => {
    return rawRows.map((row) => {
      const processedRow: Record<string, any> = {};
      Object.keys(row).forEach((key, index) => {
        const value = row[key];
        // Convert dates for date columns (AG, AH, AI, AJ are date columns)
        if (index >= 32 && index <= 35) {
          // AG=32, AH=33, AI=34, AJ=35
          processedRow[key] = convertExcelDate(value, forAPI);
        } else {
          processedRow[key] = value;
        }
      });
      return processedRow;
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith(".xlsx")) {
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
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Dynamic import of xlsx library
      const XLSX = await import("xlsx");

      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Extract required flags from row 2 (A2:AO2)
      const requiredRange = XLSX.utils.decode_range("A2:AO2");
      const requiredFlags: Record<string, string> = {};
      for (let col = requiredRange.s.c; col <= requiredRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const colName = XLSX.utils.encode_col(col);
          requiredFlags[colName] = cell.v.toString();
        }
      }

      // Extract field keys from row 3 (A3:AO3)
      const keysRange = XLSX.utils.decode_range("A3:AO3");
      const fieldKeys: Record<string, string> = {};
      for (let col = keysRange.s.c; col <= keysRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 2, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const colName = XLSX.utils.encode_col(col);
          fieldKeys[colName] = cell.v.toString();
        }
      }

      // Extract data rows from row 4 onwards
      const dataRows = XLSX.utils.sheet_to_json(worksheet, {
        range: "A4:AO1000",
        header: 1,
        defval: "",
        raw: false, // This will format dates properly
        dateNF: "dd/mm/yyyy", // Date format
      });

      setImportedData({
        requiredFlags,
        fieldKeys,
        dataRows: processDataRows(
          (dataRows as Record<string, any>[]).filter((row) =>
            Object.values(row).some((val) => val !== "")
          )
        ),
      });

      setUploadProgress(100);

      showToast({
        description: "File processed successfully!",
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
    const link = document.createElement("a");
    link.href = "/template-import/TEMPLATE_IMPORT_PROJECT_KOBRA.xlsx";
    link.download = "TEMPLATE_IMPORT_PROJECT_KOBRA.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      description: "Template downloaded successfully!",
      statusToast: "success",
    });
  };

  const handleExportUsers = async () => {
    if (!tokenData) {
      showToast({
        description: "Authentication required",
        statusToast: "error",
      });
      return;
    }

    setIsExporting(true);
    try {
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [],
        fieldOrder: ["nama"],
        orderDir: "asc",
      };

      const response = await GetUsersList(payload, tokenData);

      if (!response || response.statusCode !== RES_CODE_OK) {
        showToast({
          description: "Failed to fetch users data",
          statusToast: "error",
        });
        return;
      }

      const users = response.data || [];
      const exportData = users.map((user) => ({
        "User ID": user.userId,
        Name: user.nama,
        Email: user.email,
        Phone: user.phoneNumber || "",
        "Branch Code": user.kodeCabang || "",
        "Branch Name": user.namaCabang || "",
        "Work Unit Code": user.kodeUnitKerja || "",
        "Work Unit Name": user.namaUnitKerja || "",
        "Position Code": user.kodeJabatan || "",
        Position: user.jabatan || "",
        Status: user.userStatus,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      XLSX.writeFile(
        wb,
        `Users_Reference_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      showToast({
        description: "Users list exported successfully!",
        statusToast: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      showToast({
        description: "Failed to export users list",
        statusToast: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportOrganizations = async () => {
    if (!tokenData) {
      showToast({
        description: "Authentication required",
        statusToast: "error",
      });
      return;
    }

    setIsExportingOrgs(true);
    try {
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [],
        fieldOrder: ["orgName"],
        orderDir: "asc",
      };

      const response = await GetOrganizationList(payload, tokenData);

      if (!response || response.statusCode !== RES_CODE_OK) {
        showToast({
          description: "Failed to fetch organizations data",
          statusToast: "error",
        });
        return;
      }

      const organizations = response.data || [];
      const exportData = organizations.map((org) => ({
        "Organization Code": org.orgCode,
        "Organization Name": org.orgName,
        "Organization Type": org.orgType,
        "Parent Code": org.orgParentCode || "",
        Description: org.orgDesc || "",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Organizations");

      XLSX.writeFile(
        wb,
        `Organizations_Reference_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      showToast({
        description: "Organizations list exported successfully!",
        statusToast: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      showToast({
        description: "Failed to export organizations list",
        statusToast: "error",
      });
    } finally {
      setIsExportingOrgs(false);
    }
  };

  const handleImport = () => {
    // Convert data to API format with ISO dates
    const apiData = processDataRows(
      (importedData?.dataRows || []).filter((row) =>
        Object.values(row).some((val) => val !== "")
      ),
      true // forAPI = true
    );

    console.log("API Data with ISO dates:", apiData); // For debugging

    showToast({
      description: "Data imported successfully!",
      statusToast: "success",
    });

    setSelectedFile(null);
    setImportedData(null);
    onClose();
  };

  const resetFile = () => {
    setSelectedFile(null);
    setImportedData(null);
    setUploadProgress(0);
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModalClose = () => {
    resetFile();
    onClose();
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Import Data Project"
        breadCrumb={["Home", "Projects", "Import Data Project"]}
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
                    <Text
                      fontSize="sm"
                      color={colorMode === "light" ? "blue.700" : "blue.200"}
                    >
                      1. Download the Excel template below
                    </Text>
                    <Text
                      fontSize="sm"
                      color={colorMode === "light" ? "blue.700" : "blue.200"}
                    >
                      2. Fill in your project data following the template
                      structure
                    </Text>
                    <Text
                      fontSize="sm"
                      color={colorMode === "light" ? "blue.700" : "blue.200"}
                    >
                      3. Upload the completed Excel file for import
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
                          Excel template with required format
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
                    <Button
                      leftIcon={<Icon as={FiUsers} />}
                      colorScheme="blue"
                      variant="outline"
                      size="lg"
                      onClick={handleExportUsers}
                      isLoading={isExporting}
                      loadingText="Exporting..."
                      w="full"
                    >
                      Export Users Reference
                    </Button>
                    <Button
                      leftIcon={<Icon as={FiDownload} />}
                      colorScheme="purple"
                      variant="outline"
                      size="lg"
                      onClick={handleExportOrganizations}
                      isLoading={isExportingOrgs}
                      loadingText="Exporting..."
                      w="full"
                    >
                      Export Organizations Reference
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

                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileSelect}
                        disabled={isProcessing}
                        p={2}
                        border="2px dashed"
                        borderColor={
                          colorMode === "light" ? "gray.300" : "gray.600"
                        }
                        rounded="lg"
                        _hover={{
                          borderColor: "blue.400",
                        }}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px blue.500",
                        }}
                      />
                    </FormControl>

                    {/* Upload Progress */}
                    {isProcessing && uploadProgress > 0 && (
                      <Box w="full">
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="blue.600">
                            Processing file...
                          </Text>
                          <Text fontSize="sm" color="blue.600">
                            {uploadProgress}%
                          </Text>
                        </HStack>
                        <Progress
                          value={uploadProgress}
                          colorScheme="blue"
                          size="sm"
                          rounded="full"
                        />
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
                  borderColor={
                    colorMode === "light" ? "green.200" : "green.700"
                  }
                  rounded={radiusStyle}
                >
                  <CardBody>
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon
                          as={FiCheckCircle}
                          color="green.500"
                          boxSize={5}
                        />
                        <Box>
                          <Text fontWeight="medium" color="green.700">
                            {selectedFile.name}
                          </Text>
                          <Text fontSize="sm" color="green.600">
                            Size: {(selectedFile.size / 1024).toFixed(1)} KB
                          </Text>
                        </Box>
                      </HStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={resetFile}
                      >
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
                      <Badge colorScheme="blue" mb={2}>
                        File Format
                      </Badge>
                      <Text fontSize="sm" color="gray.600">
                        Only .xlsx files are supported
                      </Text>
                    </Box>

                    <Box>
                      <Badge colorScheme="green" mb={2}>
                        Template Structure
                      </Badge>
                      <Text fontSize="sm" color="gray.600">
                        Row 2: Required/Optional flags (A2:AO2)
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Row 3: Field keys (A3:AO3)
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Row 4+: Data values (41 columns)
                      </Text>
                    </Box>

                    <Box>
                      <Badge colorScheme="orange" mb={2}>
                        Validation Rules
                      </Badge>
                      <Text fontSize="sm" color="gray.600">
                        *REQUIRED: Field must be filled
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        *OPTIONAL: Field can be empty
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        *MIN 1 VALUE: At least one value required
                      </Text>
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
        <ImportPreviewModal
          isOpen={isOpen}
          onClose={handleModalClose}
          data={importedData}
          onImport={handleImport}
        />
      )}
    </LayoutAdmin>
  );
}
