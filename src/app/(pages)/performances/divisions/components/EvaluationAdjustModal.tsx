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
  Select,
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
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK, BAISC_POINT_EV_OPT, TIMELESS_POINT_EV_OPT, EXTRA_POINT_EV_OPT, TYPE_REQ, ALLOCATION_SECTION_POINTS } from "@/app/constants/applicationConstants";
import { UserEvaluationReportListResponse, RptUserEvaluationReport } from "@/app/services/useReports";
import useReports from "@/app/services/useReports";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { FiUser, FiEdit3, FiFolder, FiFileText, FiTarget, FiCalendar, FiTrendingUp, FiInfo } from "react-icons/fi";

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

  // Calculation info modal
  const { isOpen: isCalcInfoOpen, onOpen: onCalcInfoOpen, onClose: onCalcInfoClose } = useDisclosure();

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  // Auto-calculation functions
  const calculateTotalPoint = (basic: number, timeless: number, extra: number): number => {
    const basicWeight = ALLOCATION_SECTION_POINTS.find(p => p.FieldName === "evBasicPoint")?.PercentageWeight || 0;
    const timelessWeight = ALLOCATION_SECTION_POINTS.find(p => p.FieldName === "evTimelessPoint")?.PercentageWeight || 0;
    const extraWeight = ALLOCATION_SECTION_POINTS.find(p => p.FieldName === "evExtraPoint")?.PercentageWeight || 0;
    
    return (basic * basicWeight / 100) + (timeless * timelessWeight / 100) + (extra * extraWeight / 100);
  };

  const calculateGrandTotal = (totalPoint: number): number => {
    if (!reportData) {
      return totalPoint;
    }
    
    const reqType = reportData.requirementType || "ANY";
    const projType = reportData.projectType;
    
    // Find exact match first
    let typeConfig = TYPE_REQ.find(t => t.RequirementType === reqType && t.ProjectType === projType);
    
    // Fallback to ANY if no exact match
    if (!typeConfig) {
      typeConfig = TYPE_REQ.find(t => t.RequirementType === "ANY" && t.ProjectType === projType);
    }
    
    const weight = typeConfig?.PercentageWeight || 100;
    return totalPoint * weight / 100;
  };

  // Auto-calculate when base points change
  useEffect(() => {
    const newTotalPoint = calculateTotalPoint(evBasicPoint, evTimelessPoint, evExtraPoint);
    setEvTotalPoint(newTotalPoint);
  }, [evBasicPoint, evTimelessPoint, evExtraPoint]);

  // Auto-calculate grand total when total point changes
  useEffect(() => {
    const newGrandTotal = calculateGrandTotal(evTotalPoint);
    setEvGrandTotal(newGrandTotal);
  }, [evTotalPoint, reportData]);

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
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Type:</Text>
                                <Badge 
                                  colorScheme="blue" 
                                  variant="solid" 
                                  fontSize="xs"
                                  px={3}
                                  py={1}
                                >
                                  {reportData?.projectType || "Loading..."}
                                </Badge>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" minW="80px" color="gray.600">Requirement:</Text>
                                <Badge 
                                  colorScheme="purple" 
                                  variant="solid" 
                                  fontSize="xs"
                                  px={3}
                                  py={1}
                                >
                                  {reportData?.requirementType || "ANY"}
                                </Badge>
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
                          <HStack justify="space-between" align="center">
                            <HStack spacing={3}>
                              <Icon as={FiTarget} color="secondary.500" boxSize={5} />
                              <Heading size="sm">Evaluation Points</Heading>
                            </HStack>
                            <IconButton
                              aria-label="Calculation Information"
                              icon={<FiInfo />}
                              size="sm"
                              variant="ghost"
                              colorScheme="secondary"
                              onClick={onCalcInfoOpen}
                              _hover={{
                                bg: colorMode === "light" ? "secondary.100" : "secondary.800",
                              }}
                            />
                          </HStack>

                          <VStack spacing={4} align="stretch">
                            {/* Basic Point */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Basic Point
                              </FormLabel>
                              <Select
                                value={evBasicPoint.toString()}
                                onChange={(e) => setEvBasicPoint(Number(e.target.value))}
                                size="lg"
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                _focus={{
                                  borderColor: "secondary.500",
                                  boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                }}
                              >
                                {BAISC_POINT_EV_OPT.map((option) => (
                                  <option key={option.label} value={option.label}>
                                    {option.value}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Timeless Point */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Timeless Point
                              </FormLabel>
                              <Select
                                value={evTimelessPoint.toString()}
                                onChange={(e) => setEvTimelessPoint(Number(e.target.value))}
                                size="lg"
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                _focus={{
                                  borderColor: "secondary.500",
                                  boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                }}
                              >
                                {TIMELESS_POINT_EV_OPT.map((option) => (
                                  <option key={option.label} value={option.label}>
                                    {option.value}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Extra Point */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Extra Point
                              </FormLabel>
                              <Select
                                value={evExtraPoint.toString()}
                                onChange={(e) => setEvExtraPoint(Number(e.target.value))}
                                size="lg"
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                _focus={{
                                  borderColor: "secondary.500",
                                  boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                }}
                              >
                                {EXTRA_POINT_EV_OPT.map((option) => (
                                  <option key={option.label} value={option.label}>
                                    {option.value}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            <Divider />

                            {/* Total Point */}
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                                Total Point
                              </FormLabel>
                              <NumberInput
                                value={evTotalPoint.toFixed(2)}
                                isReadOnly
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
                              </NumberInput>
                            </FormControl>

                            {/* Grand Total */}
                            <FormControl>
                              <HStack justify="space-between" align="center">
                                <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={0}>
                                  Grand Total
                                </FormLabel>
                                {reportData && (
                                  <Badge 
                                    colorScheme="orange" 
                                    variant="subtle" 
                                    fontSize="xs"
                                    px={2}
                                  >
                                    {(() => {
                                      const reqType = reportData.requirementType || "ANY";
                                      const projType = reportData.projectType;
                                      let typeConfig = TYPE_REQ.find(t => t.RequirementType === reqType && t.ProjectType === projType);
                                      if (!typeConfig) {
                                        typeConfig = TYPE_REQ.find(t => t.RequirementType === "ANY" && t.ProjectType === projType);
                                      }
                                      const weight = typeConfig?.PercentageWeight || 100;
                                      return `${weight}% multiplier`;
                                    })()}
                                  </Badge>
                                )}
                              </HStack>
                              <NumberInput
                                value={evGrandTotal.toFixed(2)}
                                isReadOnly
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

      {/* Calculation Information Modal */}
      <Modal isOpen={isCalcInfoOpen} onClose={onCalcInfoClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiTarget} color="orange.500" boxSize={5} />
              <Heading size="md">Calculation Method</Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          
          <ModalBody py={6}>
            <VStack align="start" spacing={6}>
              <Box>
                <Text fontWeight="bold" color="orange.600" mb={3} fontSize="lg">Total Point Calculation:</Text>
                <VStack align="start" spacing={2} pl={3}>
                  <Text>• Basic Point: 50% weight</Text>
                  <Text>• Timeless Point: 30% weight</Text>
                  <Text>• Extra Point: 20% weight</Text>
                </VStack>
                <Box mt={3} p={3} bg={colorMode === "light" ? "orange.100" : "orange.800"} rounded="md">
                  <Text fontSize="sm" fontWeight="bold" color="orange.700" mb={2}>Example:</Text>
                  <Text fontSize="sm" color="orange.700">
                    Basic: 100 × 50% = 50.00<br/>
                    Timeless: 150 × 30% = 45.00<br/>
                    Extra: 100 × 20% = 20.00<br/>
                    <strong>Total Point = 115.00</strong>
                  </Text>
                </Box>
              </Box>
              
              <Box>
                <Text fontWeight="bold" color="orange.600" mb={3} fontSize="lg">Grand Total Calculation:</Text>
                <VStack align="start" spacing={2} pl={3}>
                  <Text>• Based on project type multiplier</Text>
                  <Text>• BRD Projects: 100% of Total Point</Text>
                  <Text>• RFC Projects: 75% of Total Point</Text>
                  <Text>• Deployment: 50% of Total Point</Text>
                  <Text>• Support: 25% of Total Point</Text>
                </VStack>
                <Box mt={3} p={3} bg={colorMode === "light" ? "orange.100" : "orange.800"} rounded="md">
                  <Text fontSize="sm" fontWeight="bold" color="orange.700" mb={2}>Examples:</Text>
                  <Text fontSize="sm" color="orange.700">
                    BRD: 115.00 × 100% = <strong>115.00</strong><br/>
                    RFC: 115.00 × 75% = <strong>86.25</strong><br/>
                    Deployment: 115.00 × 50% = <strong>57.50</strong><br/>
                    Support: 115.00 × 25% = <strong>28.75</strong>
                  </Text>
                </Box>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button onClick={onCalcInfoClose} colorScheme="secondary">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EvaluationAdjustModal;
