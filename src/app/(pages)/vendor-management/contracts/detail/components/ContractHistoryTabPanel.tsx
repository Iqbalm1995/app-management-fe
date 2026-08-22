"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  FiClock,
  FiDollarSign,
  FiEye,
  FiFileText,
  FiRotateCcw,
  FiUserCheck,
  FiLayers,
  FiCalendar,
} from "react-icons/fi";

import { VendorContractHistoryResponse } from "@/app/services/useVendor";
import { formatIDR } from "@/app/components/CardContract";
import ModalContractHistoryDetail from "./ModalContractHistoryDetail";

interface ContractHistoryTabPanelProps {
  historyList: VendorContractHistoryResponse[];
}

export const ContractHistoryTabPanel = ({
  historyList = [],
}: ContractHistoryTabPanelProps) => {
  const { colorMode } = useColorMode();
  const detailModal = useDisclosure();
  const [selectedHistory, setSelectedHistory] = useState<VendorContractHistoryResponse | null>(null);
  const [selectedRevNumber, setSelectedRevNumber] = useState<number>(1);

  if (historyList.length === 0) {
    return (
      <Card rounded="2xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
        <CardBody p={10}>
          <Flex justify="center" align="center" direction="column" gap={3} textStyle="center">
            <Box w={12} h={12} bg="teal.50" color="teal.500" rounded="2xl" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FiRotateCcw} boxSize={6} />
            </Box>
            <Heading size="sm">No Data Revision Logs Found</Heading>
            <Text fontSize="xs" color="gray.500" maxW="400px" textAlign="center">
              No historical revisions recorded for this contract yet. Audit history snapshots are automatically captured whenever contract details or payment schedules are updated.
            </Text>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={5} align="stretch">
      <Card rounded="2xl" shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
        <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Box w={9} h={9} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                <Icon as={FiRotateCcw} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md">Contract Revision & Change Audit Trail</Heading>
                <Text fontSize="xs" color="gray.500">
                  Total of {historyList.length} historical snapshot(s) archived before updates
                </Text>
              </VStack>
            </HStack>

            <Badge colorScheme="purple" fontSize="2xs" px={3} py={1} rounded="full">
              {historyList.length} Revisions Recorded
            </Badge>
          </Flex>
        </CardHeader>

        <CardBody p={6}>
          <Accordion allowMultiple defaultIndex={[0]}>
            {historyList.map((history, idx) => {
              const revNumber = historyList.length - idx;
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

              return (
                <AccordionItem
                  key={history.id || idx}
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  rounded="xl"
                  mb={4}
                  overflow="hidden"
                >
                  <AccordionButton
                    py={4}
                    px={5}
                    bg={colorMode === "light" ? "gray.50/80" : "gray.800"}
                    _hover={{ bg: colorMode === "light" ? "purple.50/50" : "gray.750" }}
                  >
                    <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={3} mr={2}>
                      <HStack spacing={3}>
                        <Badge colorScheme="purple" fontSize="xs" px={2.5} py={0.5} rounded="md">
                          Rev #{revNumber}
                        </Badge>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="bold">
                            {history.corpName || "Contract Title"} ({history.contractNumber})
                          </Text>
                          <HStack spacing={3} fontSize="xs" color="gray.500">
                            <HStack spacing={1}>
                              <Icon as={FiClock} boxSize={3.5} />
                              <Text>Captured: {formattedDate}</Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Icon as={FiUserCheck} boxSize={3.5} />
                              <Text>By: {history.updatedBy || history.createdBy || "SYSTEM"}</Text>
                            </HStack>
                          </HStack>
                        </VStack>
                      </HStack>

                      <HStack spacing={3}>
                        <Text fontSize="xs" fontWeight="bold" color="teal.600">
                          {formatIDR(history.workValue)}
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="purple"
                          variant="outline"
                          leftIcon={<FiEye />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHistory(history);
                            setSelectedRevNumber(revNumber);
                            detailModal.onOpen();
                          }}
                        >
                          View Full Snapshot
                        </Button>
                        <AccordionIcon />
                      </HStack>
                    </Flex>
                  </AccordionButton>

                  <AccordionPanel p={5} bg={colorMode === "light" ? "white" : "gray.900"}>
                    <VStack spacing={5} align="stretch">
                      {/* Basic Header Info Snapshot */}
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={3} p={4} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                        <GridItem>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold">SPK / CORP NUMBER</Text>
                            <Text fontSize="xs" fontWeight="bold">{history.corpNumber}</Text>
                          </VStack>
                        </GridItem>
                        <GridItem>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold">CONTRACT NUMBER</Text>
                            <Text fontSize="xs" fontWeight="bold">{history.contractNumber}</Text>
                          </VStack>
                        </GridItem>
                        <GridItem>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold">SIGNING DATE</Text>
                            <Text fontSize="xs" fontWeight="bold">
                              {history.contractDate ? new Date(history.contractDate).toLocaleDateString("id-ID") : "-"}
                            </Text>
                          </VStack>
                        </GridItem>
                      </Grid>

                      {/* Monetary & Breakdown Snapshot */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                        <Box p={3.5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "teal.200" : "teal.800"} bg={colorMode === "light" ? "teal.50/30" : "gray.800"}>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold">TOTAL WORK VALUE</Text>
                            <Text fontSize="sm" fontWeight="bold" color="teal.600">{formatIDR(history.workValue)}</Text>
                          </VStack>
                        </Box>

                        <Box p={3.5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "blue.200" : "blue.800"} bg={colorMode === "light" ? "blue.50/30" : "gray.800"}>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold">CAPEX EXPENDITURE</Text>
                            <Text fontSize="xs" fontWeight="bold" color="blue.600">
                              {formatIDR(history.cavexValues)} ({history.capexPercentage}%)
                            </Text>
                          </VStack>
                        </Box>

                        <Box p={3.5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "purple.200" : "purple.800"} bg={colorMode === "light" ? "purple.50/30" : "gray.800"}>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold">OPEX EXPENDITURE</Text>
                            <Text fontSize="xs" fontWeight="bold" color="purple.600">
                              {formatIDR(history.ovexValues)} ({history.ovexPercentage}%)
                            </Text>
                          </VStack>
                        </Box>
                      </SimpleGrid>

                      {/* TOP Schedule History Snapshot */}
                      <VStack align="stretch" spacing={2}>
                        <HStack spacing={2} color="gray.600">
                          <Icon as={FiLayers} />
                          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                            Payment TOP Schedule Snapshot ({topHistoryList.length} Steps - {formatIDR(totalTopVal)})
                          </Text>
                        </HStack>

                        {topHistoryList.length === 0 ? (
                          <Text fontSize="xs" color="gray.500" fontStyle="italic">No TOP steps archived in this revision snapshot.</Text>
                        ) : (
                          <Box border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} rounded="xl" overflow="hidden">
                            <Table size="sm" variant="simple">
                              <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                                <Tr>
                                  <Th>Step</Th>
                                  <Th>Milestone Description</Th>
                                  <Th textAlign="right">Payment Amount (IDR)</Th>
                                  <Th textAlign="right">Due Date</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {topHistoryList.map((topStep, topIdx) => (
                                  <Tr key={topStep.id || topIdx}>
                                    <Td fontWeight="bold">Step #{topStep.stepOrder}</Td>
                                    <Td fontSize="xs">{topStep.topDescriptions || "-"}</Td>
                                    <Td fontWeight="bold" textAlign="right" color="teal.600">
                                      {formatIDR(topStep.topValues || 0)}
                                    </Td>
                                    <Td textAlign="right" fontSize="xs">
                                      {topStep.topDate ? new Date(topStep.topDate).toLocaleDateString("id-ID") : "-"}
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
                        )}
                      </VStack>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardBody>
      </Card>

      {/* Full History Snapshot Detail Modal */}
      <ModalContractHistoryDetail
        isOpen={detailModal.isOpen}
        onClose={detailModal.onClose}
        history={selectedHistory}
        revNumber={selectedRevNumber}
      />
    </VStack>
  );
};

export default ContractHistoryTabPanel;
