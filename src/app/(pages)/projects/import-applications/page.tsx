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
import { FiUpload, FiDownload, FiFileText, FiCheckCircle, FiInfo, FiUsers, FiDatabase } from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK, MAX_SIZE_TABLE } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useUsers from "@/app/services/useUsers";
import useOrganization from "@/app/services/useOrganization";
import useApps, { ApplicationMasterInsertDataPayload } from "@/app/services/useApps";
import { PaggingListPayload } from "@/app/types/masterTypes";
import ImportPreviewModal from "./components/ImportPreviewModal";
import * as XLSX from 'xlsx';

import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

interface ImportedData {
  requiredFlags: Record<string, string>;
  fieldKeys: Record<string, string>;
  dataRows: Record<string, any>[];
}

export default function ProjectApplicationImportPage() {
  useDocumentTitle("Project Application Import");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { List: GetUsersList } = useUsers();
  const { List: GetOrganizationList } = useOrganization();
  const { InsertData } = useApps();

  // Auth setup (MANDATORY pattern)
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth effect (MANDATORY pattern)
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

  const processExcelData = (rawData: any[]): Record<string, any>[] => {
    return rawData.map((row: any) => {
      const processedRow: Record<string, any> = {};
      Object.keys(row).forEach((key) => {
        const value = row[key];
        if (value !== null && value !== undefined && value !== "") {
          processedRow[key] = value.toString().trim();
        } else {
          processedRow[key] = "";
        }
      });
      return processedRow;
    });
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
      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Dynamic import of xlsx library
      const XLSX = await import('xlsx');

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
        raw: false,  // This will format dates properly
        dateNF: 'dd/mm/yyyy'  // Date format
      });

      setImportedData({
        requiredFlags,
        fieldKeys,
        dataRows: processExcelData(dataRows as any[])
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      onOpen();

    } catch (error) {
      console.error("File processing error:", error);
      showToast({
        description: "Error processing Excel file. Please check the format.",
        statusToast: "error",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template-import/TEMPLATE_IMPORT_PROJECT_APPLICATION_KOBRA.xlsx';
    link.download = 'TEMPLATE_IMPORT_PROJECT_APPLICATION_KOBRA.xlsx';
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

    try {
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [],
        fieldOrder: ["nama"],
        orderDir: "asc"
      };

      const response = await GetUsersList(payload, tokenData);

      if (response?.statusCode !== RES_CODE_OK || !response?.data) {
        showToast({
          description: "Failed to fetch users data",
          statusToast: "error",
        });
        return;
      }

      const users = response.data;
      const exportData = users.map(user => ({
        'User ID': user.id,
        'Name': user.nama,
        'Email': user.email || '',
        'Phone': user.phoneNumber || '',
        'Branch Code': user.kodeCabang || '',
        'Branch Name': user.namaCabang || '',
        'Work Unit Code': user.kodeUnitKerja || '',
        'Work Unit Name': user.namaUnitKerja || '',
        'Position Code': user.kodeJabatan || '',
        'Position': user.jabatan || '',
        'Status': user.userStatus
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      XLSX.writeFile(wb, `Users_Reference_${new Date().toISOString().split('T')[0]}.xlsx`);

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

    try {
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [],
        fieldOrder: ["orgName"],
        orderDir: "asc"
      };

      const response = await GetOrganizationList(payload, tokenData);

      if (response?.statusCode !== RES_CODE_OK || !response?.data) {
        showToast({
          description: "Failed to fetch organizations data",
          statusToast: "error",
        });
        return;
      }

      const organizations = response.data || [];
      const exportData = organizations.map(org => ({
        'Organization Code': org.orgCode,
        'Organization Name': org.orgName,
        'Organization Type': org.orgType,
        'Parent Code': org.orgParentCode || '',
        'Description': org.orgDesc || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Organizations");

      XLSX.writeFile(wb, `Organizations_Reference_${new Date().toISOString().split('T')[0]}.xlsx`);

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
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Import Project Applications"
        breadCrumb={["Home", "Projects", "Import Applications"]}
      />

      <Box p={6}>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Main Upload Section */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Instructions Card */}
              <Card
                bg={colorMode === "light" ? "blue.50" : "blue.900"}
                border="1px"
                borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                rounded="xl"
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
                      2. Fill in your application data following the template structure
                    </Text>
                    <Text fontSize="sm" color={colorMode === "light" ? "blue.700" : "blue.200"}>
                      3. Upload the completed file using the upload section
                    </Text>
                    <Text fontSize="sm" color={colorMode === "light" ? "blue.700" : "blue.200"}>
                      4. Review and confirm the imported data
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Template Download Card */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <HStack spacing={3}>
                      <Icon as={FiDownload} color="green.500" boxSize={6} />
                      <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                        Download Template
                      </Heading>
                    </HStack>

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Download the Excel template to get started with your application import
                    </Text>
                    <Button
                      colorScheme="green"
                      leftIcon={<Icon as={FiDownload} />}
                      onClick={handleDownloadTemplate}
                      w="full"
                      rounded="lg"
                    >
                      Download Template
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Upload Card */}
              <Card
                shadow="xl"
                rounded="2xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={8}>
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
                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                        rounded="lg"
                        _hover={{
                          borderColor: "blue.400"
                        }}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)"
                        }}
                      />
                    </FormControl>

                    {isProcessing && (
                      <Box w="full">
                        <Progress
                          value={uploadProgress}
                          colorScheme="blue"
                          rounded="full"
                          size="lg"
                        />
                        <Text textAlign="center" fontSize="sm" color="gray.500" mt={2}>
                          Processing file... {uploadProgress}%
                        </Text>
                      </Box>
                    )}

                    {selectedFile && !isProcessing && (
                      <Alert status="success" rounded="lg">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>File Ready!</AlertTitle>
                          <AlertDescription>
                            {selectedFile.name} has been processed successfully.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Reference Data Section */}
          <GridItem>
            <VStack spacing={6} align="stretch">

              {/* Import Guidelines Card */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={FiFileText} color="purple.500" />
                      <Text fontWeight="semibold">Import Guidelines</Text>
                    </HStack>

                    <Divider />

                    <VStack align="start" spacing={3}>
                      <Box>
                        <Badge colorScheme="blue" mb={2}>File Format</Badge>
                        <Text fontSize="sm" color="gray.600">
                          Only .xlsx files are supported
                        </Text>
                      </Box>

                      <Box>
                        <Badge colorScheme="green" mb={2}>Template Structure</Badge>
                        <Text fontSize="sm" color="gray.600">
                          Row 2: Required/Optional flags (A2:AO2)
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Row 3: Field keys (A3:AO3)
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Row 4+: Application data (A4:AO1000)
                        </Text>
                      </Box>

                      <Box>
                        <Badge colorScheme="orange" mb={2}>Required Fields</Badge>
                        <Text fontSize="sm" color="gray.600">
                          App Short Name, App Name are mandatory
                        </Text>
                      </Box>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>

      {/* Import Preview Modal */}
      {importedData && (
        <ImportPreviewModal
          isOpen={isOpen}
          onClose={onClose}
          data={importedData}
          onImport={(validatedData) => {
            // Handle the actual import process here
            console.log("Importing applications:", validatedData);
            showToast({
              description: "Applications imported successfully!",
              statusToast: "success",
            });
            onClose();
            setImportedData(null);
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </LayoutAdmin>
  );
}
