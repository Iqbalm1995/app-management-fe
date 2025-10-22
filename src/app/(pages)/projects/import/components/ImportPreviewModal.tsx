"use client";

import React, { useState, useMemo, useRef } from "react";
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
  Badge,
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
  Heading,
} from "@chakra-ui/react";
import { FiCheck, FiX, FiUpload, FiDatabase, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";

interface ImportedData {
  requiredFlags: Record<string, string>;
  fieldKeys: Record<string, string>;
  dataRows: Record<string, any>[];
}

interface ExcelRowData {
  MEMO_NUMBER?: string;
  MEMO_NARRATIVE?: string;
  PIC_USER_ID: string;
  PIC_USER_NIP: string;
  PIC_FULL_NAME: string;
  PIC_PHONE: string;
  PIC_EMAIL: string;
  PIC_DIVISION_CODE: string;
  PIC_GROUP_CODE: string;
  RBB_CODE_EXTERNAL?: string;
  WORKPROGRAM_NAME_EXTERNAL?: string;
  ACCOUNT_NAME_EXTERNAL?: string;
  ACCOUNT_NUMBER_EXTERNAL?: string;
  CC_EXTERNAL?: string;
  WORKPROGRAM_AMOUNT_EXTERNAL?: string;
  WORKPROGRAM_REALIZATION_EXTENAL?: string;
  WORKPROGRAM_DIVISION_CODE_EXTERNAL?: string;
  WORKPROGRAM_GROUP_CODE_EXTERNAL?: string;
  RBB_CODE_INTERNAL?: string;
  WORKPROGRAM_NAME_INTERNAL?: string;
  ACCOUNT_NAME_INTERNAL?: string;
  ACCOUNT_NUMBER_INTERNAL?: string;
  CC_INTERNAL?: string;
  WORKPROGRAM_AMOUNT_INTERNAL?: string;
  WORKPROGRAM_REALIZATION_INTERNAL?: string;
  PROJECT_NUMBER: string;
  PROJECT_NAME: string;
  DIVISION_CODE_INITIATION: string;
  GROUP_CODE_INVOLVED: string;
  PROJECT_CHARACTERISTIC: string;
  PROJET_TYPE: string;
  PROJECT_CURRENT_STATUS: string;
  PROJECT_START_DATE: string;
  PROJECT_GO_LIVE_PLAN_DATE: string;
  PROJECT_GO_LIVE_REALIZATION_DATE: string;
  PROJECT_CLOSING_DATE?: string;
  NOTE?: string;
  PROJECT_ASSIGMENT_USER_IDS: string;
  PROJECT_APP_INITIAL: string;
  PROJECT_APP_NAME: string;
  PROJECT_FEATURES: string;
}

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ImportedData;
  onImport: () => void;
}

interface TableRow {
  rowNumber: number;
  status: string;
  [key: string]: string | number;
}

