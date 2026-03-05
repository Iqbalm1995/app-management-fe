"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useSysMasterSequencesConfig from "@/app/services/useSysMasterSequencesConfig";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spacer,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEdit, FiSave, FiX, FiSettings } from "react-icons/fi";

interface SequenceConfigData {
  id: string;
  seqCode: string;
  seqName: string;
  sysModCode: string;
  currentSquenceNumber: number;
  nextSequenceNumber: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface UpdateFormData {
  currentSquenceNumber: number;
  nextSequenceNumber: number;
}

export default function SequencesConfigPage() {
  const router = useRouter();
  const showToast = useToastHelper();
  const { GetPagedList, UpdateSequenceConfigData, isLoading: serviceLoading } = useSysMasterSequencesConfig();
  
  // Auth state (following audit-trail pattern)
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  
  // State
  const [sequenceData, setSequenceData] = useState<SequenceConfigData[]>([]);
  const [isLoadingProcess, setIsLoadingProcess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [RefreshData, setRefreshData] = useState<number>(0);
  
  // Confirmation dialog
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; data: UpdateFormData } | null>(null);

  // Header configuration
  const headerProps: HeaderContentProps = {
    titleName: "Sequence Configurations",
    breadCrumb: ["Home", "Master Data", "Sequences Config"],
  };

  // Validation schema
  const validationSchema = Yup.object({
    currentSquenceNumber: Yup.number()
      .min(0, "Must be 0 or greater")
      .required("Current sequence number is required"),
    nextSequenceNumber: Yup.number()
      .min(1, "Must be 1 or greater")
      .required("Next sequence number is required"),
  });

  // Form hook
  const formik = useFormik<UpdateFormData>({
    initialValues: {
      currentSquenceNumber: 0,
      nextSequenceNumber: 1,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (editingId) {
        // Direct update without confirmation dialog
        const config = sequenceData.find(c => c.id === editingId);
        if (!config || !tokenData) return;

        const updateData = {
          id: config.id,
          seqCode: config.seqCode,
          seqName: config.seqName,
          sysModCode: config.sysModCode,
          currentSquenceNumber: values.currentSquenceNumber,
          nextSequenceNumber: values.nextSequenceNumber,
        };

        const result = await UpdateSequenceConfigData(updateData, tokenData);
        
        if (result?.statusCode === RES_CODE_OK) {
          showToast({
            description: "Sequence configuration updated successfully",
            statusToast: "success",
          });
          setEditingId(null);
          setRefreshData(prev => prev + 1);
        } else {
          showToast({
            description: result?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
        }
      }
    },
  });

  // Fetch data (following audit-trail pattern)
  const fetchData = async () => {
    if (!DataAuth || !tokenData) return;

    setIsLoadingProcess(true);

    try {
      const PayloadList: PaggingListPayload = {
        page: 0,
        limit: 100,
        search: searchTerm,
        filterWhere: [],
        fieldOrder: ["SeqCode"],
        orderDir: "asc",
      };

      const requestData = await GetPagedList(PayloadList, tokenData);

      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setSequenceData(requestData.data);
      } else {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching sequence configurations:", error);
      showToast({
        description: "Failed to fetch sequence configurations",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  // Initialize auth data (following audit-trail pattern)
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

  // Data Fetching Effect (following audit-trail pattern)
  useEffect(() => {
    if (DataAuth && tokenData) {
      fetchData();
    }
  }, [DataAuth, tokenData, RefreshData, searchTerm]);

  // Handle edit start
  const handleEditStart = (config: SequenceConfigData) => {
    setEditingId(config.id);
    formik.setValues({
      currentSquenceNumber: config.currentSquenceNumber,
      nextSequenceNumber: config.nextSequenceNumber,
    });
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    formik.resetForm();
  };

  // Handle confirmed update
  const handleConfirmedUpdate = async () => {
    console.log("handleConfirmedUpdate called");
    console.log("pendingUpdate:", pendingUpdate);
    console.log("tokenData:", tokenData);
    
    if (!pendingUpdate || !tokenData) {
      console.log("Missing pendingUpdate or tokenData, returning");
      return;
    }

    try {
      const config = sequenceData.find(c => c.id === pendingUpdate.id);
      if (!config) return;

      const updateData = {
        id: config.id,
        seqCode: config.seqCode,
        seqName: config.seqName,
        sysModCode: config.sysModCode,
        currentSquenceNumber: pendingUpdate.data.currentSquenceNumber,
        nextSequenceNumber: pendingUpdate.data.nextSequenceNumber,
      };

      const result = await UpdateSequenceConfigData(updateData, tokenData);
      
      if (result?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Sequence configuration updated successfully",
          statusToast: "success",
        });
        setEditingId(null);
        setRefreshData(prev => prev + 1); // Trigger refresh
      } else {
        showToast({
          description: result?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    } finally {
      onConfirmClose();
      setPendingUpdate(null);
    }
  };

  // Filter data based on search
  const filteredData = sequenceData.filter(config =>
    config.seqCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.seqName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.sysModCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LayoutAdmin>
      <HeaderContent {...headerProps} />
      
      <Box p={6}>
        <Card shadow="lg" borderRadius={radiusStyle}>
          <CardHeader>
            <Flex align="center">
              <FiSettings size={24} color="blue.500" />
              <Heading size="md" ml={3}>
                Sequence Configuration Management
              </Heading>
              <Spacer />
            </Flex>
            <Text fontSize="sm" color="gray.600" mt={2}>
              Manage sequence configurations for project numbering and other automated sequences
            </Text>
          </CardHeader>
          
          <Divider />
          
          <CardBody>
            {/* Search */}
            <Box mb={6}>
              <FormControl>
                <FormLabel>Search Configurations</FormLabel>
                <Input
                  placeholder="Search by sequence code, name, or module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FormControl>
            </Box>

            {/* Configuration List */}
            {isLoadingProcess ? (
              <LoadingMiniSignature />
            ) : (
              <VStack spacing={0} align="stretch">
                {filteredData.map((config, index) => (
                  <Box key={config.id}>
                    <Box p={4} bg={editingId === config.id ? "blue.50" : "white"}>
                      <Grid templateColumns="1fr auto" gap={4} alignItems="center">
                        <VStack align="start" spacing={3}>
                          {/* Header Info */}
                          <HStack spacing={4}>
                            <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                              {config.seqCode}
                            </Badge>
                            <Badge colorScheme="green" variant="outline" fontSize="sm">
                              {config.sysModCode}
                            </Badge>
                          </HStack>
                          
                          <Text fontWeight="medium" fontSize="lg">
                            {config.seqName}
                          </Text>

                          {/* Sequence Numbers */}
                          {editingId === config.id ? (
                            <Box w="full">
                              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full" maxW="400px">
                                <GridItem>
                                  <FormControl isInvalid={!!(formik.touched.currentSquenceNumber && formik.errors.currentSquenceNumber)}>
                                    <FormLabel fontSize="sm">Current Number</FormLabel>
                                    <NumberInput 
                                      min={0}
                                      value={formik.values.currentSquenceNumber}
                                      onChange={(valueString) => formik.setFieldValue("currentSquenceNumber", parseInt(valueString) || 0)}
                                    >
                                      <NumberInputField />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>
                                    <FormErrorMessage>{formik.errors.currentSquenceNumber}</FormErrorMessage>
                                  </FormControl>
                                </GridItem>
                                
                                <GridItem>
                                  <FormControl isInvalid={!!(formik.touched.nextSequenceNumber && formik.errors.nextSequenceNumber)}>
                                    <FormLabel fontSize="sm">Next Number</FormLabel>
                                    <NumberInput 
                                      min={1}
                                      value={formik.values.nextSequenceNumber}
                                      onChange={(valueString) => formik.setFieldValue("nextSequenceNumber", parseInt(valueString) || 1)}
                                    >
                                      <NumberInputField />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>
                                    <FormErrorMessage>{formik.errors.nextSequenceNumber}</FormErrorMessage>
                                  </FormControl>
                                </GridItem>
                              </Grid>
                              
                              <Box mt={3} p={3} bg="yellow.50" borderRadius="md" maxW="400px">
                                <Text fontSize="xs" color="yellow.800">
                                  <strong>Warning:</strong> Modifying sequence numbers may affect future project numbering.
                                </Text>
                              </Box>
                            </Box>
                          ) : (
                            <HStack spacing={6}>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  CURRENT NUMBER
                                </Text>
                                <Text fontFamily="mono" fontWeight="bold" color="gray.700" fontSize="lg">
                                  {config.currentSquenceNumber.toLocaleString()}
                                </Text>
                              </VStack>
                              
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  NEXT NUMBER
                                </Text>
                                <Text fontFamily="mono" fontWeight="bold" color="blue.600" fontSize="lg">
                                  {config.nextSequenceNumber.toLocaleString()}
                                </Text>
                              </VStack>
                            </HStack>
                          )}
                        </VStack>

                        {/* Actions */}
                        <VStack spacing={2}>
                          {editingId === config.id ? (
                            <>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<FiSave />}
                                onClick={() => {
                                  formik.handleSubmit();
                                }}
                                isDisabled={!formik.isValid}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={<FiX />}
                                onClick={handleEditCancel}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              leftIcon={<FiEdit />}
                              onClick={() => handleEditStart(config)}
                            >
                              Edit
                            </Button>
                          )}
                        </VStack>
                      </Grid>
                    </Box>
                    
                    {/* Divider between items */}
                    {index < filteredData.length - 1 && <Divider />}
                  </Box>
                ))}
                
                {filteredData.length === 0 && !isLoadingProcess && (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No sequence configurations found</Text>
                  </Box>
                )}
              </VStack>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        onConfirm={handleConfirmedUpdate}
        title="Confirm Sequence Update"
        message="Are you sure you want to update this sequence configuration? This may affect future project numbering."
        confirmText="Update Configuration"
        cancelText="Cancel"
      />
    </LayoutAdmin>
  );
}
