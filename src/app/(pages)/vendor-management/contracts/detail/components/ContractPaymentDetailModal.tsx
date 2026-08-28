"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Icon,
  useColorMode,
  Badge,
  Flex,
  SimpleGrid,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
} from "@chakra-ui/react";
import {
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiDownload,
  FiTrash2,
  FiUploadCloud,
  FiCalendar,
  FiBriefcase,
  FiHash,
  FiUser,
  FiMapPin,
  FiCheckCircle,
} from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useVendor, {
  ContractPaymentResponse,
  ContractPaymentAttachmentResponse,
} from "@/app/services/useVendor";
import { formatIDR } from "@/app/components/CardContract";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";
import PaymentAttachmentUploadModal from "./PaymentAttachmentUploadModal";

interface ContractPaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: ContractPaymentResponse | null;
  tokenData: string;
  onRefreshData: () => void;
}

export default function ContractPaymentDetailModal({
  isOpen,
  onClose,
  payment,
  tokenData,
  onRefreshData,
}: ContractPaymentDetailModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { DeletePaymentAttachment } = useVendor();

  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  if (!payment) return null;

  const getStatusColorScheme = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "green";
      case "APPROVED":
        return "blue";
      case "SUBMITTED":
        return "purple";
      case "DRAFT":
      default:
        return "gray";
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (confirm("Are you sure you want to delete this payment attachment?")) {
      const res = await DeletePaymentAttachment(attachmentId, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Payment attachment removed successfully",
          statusToast: "success",
        });
        onRefreshData();
      } else {
        showToast({
          description: res?.message || "Failed to remove attachment",
          statusToast: "error",
        });
      }
    }
  };

  const totalWpReal = (payment.workPrograms || []).reduce(
    (acc, curr) => acc + (curr.workProgramReal || 0),
    0
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          rounded={radiusStyle}
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
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
                  <Icon as={FiDollarSign} boxSize={5} />
                </Flex>
                <VStack align="start" spacing={0}>
                  <HStack spacing={2}>
                    <Text fontSize="md" fontWeight="bold">
                      Payment Record: {payment.paymentNo || "N/A"}
                    </Text>
                    <Badge colorScheme={getStatusColorScheme(payment.paymentStatus)} fontSize="xs">
                      {payment.paymentStatus}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Memo: {payment.paymentMemoNo || "-"} • Step #{payment.paymentContractStepChangeNumber}
                  </Text>
                </VStack>
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton mt={2} />

          <ModalBody py={5}>
            <VStack spacing={5} align="stretch">
              {/* Financial & Metadata Header Card */}
              <Box
                p={4}
                rounded="xl"
                bg={colorMode === "light" ? "blue.50" : "blue.950"}
                border="1px"
                borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
              >
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                  <Box>
                    <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                      Disbursement Work Value
                    </Text>
                    <Text fontSize="md" fontWeight="900" color="blue.500">
                      {formatIDR(payment.paymentContractWorkValue)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                      RBB Allocated Realization
                    </Text>
                    <Text fontSize="md" fontWeight="900" color="teal.500">
                      {formatIDR(totalWpReal)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                      Disbursement Status Date
                    </Text>
                    <Text fontSize="xs" fontWeight="bold">
                      {payment.paymentStatusDate
                        ? new Date(payment.paymentStatusDate).toLocaleDateString("id-ID")
                        : "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                      Created By / Date
                    </Text>
                    <Text fontSize="xs" fontWeight="semibold">
                      {payment.createdBy || "SYSTEM"} (
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString("id-ID")
                        : "-"}
                      )
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Tabs for Details */}
              <Tabs variant="soft-rounded" colorScheme="blue">
                <TabList mb={4}>
                  <Tab rounded="lg" fontSize="xs" fontWeight="bold">
                    <HStack spacing={1.5}>
                      <Icon as={FiLayers} />
                      <Text>RBB Work Programs ({payment.workPrograms?.length || 0})</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="lg" fontSize="xs" fontWeight="bold">
                    <HStack spacing={1.5}>
                      <Icon as={FiFileText} />
                      <Text>Attached Documents ({payment.attachments?.length || 0})</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="lg" fontSize="xs" fontWeight="bold">
                    <HStack spacing={1.5}>
                      <Icon as={FiBriefcase} />
                      <Text>Project & Vendor Snapshot</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* TAB 1: RBB Work Program Allocation */}
                  <TabPanel p={0}>
                    <VStack spacing={3} align="stretch">
                      <Box
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                        rounded="xl"
                        overflow="hidden"
                      >
                        <Table size="sm" variant="simple">
                          <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                            <Tr>
                              <Th fontSize="2xs">RBB Account / Code</Th>
                              <Th fontSize="2xs">Account Name / Cost Center</Th>
                              <Th fontSize="2xs" isNumeric>
                                Budget
                              </Th>
                              <Th fontSize="2xs" isNumeric>
                                Realization
                              </Th>
                              <Th fontSize="2xs" isNumeric>
                                Leftovers
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {(payment.workPrograms || []).map((wp, idx) => (
                              <Tr key={wp.id || idx}>
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
                                      Acc: {wp.workProgramAccNumber || "-"} • CC: {wp.workProgramAccCc || "-"}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td isNumeric fontSize="xs" fontWeight="bold">
                                  {formatIDR(wp.workProgramBudget)}
                                </Td>
                                <Td isNumeric fontSize="xs" fontWeight="bold" color="teal.500">
                                  {formatIDR(wp.workProgramReal)}
                                </Td>
                                <Td isNumeric fontSize="xs" fontWeight="bold" color="gray.600">
                                  {formatIDR(wp.workProgramLeftovers)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* TAB 2: Attached Documents */}
                  <TabPanel p={0}>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="xs" fontWeight="bold">
                          Verification Documents & Work Evidence
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          rounded="lg"
                          leftIcon={<FiUploadCloud />}
                          onClick={() => setIsUploadOpen(true)}
                        >
                          Upload New Document
                        </Button>
                      </Flex>

                      {(payment.attachments || []).length === 0 ? (
                        <Flex
                          justify="center"
                          align="center"
                          py={8}
                          direction="column"
                          gap={2}
                          border="1px dashed"
                          borderColor={colorMode === "light" ? "gray.300" : "gray.700"}
                          rounded="xl"
                        >
                          <Icon as={FiFileText} boxSize={6} color="gray.400" />
                          <Text fontSize="xs" color="gray.500">
                            No documents attached to this payment record yet.
                          </Text>
                        </Flex>
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          {(payment.attachments || []).map((att) => (
                            <Box
                              key={att.id}
                              p={4}
                              rounded="xl"
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                              bg={colorMode === "light" ? "white" : "gray.800"}
                            >
                              <Flex justify="space-between" align="start">
                                <VStack align="start" spacing={1} flex={1} mr={2}>
                                  <HStack spacing={2} wrap="wrap">
                                    <Badge colorScheme="purple" fontSize="2xs">
                                      {att.documentType}
                                    </Badge>
                                    <Badge colorScheme="gray" fontSize="2xs">
                                      {att.documentVersion}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                                    {att.documentName}
                                  </Text>
                                  <Text fontSize="2xs" color="gray.500">
                                    Ref: {att.documentNumber} • Date:{" "}
                                    {new Date(att.documentDate).toLocaleDateString("id-ID")}
                                  </Text>
                                </VStack>

                                <HStack spacing={1}>
                                  {att.mediaObject?.objectData || att.linkAttachment ? (
                                    <a
                                      href={att.linkAttachment || att.mediaObject?.objectData}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        colorScheme="blue"
                                        leftIcon={<FiDownload />}
                                      >
                                        View
                                      </Button>
                                    </a>
                                  ) : null}

                                  <IconButton
                                    aria-label="Delete attachment"
                                    icon={<FiTrash2 />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteAttachment(att.id)}
                                  />
                                </HStack>
                              </Flex>
                            </Box>
                          ))}
                        </SimpleGrid>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* TAB 3: Snapshots */}
                  <TabPanel p={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {/* Project Snapshot Card */}
                      <Box
                        p={4}
                        rounded="xl"
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                        bg={colorMode === "light" ? "gray.50" : "gray.800"}
                      >
                        <Text fontSize="xs" fontWeight="bold" mb={3} color="blue.500">
                          Project Snapshot Metadata
                        </Text>
                        <VStack align="start" spacing={2} fontSize="xs">
                          <HStack justify="space-between" w="full">
                            <Text color="gray.500">Project Code:</Text>
                            <Text fontWeight="bold">{payment.projectCode || "N/A"}</Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text color="gray.500">Project Name:</Text>
                            <Text fontWeight="semibold" noOfLines={1}>
                              {payment.projectName || "-"}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text color="gray.500">Owner Division:</Text>
                            <Text fontWeight="semibold">{payment.proOwnerDivisionName || "-"}</Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text color="gray.500">Characteristic:</Text>
                            <Text fontWeight="semibold">
                              {payment.projectCharasteristicName || "-"}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>

                      {/* Vendor Snapshot Card */}
                      <Box
                        p={4}
                        rounded="xl"
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                        bg={colorMode === "light" ? "gray.50" : "gray.800"}
                      >
                        <Text fontSize="xs" fontWeight="bold" mb={3} color="purple.500">
                          Vendor Snapshot Metadata
                        </Text>
                        <VStack align="start" spacing={2} fontSize="xs">
                          <HStack justify="space-between" w="full">
                            <Text color="gray.500">Vendor Code / Name:</Text>
                            <Text fontWeight="bold">
                              {payment.vendorCode} - {payment.vendorName}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text color="gray.500">Location:</Text>
                            <Text fontWeight="semibold">
                              {payment.vendorCity}, {payment.vendorCountry}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text color="gray.500">Business PIC:</Text>
                            <Text fontWeight="semibold">
                              {payment.vendorPicBusinessName} ({payment.vendorPicBusinessEmail})
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text color="gray.500">Technical PIC:</Text>
                            <Text fontWeight="semibold">
                              {payment.vendorPicTechnicalName} ({payment.vendorPicTechnicalEmail})
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    </SimpleGrid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px"
            borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
            py={3}
          >
            <Button size="sm" variant="ghost" rounded="lg" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Supplemental Attachment Modal */}
      {isUploadOpen && (
        <PaymentAttachmentUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          paymentId={payment.id}
          tokenData={tokenData}
          onSuccess={() => {
            onRefreshData();
          }}
        />
      )}
    </>
  );
}