export default function ImportPreviewModal({
  isOpen,
  onClose,
  data,
  onImport,
}: ImportPreviewModalProps) {
  const { colorMode } = useColorMode();
  const [isImporting, setIsImporting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const columnHelper = createColumnHelper<TableRow>();
  
  // State for formatted Excel data
  const [formattedExcelData, setFormattedExcelData] = useState<ExcelRowData[]>([]);

  // Convert raw data to Excel column structure
  const convertToExcelFormat = useMemo(() => {
    const converted: ExcelRowData[] = data.dataRows.map((row, index) => {
      const excelRow: ExcelRowData = {} as ExcelRowData;
      
      // Map array indices to Excel column names
      Object.entries(data.fieldKeys).forEach(([colKey, fieldName]) => {
        const colIndex = colKey.length === 1 
          ? colKey.charCodeAt(0) - 65  // A=0, B=1, etc.
          : (colKey.charCodeAt(0) - 65 + 1) * 26 + (colKey.charCodeAt(1) - 65); // AA=26, AB=27, etc.
        
        const value = row[colIndex];
        (excelRow as any)[fieldName] = value?.toString() || '';
      });
      
      return excelRow;
    });
    
    setFormattedExcelData(converted);
    return converted;
  }, [data]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const validateRow = (row: Record<string, any>) => {
    const errors: string[] = [];
    Object.entries(data.fieldKeys).forEach(([colKey, fieldName]) => {
      const flagValue = data.requiredFlags[colKey]?.toLowerCase();
      // Fix: Convert column letter to array index properly
      const colIndex = colKey.length === 1 
        ? colKey.charCodeAt(0) - 65  // A=0, B=1, etc.
        : (colKey.charCodeAt(0) - 65 + 1) * 26 + (colKey.charCodeAt(1) - 65); // AA=26, AB=27, etc.
      
      const value = row[colIndex];
      const valueStr = value?.toString().trim() || '';
      
      if (flagValue === '*required' && !valueStr) {
        errors.push(`${fieldName} is required`);
      } else if (flagValue === '*min 1 value') {
        const values = valueStr.split(',').map((v: string) => v.trim()).filter((v: string) => v);
        if (values.length === 0) {
          errors.push(`${fieldName} requires at least 1 value`);
        }
      }
    });
    return errors;
  };

  const getValidationDetails = () => {
    const invalidRows: { rowNumber: number; errors: string[] }[] = [];
    data.dataRows.forEach((row, index) => {
      const errors = validateRow(row);
      if (errors.length > 0) {
        invalidRows.push({ rowNumber: index + 1, errors });
      }
    });
    return invalidRows;
  };

  const getValidationSummary = () => {
    let validRows = 0;
    let invalidRows = 0;
    data.dataRows.forEach((row) => {
      const errors = validateRow(row);
      if (errors.length === 0) validRows++;
      else invalidRows++;
    });
    return { validRows, invalidRows };
  };

  const handleImport = async () => {
    setIsImporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsImporting(false);
    onImport();
  };

  const { validRows, invalidRows } = getValidationSummary();
  const fieldKeysArray = Object.values(data.fieldKeys).filter(key => key);
  const invalidRowDetails = getValidationDetails();

  // Prepare table data
  const tableData = useMemo(() => {
    return data.dataRows.map((row, index) => {
      const errors = validateRow(row);
      const isValid = errors.length === 0;
      const rowValues = Object.values(row);
      
      const tableRow: TableRow = {
        rowNumber: index + 1,
        status: isValid ? 'valid' : 'invalid',
      };

      // Add all field values to the row
      fieldKeysArray.forEach((fieldName, fieldIndex) => {
        tableRow[fieldName] = rowValues[fieldIndex]?.toString() || '-';
      });

      return tableRow;
    });
  }, [data.dataRows, fieldKeysArray]);

  // Create columns
  const columns = useMemo(() => {
    const cols: any[] = [
      columnHelper.accessor('rowNumber', {
        header: 'Row',
        cell: (info) => info.getValue(),
        size: 60,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const isValid = info.getValue() === 'valid';
          return (
            <Badge colorScheme={isValid ? "green" : "red"} size="sm">
              <Icon as={isValid ? FiCheck : FiX} />
            </Badge>
          );
        },
        size: 80,
      }),
    ];

    // Add columns for all fields
    fieldKeysArray.forEach((fieldName) => {
      cols.push({
        accessorKey: fieldName,
        header: fieldName,
        cell: (info: any) => (
          <Text fontSize="sm" noOfLines={1} title={String(info.getValue())}>
            {String(info.getValue()) || '-'}
          </Text>
        ),
        size: 150,
      });
    });

    return cols;
  }, [fieldKeysArray, columnHelper]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiDatabase} color="blue.500" />
            <VStack align="start" spacing={0}>
              <Text>Data Preview - {fieldKeysArray.length} Columns</Text>
              <Text fontSize="sm" color="gray.500">Step 1: Review → Step 2: API Validation → Step 3: Submit</Text>
            </VStack>
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
                    <StatNumber color="green.500">{validRows}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Invalid Records</StatLabel>
                    <StatNumber color="red.500">{invalidRows}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Fields</StatLabel>
                    <StatNumber color="purple.500">{fieldKeysArray.length}</StatNumber>
                  </Stat>
                </StatGroup>
              </CardBody>
            </Card>

            {/* Debugging Data Preview (Temporary) */}
            <Card bg={colorMode === "light" ? "yellow.50" : "yellow.900"} rounded={radiusStyle}>
              <CardBody>
                <Text fontWeight="semibold" color="yellow.700" mb={3}>
                  🔧 Excel Formatted Data Structure (Debug)
                </Text>
                <Box 
                  maxH="300px" 
                  overflowY="auto" 
                  bg={colorMode === "light" ? "gray.100" : "gray.800"}
                  p={3}
                  rounded="md"
                  fontSize="xs"
                  fontFamily="mono"
                >
                  <Text whiteSpace="pre-wrap">
                    {JSON.stringify({
                      totalRecords: formattedExcelData.length,
                      sampleRecord1: formattedExcelData[0] || {},
                      sampleRecord2: formattedExcelData[1] || {},
                      allFieldKeys: Object.values(data.fieldKeys),
                      requiredFields: Object.entries(data.requiredFlags)
                        .filter(([_, flag]) => flag.toLowerCase() === '*required')
                        .map(([colKey, _]) => data.fieldKeys[colKey])
                        .filter(Boolean)
                    }, null, 2)}
                  </Text>
                </Box>
                <Text fontSize="xs" color="yellow.600" mt={2}>
                  State: formattedExcelData[] - Ready for API validation
                </Text>
              </CardBody>
            </Card>

            {/* Validation Alert */}
            <Alert 
              status="info"
              rounded={radiusStyle}
            >
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">
                  Data Preview Ready - API Validation Pending
                </Text>
                <Text fontSize="sm">
                  Next: Click "Validate with API" to check data against server rules
                </Text>
              </VStack>
            </Alert>

            {/* Validation Details */}
            {invalidRowDetails.length > 0 && (
              <Card bg={colorMode === "light" ? "red.50" : "red.900"} rounded={radiusStyle}>
                <CardBody>
                  <Text fontWeight="semibold" color="red.600" mb={3}>
                    Validation Errors:
                  </Text>
                  <VStack align="start" spacing={2}>
                    {invalidRowDetails.map((detail, index) => (
                      <Box key={index}>
                        <Text fontSize="sm" fontWeight="medium" color="red.700">
                          Row {detail.rowNumber}:
                        </Text>
                        <VStack align="start" spacing={1} ml={4}>
                          {detail.errors.map((error, errorIndex) => (
                            <Text key={errorIndex} fontSize="sm" color="red.600">
                              • {error}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Custom Table with Horizontal Scroll */}
            <Box position="relative">
              {/* Scroll Controls */}
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color="gray.600">
                  Scroll horizontally to see all {fieldKeysArray.length} columns
                </Text>
                <HStack>
                  <Button size="sm" leftIcon={<FiChevronLeft />} onClick={scrollLeft}>
                    Left
                  </Button>
                  <Button size="sm" rightIcon={<FiChevronRight />} onClick={scrollRight}>
                    Right
                  </Button>
                </HStack>
              </HStack>
              
              <Box 
                ref={scrollRef}
                overflowX="scroll" 
                overflowY="auto"
                maxH="500px"
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                rounded="md"
                sx={{
                  '&::-webkit-scrollbar': {
                    height: '12px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: colorMode === "light" ? '#f1f1f1' : '#2d3748',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: colorMode === "light" ? '#888' : '#4a5568',
                    borderRadius: '6px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: colorMode === "light" ? '#555' : '#2d3748',
                  },
                }}
              >
                <Table variant="simple" size="sm" minW="max-content">
                  <Thead position="sticky" top={0} zIndex={1}>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Tr key={headerGroup.id} bg={colorMode === "light" ? "gray.50" : "gray.700"}>
                        {headerGroup.headers.map((header) => (
                          <Th
                            key={header.id}
                            py={3}
                            px={4}
                            minW="120px"
                            color={colorMode === "light" ? "gray.700" : "gray.200"}
                            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          >
                            <Heading as="h5" size="sm">
                              {header.isPlaceholder ? null : (
                                flexRender(header.column.columnDef.header, header.getContext())
                              )}
                            </Heading>
                          </Th>
                        ))}
                      </Tr>
                    ))}
                  </Thead>
                  <Tbody>
                    {table.getRowModel().rows.map((row) => (
                      <Tr 
                        key={row.id}
                        bg={row.original.status === 'invalid' ? (colorMode === "light" ? "red.50" : "red.900") : "transparent"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <Td
                            key={cell.id}
                            py={2}
                            px={4}
                            minW="120px"
                            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={() => {
                // TODO: Implement API validation
                console.log('API Validation - Formatted Excel Data:', formattedExcelData);
                console.log('Total records to validate:', formattedExcelData.length);
              }}
              leftIcon={<Icon as={FiDatabase} />}
            >
              Validate with API ({formattedExcelData.length} records)
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleImport}
              isLoading={isImporting}
              loadingText="Importing..."
              leftIcon={<Icon as={FiUpload} />}
              isDisabled={true} // Disabled until API validation passes
            >
              Submit Upload (Locked)
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
