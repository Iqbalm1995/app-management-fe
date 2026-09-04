"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Box,
  Icon,
  useColorMode,
  Badge,
  Flex,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiDollarSign,
  FiCheck,
  FiCalendar,
  FiHash,
  FiBriefcase,
  FiUser,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
} from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useVendor, {
  VendorContractResponse,
  ContractPaymentInsertPayload,
  ContractPaymentWorkProgramPayload,
} from "@/app/services/useVendor";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import { formatIDR } from "@/app/components/CardContract";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";
import ModalProjectSelector from "../../register/components/ModalProjectSelector";
import { useDisclosure } from "@chakra-ui/react";
import { IoReceiptOutline } from "react-icons/io5";

interface GeneratePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: VendorContractResponse;
  tokenData: string;
  onSuccess: () => void;
}

export default function GeneratePaymentModal({
  isOpen,
  onClose,
  contract,
  tokenData,
  onSuccess,
}: GeneratePaymentModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { InsertPayment, isLoading } = useVendor();
  const { List: ListProjects, GetDetailById: GetProjectDetail } = useProjects();
  const projectSelectorModal = useDisclosure();

  // Project state
  const [selectedProjectId, setSelectedProjectId] = useState<string>(contract.projectId || "");
  const [selectedProject, setSelectedProject] = useState<ProjectDataResponse | null>(null);

  // Payment Header Fields
  const [paymentNo, setPaymentNo] = useState<string>("");
  const [paymentMemoNo, setPaymentMemoNo] = useState<string>("");
  const [workValue, setWorkValue] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>("DRAFT");
  const [paymentStatusDate, setPaymentStatusDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // RBB Work Programs snapshot
  const [workPrograms, setWorkPrograms] = useState<ContractPaymentWorkProgramPayload[]>([]);
  const [, setIsLoadingRbb] = useState<boolean>(false);

  // Confirmation Alert Dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const cancelRef = useRef<any>(null);

  // Load project linked to the contract
  const fetchProjectData = useCallback(async () => {
    if (!tokenData) return;
    const projId = contract.projectId;
    if (projId) {
      const res = await GetProjectDetail(projId, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setSelectedProjectId(res.data.id);
        setSelectedProject(res.data);
        return;
      }
    }

    // Fallback: search PROCUREMENT projects
    const res = await ListProjects(
      {
        search: "",
        page: 0,
        limit: 10,
        filterWhere: [{ field: "projectType", operator: "=", value: "PROCUREMENT" }],
        fieldOrder: ["CreatedAt"],
        orderDir: "desc",
      },
      tokenData
    );
    if (res?.statusCode === RES_CODE_OK && res.data && res.data.length > 0) {
      const proj = res.data[0];
      setSelectedProjectId(proj.id);
      setSelectedProject(proj);
    }
  }, [tokenData, contract?.projectId]);

  // Initialize fields on open
  useEffect(() => {
    if (isOpen) {
      const year = new Date().getFullYear();
      const randomCode = Math.floor(Math.random() * 9000) + 1000;
      const generatedMemo = `MEMO/BJB/VEN/${year}/${randomCode}`;
      const generatedPayNo = `PAY/BJB/${year}/${randomCode}`;

      setPaymentMemoNo(generatedMemo);
      setPaymentNo(generatedPayNo);
      setWorkValue(contract.workValue || 0);
      setPaymentStatusDate(new Date().toISOString().split("T")[0]);
      setPaymentStatus("DRAFT");
      setIsConfirmOpen(false);
      setSelectedProjectId(contract.projectId || "");

      fetchProjectData();
    }
  }, [isOpen, contract?.id, contract?.projectId]);

  // Load project RBB work programs when project is identified
  const loadProjectRbb = useCallback(async () => {
    if (!selectedProjectId || !tokenData) return;
    setIsLoadingRbb(true);
    try {
      const res = await GetProjectDetail(selectedProjectId, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setSelectedProject(res.data);
        if (res.data.workPrograms && res.data.workPrograms.length > 0) {
          const mapped: ContractPaymentWorkProgramPayload[] = res.data.workPrograms.map((wp) => ({
            reqWorkProgramId: wp.id,
            reqId: wp.reqId || wp.projectId || selectedProjectId,
            workProgramSource: wp.workProgramSource || "RBB",
            workProgramCode: wp.workProgramCode || "",
            workProgramName: wp.workProgramName || "",
            workProgramAccName: wp.workProgramAccName || "",
            workProgramAccNumber: wp.workProgramAccNumber || "",
            workProgramAccCc: wp.workProgramAccCc || "",
            workProgramBudget: wp.workProgramBudget || 0,
            workProgramReal: contract.workValue || 0,
            workProgramLeftovers: Math.max(0, (wp.workProgramBudget || 0) - (contract.workValue || 0)),
            divisionId: wp.divisionId || res.data?.proOwnerDivisionId || "0",
            divisionCode: wp.divisionCode || res.data?.proOwnerDivisionCode || "",
            divisionName: wp.divisionName || res.data?.proOwnerDivisionName || "",
            directorateId: wp.directorateId || res.data?.proOwnerDirectorateId || null,
            directorateCode: wp.directorateCode || res.data?.proOwnerDirectorateCode || null,
            directorateName: wp.directorateName || res.data?.proOwnerDirectorateName || null,
            groupId: wp.groupId || res.data?.proOwnerGroupId || null,
            groupCode: wp.groupCode || res.data?.proOwnerGroupCode || null,
            groupName: wp.groupName || res.data?.proOwnerGroupName || null,
          }));
          setWorkPrograms(mapped);
          setIsLoadingRbb(false);
          return;
        }
      }

      // Fallback row if no work program lines found
      setWorkPrograms([
        {
          workProgramSource: "RBB",
          workProgramCode: "RBB-DEFAULT",
          workProgramName: contract.corpName || "Contract Budget Line",
          workProgramAccName: "Vendor Disbursement",
          workProgramAccNumber: "401.01.001",
          workProgramAccCc: "CC-IT-PROCUREMENT",
          workProgramBudget: contract.workValue || 0,
          workProgramReal: contract.workValue || 0,
          workProgramLeftovers: 0,
          divisionId: "0",
          divisionCode: "DIV-IT",
          divisionName: "Information Technology Division",
        },
      ]);
    } catch {
      setWorkPrograms([
        {
          workProgramSource: "RBB",
          workProgramCode: "RBB-DEFAULT",
          workProgramName: contract.corpName || "Contract Budget Line",
          workProgramAccName: "Vendor Disbursement",
          workProgramAccNumber: "401.01.001",
          workProgramAccCc: "CC-IT-PROCUREMENT",
          workProgramBudget: contract.workValue || 0,
          workProgramReal: contract.workValue || 0,
          workProgramLeftovers: 0,
          divisionId: "0",
          divisionCode: "DIV-IT",
          divisionName: "Information Technology Division",
        },
      ]);
    }
    setIsLoadingRbb(false);
  }, [selectedProjectId, tokenData, contract?.workValue, contract?.corpName]);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectRbb();
    }
  }, [selectedProjectId]);

  // Validation before triggering confirmation
  const handleOpenConfirm = () => {
    if (!selectedProjectId) {
      showToast({ description: "Target project information is not available", statusToast: "warning" });
      return;
    }
    if (!paymentNo.trim()) {
      showToast({ description: "Payment Number is required", statusToast: "warning" });
      return;
    }
    if (!paymentMemoNo.trim()) {
      showToast({ description: "Payment Memo Number is required", statusToast: "warning" });
      return;
    }
    if (workValue <= 0) {
      showToast({ description: "Payment work value must be greater than 0", statusToast: "warning" });
      return;
    }

    setIsConfirmOpen(true);
  };

  // Execution after confirmation
  const handleConfirmSubmit = async () => {
    const payload: ContractPaymentInsertPayload = {
      projectId: selectedProjectId,
      venContractId: contract.id,
      vendorId: contract.vendorId,
      paymentNo: paymentNo || undefined,
      paymentMemoNo: paymentMemoNo || undefined,
      paymentContractWorkValue: workValue,
      paymentContractChangeValue: 0,
      paymentContractStepChangeNumber: 1,
      paymentStatus: paymentStatus,
      paymentStatusDate: new Date(paymentStatusDate).toISOString(),
      workPrograms: workPrograms,
    };

    const res = await InsertPayment(payload, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Vendor contract payment record generated successfully",
        statusToast: "success",
      });
      setIsConfirmOpen(false);
      onSuccess();
      onClose();
    } else {
      showToast({
        description: res?.message || "Failed to generate payment record",
        statusToast: "error",
      });
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          rounded={radiusStyle}
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          {/* Header */}
          <ModalHeader
            borderBottom="1px"
            borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
            py={4}
          >
            <Flex justify="space-between" align="center" pr={6}>
              <HStack spacing={3}>
                <Flex
                  p={2}
                  rounded="lg"
                  bg={colorMode === "light" ? "blue.50" : "blue.900"}
                  color="blue.500"
                >
                  <Icon as={IoReceiptOutline} boxSize={5} />
                </Flex>
                <VStack align="start" spacing={0}>
                  <Text fontSize="md" fontWeight="bold">
                    Generate Vendor Contract Payment
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {contract.corpName} • SPK: {contract.corpNumber}
                  </Text>
                </VStack>
              </HStack>

              <Badge
                colorScheme="blue"
                variant="subtle"
                px={2.5}
                py={0.5}
                rounded="md"
                fontSize="2xs"
              >
                1:1 Contract Payment Master
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton mt={2} />

          <ModalBody py={5}>
            <VStack spacing={5} align="stretch">
              {/* 1. Tripartite Snapshot Cards (All Read-only) */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {/* Card 1: Project Information */}
                <Box
                  p={4}
                  rounded="xl"
                  bg={colorMode === "light" ? "blue.50/50" : "gray.800"}
                  border="1px"
                  borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
                >
                  <VStack align="start" spacing={2}>
                    <Flex justify="space-between" align="center" w="full">
                      <HStack spacing={1.5} color="blue.600">
                        <Icon as={FiBriefcase} />
                        <Text
                          fontSize="2xs"
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          1. Project Information
                        </Text>
                      </HStack>
                      <Button
                        size="2xs"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={projectSelectorModal.onOpen}
                      >
                        Change
                      </Button>
                    </Flex>

                    <VStack align="start" spacing={1} fontSize="xs">
                      <Text fontWeight="bold">
                        {selectedProject?.projectName || "Parent Project"}
                      </Text>
                      <Text color="gray.500">
                        Code:{" "}
                        {selectedProject?.projectCode ||
                          selectedProject?.projectNo ||
                          "-"}
                      </Text>
                      <Text color="gray.500">
                        Owner:{" "}
                        <strong>
                          {selectedProject?.proOwnerDivisionName || "Divisi IT"}
                        </strong>
                      </Text>
                      <Text color="gray.500">
                        Directorate:{" "}
                        {selectedProject?.proOwnerDirectorateName ||
                          "Direktorat IT"}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                {/* Card 2: Vendor Partner (Read-only) */}
                <Box
                  p={4}
                  rounded="xl"
                  bg={colorMode === "light" ? "purple.50/50" : "gray.800"}
                  border="1px"
                  borderColor={
                    colorMode === "light" ? "purple.200" : "purple.800"
                  }
                >
                  <VStack align="start" spacing={2}>
                    <HStack spacing={1.5} color="purple.600">
                      <Icon as={FiUser} />
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        2. Vendor Partner (Read-only)
                      </Text>
                    </HStack>

                    <VStack align="start" spacing={1} fontSize="xs">
                      <Text fontWeight="bold">
                        {contract.vendorName || "Vendor Partner"}
                      </Text>
                      <Text color="gray.500">
                        Code: {contract.vendorCode || "-"}
                      </Text>
                      <Text color="gray.500">
                        Type:{" "}
                        {contract.vendor?.vendorType || "Corporate Vendor"}
                      </Text>
                      <Text color="gray.500">
                        PIC: {contract.vendor?.picBusinessName || "-"} (
                        {contract.vendor?.picBusinessEmail || "-"})
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                {/* Card 3: Contract Summary (Read-only) */}
                <Box
                  p={4}
                  rounded="xl"
                  bg={colorMode === "light" ? "teal.50/50" : "gray.800"}
                  border="1px"
                  borderColor={colorMode === "light" ? "teal.200" : "teal.800"}
                >
                  <VStack align="start" spacing={2}>
                    <HStack spacing={1.5} color="teal.600">
                      <Icon as={FiShield} />
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        3. Contract Summary (Read-only)
                      </Text>
                    </HStack>

                    <VStack align="start" spacing={1} fontSize="xs">
                      <Text fontWeight="bold">SPK: {contract.corpNumber}</Text>
                      <Text fontWeight="bold" color="teal.600">
                        Value: {formatIDR(contract.workValue)}
                      </Text>
                      <Text color="gray.500">
                        Period:{" "}
                        {new Date(
                          contract.contractStartDate,
                        ).toLocaleDateString("en-US")}{" "}
                        –{" "}
                        {new Date(contract.contractEndDate).toLocaleDateString(
                          "en-US",
                        )}
                      </Text>
                      <Text color="gray.500">
                        Status: {contract.status || "ACTIVE"}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              </SimpleGrid>

              {/* 2. Payment Header Parameters (Clean, Tidy, Aligned 2-Column Grid) */}
              <Box
                p={5}
                rounded="xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <HStack spacing={2} mb={4} color="blue.500">
                  <Icon as={IoReceiptOutline} />
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    Payment Parameters
                  </Text>
                </HStack>

                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacingX={6}
                  spacingY={4}
                >
                  {/* Payment Number */}
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="xs"
                      fontWeight="semibold"
                      mb={1.5}
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                    >
                      <HStack spacing={1.5}>
                        <Icon as={FiHash} boxSize={3.5} color="gray.500" />
                        <Text>Payment Reference No</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      size="sm"
                      rounded="lg"
                      value={paymentNo}
                      onChange={(e) => setPaymentNo(e.target.value)}
                      placeholder="e.g. PAY/2026/08/001"
                    />
                  </FormControl>

                  {/* Payment Memo Number */}
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="xs"
                      fontWeight="semibold"
                      mb={1.5}
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                    >
                      <HStack spacing={1.5}>
                        <Icon as={FiFileText} boxSize={3.5} color="gray.500" />
                        <Text>Payment Memo No</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      size="sm"
                      rounded="lg"
                      value={paymentMemoNo}
                      onChange={(e) => setPaymentMemoNo(e.target.value)}
                      placeholder="e.g. MEMO/BJB/VEN/2026/001"
                    />
                  </FormControl>

                  {/* Initial Payment Status */}
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="xs"
                      fontWeight="semibold"
                      mb={1.5}
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                    >
                      <HStack spacing={1.5}>
                        <Icon
                          as={FiCheckCircle}
                          boxSize={3.5}
                          color="gray.500"
                        />
                        <Text>Initial Status</Text>
                      </HStack>
                    </FormLabel>
                    <Select
                      size="sm"
                      rounded="lg"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PAID">Paid / Disbursed</option>
                    </Select>
                  </FormControl>

                  {/* Status Date */}
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="xs"
                      fontWeight="semibold"
                      mb={1.5}
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                    >
                      <HStack spacing={1.5}>
                        <Icon as={FiCalendar} boxSize={3.5} color="gray.500" />
                        <Text>Status Date</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="date"
                      size="sm"
                      rounded="lg"
                      value={paymentStatusDate}
                      onChange={(e) => setPaymentStatusDate(e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>

                <Divider
                  my={4}
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                />

                {/* Contract Work Value (Read-only Summary) */}
                <Flex
                  justify="space-between"
                  align="center"
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  p={3}
                  rounded="lg"
                >
                  <VStack align="start" spacing={0}>
                    <Text
                      fontSize="2xs"
                      color="gray.500"
                      fontWeight="bold"
                      textTransform="uppercase"
                    >
                      Contract Work Value (IDR)
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Total contract amount frozen into this payment record
                    </Text>
                  </VStack>
                  <Text fontSize="md" fontWeight="bold" color="blue.500">
                    {formatIDR(workValue)}
                  </Text>
                </Flex>
              </Box>

              {/* 3. RBB Work Program Snapshot Preview */}
              <Box
                p={4}
                rounded="xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FiLayers} color="blue.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="bold">
                        RBB Work Program Snapshot ({workPrograms.length} Line)
                      </Text>
                      <Text fontSize="2xs" color="gray.500">
                        Budget lines linked from parent project
                      </Text>
                    </VStack>
                  </HStack>

                  <Badge
                    colorScheme="blue"
                    fontSize="2xs"
                    px={2}
                    py={0.5}
                    rounded="md"
                  >
                    Allocated: {formatIDR(workValue)}
                  </Badge>
                </Flex>

                <Box
                  rounded="lg"
                  overflow="hidden"
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                >
                  <Table size="sm" variant="simple">
                    <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                      <Tr>
                        <Th fontSize="2xs">RBB Source / Code</Th>
                        <Th fontSize="2xs">Account Name & Cost Center</Th>
                        <Th fontSize="2xs" isNumeric>
                          Budget
                        </Th>
                        <Th fontSize="2xs" isNumeric>
                          Realization
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {workPrograms.map((wp, idx) => (
                        <Tr key={idx}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Badge colorScheme="blue" fontSize="2xs">
                                {wp.workProgramSource}
                              </Badge>
                              <Text fontSize="xs" fontWeight="bold">
                                {wp.workProgramCode || "N/A"}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="xs" fontWeight="semibold">
                                {wp.workProgramAccName || wp.workProgramName}
                              </Text>
                              <Text fontSize="2xs" color="gray.500">
                                Acc: {wp.workProgramAccNumber || "-"} • CC:{" "}
                                {wp.workProgramAccCc || "-"}
                              </Text>
                            </VStack>
                          </Td>
                          <Td isNumeric fontSize="xs" fontWeight="bold">
                            {formatIDR(wp.workProgramBudget || 0)}
                          </Td>
                          <Td
                            isNumeric
                            fontSize="xs"
                            fontWeight="bold"
                            color="teal.500"
                          >
                            {formatIDR(wp.workProgramReal || 0)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </VStack>
          </ModalBody>

          {/* Footer */}
          <ModalFooter
            borderTop="1px"
            borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
            py={3}
          >
            <Flex justify="space-between" w="full">
              <Button
                size="sm"
                variant="ghost"
                rounded="lg"
                onClick={onClose}
                isDisabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                colorScheme="blue"
                rounded="lg"
                leftIcon={<FiCheck />}
                onClick={handleOpenConfirm}
                isLoading={isLoading}
              >
                Confirm & Generate Payment Record
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmOpen(false)}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
          <AlertDialogContent
            rounded={radiusStyle}
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <AlertDialogHeader fontSize="md" fontWeight="bold" pb={2}>
              <HStack spacing={2} color="blue.500">
                <Icon as={FiAlertCircle} boxSize={5} />
                <Text>Confirm Payment Record Generation</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody py={3}>
              <VStack align="start" spacing={3} fontSize="xs">
                <Text>
                  Are you sure you want to generate the master payment record
                  for this vendor contract?
                </Text>

                <Box
                  w="full"
                  p={3}
                  rounded="lg"
                  bg={colorMode === "light" ? "gray.50" : "gray.800"}
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                >
                  <VStack align="start" spacing={1}>
                    <Text>
                      <strong>SPK Number:</strong> {contract.corpNumber}
                    </Text>
                    <Text>
                      <strong>Payment Ref No:</strong> {paymentNo}
                    </Text>
                    <Text>
                      <strong>Payment Memo No:</strong> {paymentMemoNo}
                    </Text>
                    <Text color="blue.500">
                      <strong>Total Work Value:</strong> {formatIDR(workValue)}
                    </Text>
                  </VStack>
                </Box>

                <Text color="gray.500">
                  This action will freeze the tripartite snapshot (Project,
                  Vendor, Contract) and register the RBB work program budget
                  allocations.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter py={3}>
              <HStack spacing={3}>
                <Button
                  ref={cancelRef}
                  size="sm"
                  variant="ghost"
                  rounded="lg"
                  onClick={() => setIsConfirmOpen(false)}
                  isDisabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  rounded="lg"
                  leftIcon={<FiCheckCircle />}
                  onClick={handleConfirmSubmit}
                  isLoading={isLoading}
                  loadingText="Generating..."
                >
                  Yes, Generate Payment
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal Project Selector */}
      <ModalProjectSelector
        isOpen={projectSelectorModal.isOpen}
        onClose={projectSelectorModal.onClose}
        onSelectProject={(proj) => {
          setSelectedProjectId(proj.id);
          setSelectedProject(proj);
        }}
        tokenData={tokenData}
        selectedProjectId={selectedProjectId}
      />
    </>
  );
}
