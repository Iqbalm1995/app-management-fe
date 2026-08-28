"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiShield,
  FiUserCheck,
  FiRotateCcw,
  FiTrendingUp,
} from "react-icons/fi";

import { VendorContractHistoryResponse } from "@/app/services/useVendor";
import { formatIDR } from "@/app/components/CardContract";

interface ModalContractHistoryDetailProps {
  isOpen: boolean;
  onClose: () => void;
  history: VendorContractHistoryResponse | null;
  revNumber: number;
}

export const ModalContractHistoryDetail = ({
  isOpen,
  onClose,
  history,
  revNumber,
}: ModalContractHistoryDetailProps) => {
  const { colorMode } = useColorMode();

  if (!history) return null;

  const snapshotDate = history.updatedAt || history.createdAt;
  const formattedDate = snapshotDate
    ? new Date(snapshotDate).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const topHistoryList = history.topHistoryList || [];
  const totalTopVal = topHistoryList.reduce((acc, c) => acc + (c.topValues || 0), 0);

  const formatDateStr = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent rounded="2xl" shadow="2xl">
        <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3} pr={6}>
            <HStack spacing={3}>
              <Box w={10} h={10} bg="purple.500" rounded="xl" display="flex" alignItems="center" justifyContent="center" color="white">
                <Icon as={FiRotateCcw} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Heading size="md">Contract Revision Detail Snapshot</Heading>
                  <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} rounded="md">
                    Rev #{revNumber}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Archived snapshot captured on {formattedDate} by {history.updatedBy || history.createdBy || "SYSTEM"}
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* SECTION 1: Basic Header Contract Data */}
            <Box p={5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50/70" : "gray.800"}>
              <VStack align="stretch" spacing={3}>
                <HStack spacing={2} color="purple.500">
                  <Icon as={FiBriefcase} />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">1. Corporate & Contract Identifiers</Text>
                </HStack>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                  {history.projectId && (
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <Box p={2.5} rounded="lg" bg={colorMode === "light" ? "purple.50" : "gray.750"} border="1px" borderColor={colorMode === "light" ? "purple.200" : "purple.700"}>
                        <VStack align="start" spacing={0.5}>
                          <HStack spacing={2}>
                            <Text fontSize="2xs" color="purple.600" fontWeight="bold">LINKED PROCUREMENT PROJECT</Text>
                            <Badge colorScheme="purple" fontSize="2xs">{history.projectCode || history.projectNo || "PROJ"}</Badge>
                            {history.sdlcStageName && <Badge colorScheme="teal" variant="outline" fontSize="2xs">{history.sdlcStageName}</Badge>}
                          </HStack>
                          <Text fontSize="xs" fontWeight="bold">{history.projectName || "Corporate Project"}</Text>
                          {(history.proOwnerDivisionName || history.proOwnerDirectorateName) && (
                            <Text fontSize="2xs" color="gray.500">{history.proOwnerDivisionName} • {history.proOwnerDirectorateName}</Text>
                          )}
                        </VStack>
                      </Box>
                    </GridItem>
                  )}

                  <GridItem>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">SPK / CORP REF NUMBER</Text>
                      <Text fontSize="sm" fontWeight="bold">{history.corpNumber}</Text>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">PROJECT / CONTRACT TITLE</Text>
                      <Text fontSize="sm" fontWeight="bold">{history.corpName}</Text>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">OFFICIAL CONTRACT NUMBER</Text>
                      <Text fontSize="xs" fontWeight="bold">{history.contractNumber}</Text>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">CONTRACT SIGNING DATE</Text>
                      <Text fontSize="xs" fontWeight="bold">{formatDateStr(history.contractDate)}</Text>
                    </VStack>
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Box p={2.5} rounded="lg" bg={colorMode === "light" ? "white" : "gray.750"} border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                      <HStack justify="space-between" wrap="wrap" gap={2}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="bold">BILLING MODEL</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme={history.contractBillingType && history.contractBillingType !== "MILESTONE" ? "purple" : "blue"} fontSize="2xs">
                              {history.contractBillingType || "MILESTONE"}
                            </Badge>
                            {history.subscriptionAutoRenew && <Badge colorScheme="green" fontSize="2xs">Auto-Renew</Badge>}
                          </HStack>
                        </VStack>
                        {history.contractBillingType && history.contractBillingType !== "MILESTONE" && (
                          <VStack align="end" spacing={0}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold">PERIODIC RATE</Text>
                            <Text fontSize="xs" fontWeight="bold" color="purple.600">
                              {formatIDR(history.subscriptionPeriodValue || 0)} / cycle
                            </Text>
                          </VStack>
                        )}
                      </HStack>
                    </Box>
                  </GridItem>
                </Grid>
              </VStack>
            </Box>

            {/* SECTION 2: Monetary Work Value & CAPEX / OPEX Allocations */}
            <Box p={5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "teal.200" : "teal.800"} bg={colorMode === "light" ? "teal.50/20" : "gray.800"}>
              <VStack align="stretch" spacing={4}>
                <HStack spacing={2} color="teal.600">
                  <Icon as={FiDollarSign} />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">2. Work Value & Financial Breakdown</Text>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "white" : "gray.750"} border="1px" borderColor={colorMode === "light" ? "teal.200" : "teal.700"}>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">TOTAL WORK VALUE</Text>
                      <Text fontSize="md" fontWeight="bold" color="teal.600">{formatIDR(history.workValue)}</Text>
                    </VStack>
                  </Box>

                  <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "white" : "gray.750"} border="1px" borderColor={colorMode === "light" ? "blue.200" : "blue.700"}>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">CAPEX ALLOCATION</Text>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600">{formatIDR(history.cavexValues)}</Text>
                      <Badge colorScheme="blue" fontSize="2xs" mt={1}>{history.capexPercentage}% Share</Badge>
                    </VStack>
                  </Box>

                  <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "white" : "gray.750"} border="1px" borderColor={colorMode === "light" ? "purple.200" : "purple.700"}>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">OPEX ALLOCATION</Text>
                      <Text fontSize="sm" fontWeight="bold" color="purple.600">{formatIDR(history.ovexValues)}</Text>
                      <Badge colorScheme="purple" fontSize="2xs" mt={1}>{history.ovexPercentage}% Share</Badge>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* SECTION 3: Timelines & SLA Guarantees */}
            <Box p={5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <VStack align="stretch" spacing={3}>
                <HStack spacing={2} color="blue.500">
                  <Icon as={FiCalendar} />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">3. Execution Timelines & SLA Periods</Text>
                </HStack>

                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
                  <Box p={3} rounded="lg" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                    <VStack align="start" spacing={0.5}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">Contract Duration</Text>
                      <Text fontSize="xs">{formatDateStr(history.contractStartDate)} – {formatDateStr(history.contractEndDate)}</Text>
                    </VStack>
                  </Box>

                  <Box p={3} rounded="lg" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                    <VStack align="start" spacing={0.5}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">Works Execution</Text>
                      <Text fontSize="xs">{formatDateStr(history.worksStartDate)} – {formatDateStr(history.worksEndDate)}</Text>
                    </VStack>
                  </Box>

                  <Box p={3} rounded="lg" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                    <VStack align="start" spacing={0.5}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">Warranty SLA</Text>
                      <Text fontSize="xs">{formatDateStr(history.warrantyStartDate)} – {formatDateStr(history.warrantyEndDate)}</Text>
                    </VStack>
                  </Box>

                  <Box p={3} rounded="lg" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                    <VStack align="start" spacing={0.5}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">Maintenance SLA</Text>
                      <Text fontSize="xs">{formatDateStr(history.maintenanceStartDate)} – {formatDateStr(history.maintenanceEndDate)}</Text>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* SECTION 4: Performance & Maintenance Guarantees */}
            <Box p={5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <VStack align="stretch" spacing={3}>
                <HStack spacing={2} color="purple.500">
                  <Icon as={FiShield} />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">4. Bank Guarantees & Financial Bonds</Text>
                </HStack>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                  <Box p={3.5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Performance Guarantee Bond</Text>
                      <Text fontSize="sm" fontWeight="bold" color="teal.600">{formatIDR(history.performanceGuaranteeValues)}</Text>
                      <Text fontSize="2xs" color="gray.500">
                        Validity: {formatDateStr(history.performanceGuaranteeStartDate)} – {formatDateStr(history.performanceGuaranteeEndDate)}
                      </Text>
                    </VStack>
                  </Box>

                  <Box p={3.5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Maintenance Warranty Bond</Text>
                      <Text fontSize="sm" fontWeight="bold" color="teal.600">{formatIDR(history.maintenanceWarrantyValues)}</Text>
                      <Text fontSize="2xs" color="gray.500">
                        Validity: {formatDateStr(history.maintenanceWarrantyStartDate)} – {formatDateStr(history.maintenanceWarrantyEndDate)}
                      </Text>
                    </VStack>
                  </Box>
                </Grid>
              </VStack>
            </Box>

            {/* SECTION 5: Terms of Payment (TOP) Schedule History */}
            <Box p={5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={2} color="teal.600">
                    <Icon as={FiLayers} />
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">5. Archived Terms of Payment (TOP) Schedule</Text>
                  </HStack>

                  <Badge colorScheme="teal" fontSize="2xs" px={2.5} py={0.5} rounded="md">
                    Total: {formatIDR(totalTopVal)} ({topHistoryList.length} Steps)
                  </Badge>
                </Flex>

                {topHistoryList.length === 0 ? (
                  <Text fontSize="xs" color="gray.500" fontStyle="italic">No TOP steps archived in this revision snapshot.</Text>
                ) : (
                  <Box border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} rounded="xl" overflow="hidden">
                    <Table size="sm" variant="simple">
                      <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                        <Tr>
                          <Th>Step</Th>
                          <Th>Milestone Description</Th>
                          <Th>Billing Period</Th>
                          <Th textAlign="right">Payment Amount (IDR)</Th>
                          <Th textAlign="right">Status</Th>
                          <Th textAlign="right">Scheduled Due Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {topHistoryList.map((step, idx) => (
                          <Tr key={step.id || idx}>
                            <Td fontWeight="bold">Step #{step.stepOrder}</Td>
                            <Td fontSize="xs">{step.topDescriptions || "-"}</Td>
                            <Td fontSize="xs">
                              {step.billingPeriodStart && step.billingPeriodEnd ? (
                                <Badge colorScheme="purple" fontSize="2xs">
                                  {formatDateStr(step.billingPeriodStart)} &rarr; {formatDateStr(step.billingPeriodEnd)}
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </Td>
                            <Td fontWeight="bold" textAlign="right" color="teal.600">
                              {formatIDR(step.topValues || 0)}
                            </Td>
                            <Td textAlign="right">
                              <Badge colorScheme="green" fontSize="2xs">
                                {step.topStatus || "ACTIVE"}
                              </Badge>
                            </Td>
                            <Td textAlign="right" fontSize="xs">
                              {step.topDate ? formatDateStr(step.topDate) : "-"}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* SECTION 6: Archived Cost Governance & Multi-HPS Snapshot */}
            {history.costGovernanceHistory && (
              <Box p={5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                    <HStack spacing={2} color="blue.500">
                      <Icon as={FiTrendingUp} />
                      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">6. Archived Cost Governance & Multi-HPS</Text>
                    </HStack>

                    <HStack spacing={2}>
                      <Badge colorScheme="blue" fontSize="2xs" px={2} py={0.5} rounded="md">
                        Anggaran RBB: {formatIDR(history.costGovernanceHistory.totalBudgetRbb || 0)}
                      </Badge>
                      <Badge colorScheme={history.costGovernanceHistory.globalResapanPercentage >= 0 ? "teal" : "red"} fontSize="2xs" px={2} py={0.5} rounded="md">
                        Resapan: {history.costGovernanceHistory.globalResapanPercentage?.toFixed(2)}%
                      </Badge>
                    </HStack>
                  </Flex>

                  {(!history.costGovernanceHistory.hpsItemsHistory || history.costGovernanceHistory.hpsItemsHistory.length === 0) ? (
                    <Text fontSize="xs" color="gray.500" fontStyle="italic">No HPS items recorded in this snapshot.</Text>
                  ) : (
                    <Box border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} rounded="xl" overflow="hidden">
                      <Table size="sm" variant="simple">
                        <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                          <Tr>
                            <Th>HPS Model</Th>
                            <Th>Tag</Th>
                            <Th textAlign="right">Nilai HPS (IDR)</Th>
                            <Th textAlign="right">vs Anggaran RBB</Th>
                            <Th textAlign="right">vs Nilai Kontrak</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {history.costGovernanceHistory.hpsItemsHistory.map((hps, idx) => (
                            <Tr key={hps.id || idx}>
                              <Td fontWeight="semibold" fontSize="xs">
                                <HStack spacing={1.5}>
                                  <Text>{hps.hpsName}</Text>
                                  {hps.isBenchmark && (
                                    <Badge colorScheme="yellow" fontSize="3xs">Benchmark</Badge>
                                  )}
                                </HStack>
                              </Td>
                              <Td fontSize="xs">
                                <Badge colorScheme="purple" fontSize="3xs">{hps.hpsTag}</Badge>
                              </Td>
                              <Td fontWeight="bold" textAlign="right" color="blue.600" fontSize="xs">
                                {formatIDR(hps.hpsNominal || 0)}
                              </Td>
                              <Td textAlign="right" fontSize="xs" fontWeight="semibold" color={hps.diffRbbPercentage >= 0 ? "green.600" : "red.500"}>
                                {hps.diffRbbPercentage > 0 ? `+${hps.diffRbbPercentage.toFixed(2)}%` : `${hps.diffRbbPercentage.toFixed(2)}%`}
                              </Td>
                              <Td textAlign="right" fontSize="xs" fontWeight="semibold" color={hps.diffContractPercentage >= 0 ? "teal.600" : "red.500"}>
                                {hps.diffContractPercentage > 0 ? `+${hps.diffContractPercentage.toFixed(2)}%` : `${hps.diffContractPercentage.toFixed(2)}%`}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
          <Button size="sm" colorScheme="teal" onClick={onClose}>
            Close Detail Snapshot
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalContractHistoryDetail;
