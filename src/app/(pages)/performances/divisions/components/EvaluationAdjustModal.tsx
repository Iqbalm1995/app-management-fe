"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Text,
  useColorMode,
  Divider,
  Box,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Badge,
  Icon,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Heading,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { UserEvaluationReportListResponse, RptUserEvaluationReport } from "@/app/services/useReports";
import useReports from "@/app/services/useReports";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { FiUser, FiEdit3, FiFolder, FiFileText, FiTarget, FiCalendar, FiTrendingUp } from "react-icons/fi";

interface EvaluationAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserEvaluationReportListResponse | null;
  onSuccess: () => void;
}

const EvaluationAdjustModal = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EvaluationAdjustModalProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { UpdateUserEvaluationReport, GetUserEvaluationReportById } = useReports();

  const [tokenData, setTokenData] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openConfirmUpdate, setOpenConfirmUpdate] = useState(false);
  const [reportData, setReportData] = useState<RptUserEvaluationReport | null>(null);

  // Form state
  const [evBasicPoint, setEvBasicPoint] = useState<number>(0);
  const [evTimelessPoint, setEvTimelessPoint] = useState<number>(0);
  const [evExtraPoint, setEvExtraPoint] = useState<number>(0);
  const [evTotalPoint, setEvTotalPoint] = useState<number>(0);
  const [evGrandTotal, setEvGrandTotal] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  useEffect(() => {
    if (isOpen && user && tokenData) {
      loadReportData();
    }
  }, [isOpen, user, tokenData]);

  const loadReportData = async () => {
    if (!user?.id || !tokenData) return;
    
    setIsLoading(true);
    try {
      const response = await GetUserEvaluationReportById(user.id, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setReportData(response.data);
        setEvBasicPoint(response.data.evBasicPoint || 0);
        setEvTimelessPoint(response.data.evTimelessPoint || 0);
        setEvExtraPoint(response.data.evExtraPoint || 0);
        setEvTotalPoint(response.data.evTotalPoint || 0);
        setEvGrandTotal(response.data.evGrandTotal || 0);
      } else {
        showToast({
          description: "Failed to load report data",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      showToast({
        description: "Error loading report data",
        statusToast: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirmation = () => {
    setOpenConfirmUpdate(true);
  };

  const handleConfirmTrigger = (value: boolean) => {
    setOpenConfirmUpdate(value);
  };

  const handleConfirmUpdate = async () => {
    if (!reportData || !tokenData) return;

    setIsSubmitting(true);
    try {
      const response = await UpdateUserEvaluationReport({
        Id: reportData.id,
        EvBasicPoint: Number(evBasicPoint),
        EvTimelessPoint: Number(evTimelessPoint),
        EvExtraPoint: Number(evExtraPoint),
        EvTotalPoint: Number(evTotalPoint),
        EvGrandTotal: Number(evGrandTotal),
      }, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Evaluation points updated successfully",
          statusToast: "success",
        });
        onSuccess();
        onClose();
      } else {
        showToast({
          description: response?.message || "Failed to update evaluation points",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while updating evaluation points",
        statusToast: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiTrendingUp} color="secondary.500" boxSize={5} />
              <Heading size="md">Adjust Evaluation Points</Heading>
              {user && (
                <Badge colorScheme="secondary" variant="subtle" fontSize="sm">
                  {user.nama}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          
          <ModalBody py={6}>
            {isLoading ? (
              <VStack justify="center" align="center" py={20} spacing={4}>
                <Spinner size="lg" color="secondary.500" />
                <Text fontSize="sm" color="gray.500">Loading evaluation data...</Text>
              </VStack>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Alert Information */}
                <Alert status="info" rounded={radiusStyle}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    Adjust evaluation points for this user's performance report. Changes will be saved immediately.
                  </Text>
                </Alert>

                <Grid templateColumns="1fr 1fr" gap={6}>
                  {/* Left Column - Context Information */}
                  <GridItem>
                    <VStack spacing={4} align="stretch">
                      {/* User Information Card */}
                      <Card
                        shadow="sm"
                        rounded={radiusStyle}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack spacing={3}>
                              <Icon as={FiUser} color="secondary.500" boxSize={5} />
                              <Heading size="sm">User Information</Heading>
                            </HStack>
                            <VStack align="start" spacing={2} fontSize="sm">
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Name:</Text>
                                <Text fontWeight="bold">{user?.nama}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">NIP:</Text>
                                <Text>{user?.nip}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Position:</Text>
                                <Text>{user?.jabatan || "-"}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Division:</Text>
                                <Text>{user?.namaUnitKerja || "-"}</Text>
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Project Information Card */}
                      <Card
                        shadow="sm"
                        rounded={radiusStyle}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack spacing={3}>
                              <Icon as={FiFolder} color="blue.500" boxSize={5} />
                              <Heading size="sm">Project Information</Heading>
                            </HStack>
                            <VStack align="start" spacing={2} fontSize="sm">
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Project:</Text>
                                <Text fontWeight="bold">{user?.projectName || "-"}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Number:</Text>
                                <Text>{user?.projectNo || "-"}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Requirement:</Text>
                                <Text>{user?.reqNumber || "-"}</Text>
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Period Information Card */}
                      <Card
                        shadow="sm"
                        rounded={radiusStyle}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack spacing={3}>
                              <Icon as={FiCalendar} color="green.500" boxSize={5} />
                              <Heading size="sm">Evaluation Period</Heading>
                            </HStack>
                            <VStack align="start" spacing={2} fontSize="sm">
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Year:</Text>
                                <Badge colorScheme="green">{user?.yearPeriod}</Badge>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Quarter:</Text>
                                <Badge colorScheme="blue">{user?.quartalPeriod}</Badge>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Month:</Text>
                                <Badge colorScheme="purple">{user?.monthPeriod}</Badge>
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </GridItem>

                  {/* Right Column - Evaluation Form */}
                  <GridItem>
                    <Card
                      shadow="md"
                      rounded={radiusStyle}
                      border="1px"
                      borderColor={colorMode === "light" ? "secondary.200" : "secondary.700"}
                      bg={colorMode === "light" ? "secondary.50" : "gray.700"}
                    >
                      <CardBody>
                        <VStack align="stretch" spacing={6}>
                          <HStack spacing={3}>
                            <Icon as={FiTarget} color="secondary.500" boxSize={5} />
                            <Heading size="sm">Evaluation Points</Heading>
                          </HStack>

                          <VStack spacing={4} align="stretch">
                            {/* Basic Point */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Basic Point
                              </FormLabel>
                              <NumberInput
                                value={evBasicPoint}
                                onChange={(_, value) => setEvBasicPoint(value || 0)}
                                min={0}
                                max={100}
                                precision={2}
                                size="lg"
                              >
                                <NumberInputField
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            </FormControl>

                            {/* Timeless Point */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Timeless Point
                              </FormLabel>
                              <NumberInput
                                value={evTimelessPoint}
                                onChange={(_, value) => setEvTimelessPoint(value || 0)}
                                min={0}
                                max={100}
                                precision={2}
                                size="lg"
                              >
                                <NumberInputField
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            </FormControl>

                            {/* Extra Point */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Extra Point
                              </FormLabel>
                              <NumberInput
                                value={evExtraPoint}
                                onChange={(_, value) => setEvExtraPoint(value || 0)}
                                min={0}
                                max={100}
                                precision={2}
                                size="lg"
                              >
                                <NumberInputField
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            </FormControl>

                            <Divider />

                            {/* Total Point */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Total Point
                              </FormLabel>
                              <NumberInput
                                value={evTotalPoint}
                                onChange={(_, value) => setEvTotalPoint(value || 0)}
                                min={0}
                                precision={2}
                                size="lg"
                              >
                                <NumberInputField
                                  bg={colorMode === "light" ? "gray.100" : "gray.700"}
                                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            </FormControl>

                            {/* Grand Total */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Grand Total
                              </FormLabel>
                              <NumberInput
                                value={evGrandTotal}
                                onChange={(_, value) => setEvGrandTotal(value || 0)}
                                min={0}
                                precision={2}
                                size="lg"
                              >
                                <NumberInputField
                                  bg={colorMode === "light" ? "gray.100" : "gray.700"}
                                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                  fontWeight="bold"
                                  fontSize="lg"
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            </FormControl>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </VStack>
            )}
          </ModalBody>

          <Divider />
          <ModalFooter>
            <HStack spacing={3}>
              <Button 
                variant="outline" 
                onClick={onClose} 
                isDisabled={isSubmitting}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                colorScheme="secondary"
                onClick={handleOpenConfirmation}
                isDisabled={isSubmitting}
                leftIcon={<FiEdit3 />}
                size="lg"
              >
                Update Points
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        isOpenTrigger={openConfirmUpdate}
        action={handleConfirmUpdate}
        trigger={handleConfirmTrigger}
        questionMsg={`Are you sure you want to update evaluation points for ${user?.nama}?\n\nProject: ${user?.projectNo} - ${user?.projectName}\n\nNew Points:\n• Basic Point: ${evBasicPoint}\n• Timeless Point: ${evTimelessPoint}\n• Extra Point: ${evExtraPoint}\n• Total Point: ${evTotalPoint}\n• Grand Total: ${evGrandTotal}\n\nThis action cannot be undone.`}
        captionMsg="Update Points"
      />
    </>
  );
};

export default EvaluationAdjustModal;
