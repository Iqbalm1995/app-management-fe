"use client";

import React, { useEffect, useState } from "react";
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
  Divider,
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
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiClock,
  FiRotateCcw,
  FiUserCheck,
  FiFileText,
  FiTrendingUp,
  FiDollarSign,
  FiPieChart,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import useVendor, {
  ContractCostGovHistoryResponse,
} from "@/app/services/useVendor";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";

interface ModalCostGovHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractNumber?: string;
  tokenData: string;
}

export const formatIDR = (val?: number | null): string => {
  if (val === undefined || val === null || isNaN(val)) return "Rp. 0";
  return `Rp. ${Number(val).toLocaleString("id-ID")}`;
};

export const formatPct = (val?: number | null): string => {
  if (val === undefined || val === null || isNaN(val)) return "0.0%";
  const num = Number(val);
  return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
};

export default function ModalCostGovHistory({
  isOpen,
  onClose,
  contractId,
  contractNumber,
  tokenData,
}: ModalCostGovHistoryProps) {
  const { colorMode } = useColorMode();
  const { GetCostGovHistoryList } = useVendor();

  const [histories, setHistories] = useState<ContractCostGovHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchHistory = async () => {
    if (!contractId || !tokenData) return;
    setIsLoading(true);
    try {
      const res = await GetCostGovHistoryList(contractId, tokenData);
      if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data)) {
        setHistories(res.data);
      } else {
        setHistories([]);
      }
    } catch {
      setHistories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contractId) {
      fetchHistory();
    }
  }, [isOpen, contractId]);

  const getTagColor = (hpsKey: string) => {
    switch (hpsKey) {
      case "hps_it":
        return "purple";
      case "hps_umum":
        return "orange";
      case "hps_komite":
        return "blue";
      default:
        return "teal";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent
        rounded="2xl"
        shadow="2xl"
        maxH="90vh"
        bg={colorMode === "light" ? "white" : "gray.900"}
      >
        <ModalHeader
          borderBottom="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "gray.50" : "gray.850"}
          roundedTop="2xl"
          py={4}
          px={6}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3} pr={6}>
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bg="blue.500"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                shadow="md"
              >
                <Icon as={FiRotateCcw} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Heading size="md">Riwayat Snapshot Tata Kelola Biaya</Heading>
                  <Badge colorScheme="blue" fontSize="xs" px={2.5} py={0.5} rounded="md">
                    {histories.length} Snapshot
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {contractNumber ? `Kontrak: ${contractNumber} • ` : ""}
                  Audit trail snapshot seluruh parameter HPS dan Anggaran RBB
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="xs"
                variant="outline"
                colorScheme="blue"
                leftIcon={<FiRefreshCw />}
                isLoading={isLoading}
                onClick={fetchHistory}
              >
                Muat Ulang
              </Button>
            </HStack>
          </Flex>
        </ModalHeader>

        <ModalCloseButton top={4} right={4} />

        <ModalBody p={6}>
          {isLoading ? (
            <Flex justify="center" align="center" direction="column" py={16} gap={3}>
              <Spinner size="lg" color="blue.500" thickness="3px" />
              <Text fontSize="sm" color="gray.500">
                Memuat riwayat snapshot tata kelola biaya...
              </Text>
            </Flex>
          ) : histories.length === 0 ? (
            <Card
              rounded="2xl"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "gray.50/50" : "gray.800"}
            >
              <CardBody p={10}>
                <Flex justify="center" align="center" direction="column" gap={3} textAlign="center">
                  <Box
                    w={14}
                    h={14}
                    bg="blue.50"
                    color="blue.500"
                    rounded="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiClock} boxSize={7} />
                  </Box>
                  <Heading size="sm">Belum Ada Riwayat Snapshot</Heading>
                  <Text fontSize="xs" color="gray.500" maxW="480px">
                    Riwayat snapshot akan otomatis tersimpan secara permanen setiap kali Anda melakukan pembaruan parameter pada form Tata Kelola Biaya dan menekan tombol &quot;Simpan Tata Kelola Biaya&quot;.
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          ) : (
            <VStack spacing={4} align="stretch">
              <Accordion allowMultiple defaultIndex={[0]}>
                {histories.map((hist, idx) => {
                  const revNumber = histories.length - idx;
                  const snapshotDate = hist.createdAt
                    ? new Date(hist.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-";

                  const hpsItems = hist.hpsItemsHistory || [];
                  const diffResapan = hist.totalBudgetRbb - hist.contractWorkValue;

                  return (
                    <AccordionItem
                      key={hist.id || idx}
                      border="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      rounded="xl"
                      mb={4}
                      overflow="hidden"
                      bg={colorMode === "light" ? "white" : "gray.850"}
                    >
                      <AccordionButton
                        py={4}
                        px={5}
                        bg={colorMode === "light" ? "gray.50" : "gray.800"}
                        _hover={{
                          bg: colorMode === "light" ? "blue.50/40" : "gray.750",
                        }}
                      >
                        <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={3} mr={2}>
                          <HStack spacing={3}>
                            <Badge colorScheme="blue" fontSize="xs" px={2.5} py={0.5} rounded="md">
                              Rev #{revNumber}
                            </Badge>
                            <VStack align="start" spacing={0}>
                              <HStack spacing={2}>
                                <Text fontSize="sm" fontWeight="bold">
                                  {hist.revisionReason || "Pembaruan Tata Kelola Biaya"}
                                </Text>
                                {hist.benchmarkHpsKey && (
                                  <Badge colorScheme="yellow" fontSize="3xs" px={1.5}>
                                    Benchmark: {hist.benchmarkHpsKey.toUpperCase()}
                                  </Badge>
                                )}
                              </HStack>
                              <HStack spacing={3} fontSize="xs" color="gray.500">
                                <HStack spacing={1}>
                                  <Icon as={FiClock} boxSize={3.5} />
                                  <Text>Tercatat: {snapshotDate}</Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <Icon as={FiUserCheck} boxSize={3.5} />
                                  <Text>Oleh: {hist.createdBy || "SYSTEM"}</Text>
                                </HStack>
                              </HStack>
                            </VStack>
                          </HStack>

                          <HStack spacing={4}>
                            <VStack align="end" spacing={0}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                                PAGU ANGGARAN RBB
                              </Text>
                              <Text fontSize="xs" fontWeight="bold" color="blue.600">
                                {formatIDR(hist.totalBudgetRbb)}
                              </Text>
                            </VStack>

                            <VStack align="end" spacing={0}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                                RESAPAN KONTRAK
                              </Text>
                              <Badge
                                colorScheme={hist.globalResapanPercentage >= 0 ? "teal" : "red"}
                                fontSize="2xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                              >
                                {formatPct(hist.globalResapanPercentage)}
                              </Badge>
                            </VStack>

                            <AccordionIcon />
                          </HStack>
                        </Flex>
                      </AccordionButton>

                      <AccordionPanel p={5}>
                        <VStack spacing={5} align="stretch">
                          {/* Financial Summary Cards */}
                          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
                            <Box
                              p={3.5}
                              rounded="xl"
                              border="1px"
                              borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
                              bg={colorMode === "light" ? "blue.50/30" : "gray.800"}
                            >
                              <VStack align="start" spacing={0.5}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                                  Total Anggaran RBB (A)
                                </Text>
                                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                  {formatIDR(hist.totalBudgetRbb)}
                                </Text>
                                <Text fontSize="3xs" color="gray.400">Pagu pagu acuan snapshot</Text>
                              </VStack>
                            </Box>

                            <Box
                              p={3.5}
                              rounded="xl"
                              border="1px"
                              borderColor={colorMode === "light" ? "teal.200" : "teal.800"}
                              bg={colorMode === "light" ? "teal.50/30" : "gray.800"}
                            >
                              <VStack align="start" spacing={0.5}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                                  Nilai Kontrak Vendor (C)
                                </Text>
                                <Text fontSize="sm" fontWeight="bold" color="teal.600">
                                  {formatIDR(hist.contractWorkValue)}
                                </Text>
                                <Text fontSize="3xs" color="gray.400">Nilai SPK saat snapshot</Text>
                              </VStack>
                            </Box>

                            <Box
                              p={3.5}
                              rounded="xl"
                              border="1px"
                              borderColor={colorMode === "light" ? "green.200" : "green.800"}
                              bg={colorMode === "light" ? "green.50/30" : "gray.800"}
                            >
                              <VStack align="start" spacing={0.5}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                                  Sisa Anggaran RBB (A - C)
                                </Text>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color={diffResapan >= 0 ? "green.600" : "red.500"}
                                >
                                  {formatIDR(diffResapan)}
                                </Text>
                                <Text fontSize="3xs" color="gray.400">
                                  {diffResapan >= 0 ? "Anggaran Surplus" : "Defisit Anggaran"}
                                </Text>
                              </VStack>
                            </Box>

                            <Box
                              p={3.5}
                              rounded="xl"
                              border="1px"
                              borderColor={colorMode === "light" ? "purple.200" : "purple.800"}
                              bg={colorMode === "light" ? "purple.50/30" : "gray.800"}
                            >
                              <VStack align="start" spacing={0.5}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                                  Resapan Global (A vs C)
                                </Text>
                                <Text fontSize="sm" fontWeight="bold" color="purple.600">
                                  {formatPct(hist.globalResapanPercentage)}
                                </Text>
                                <Text fontSize="3xs" color="gray.400">
                                  Status: {hist.globalResapanStatus || "NORMAL"}
                                </Text>
                              </VStack>
                            </Box>
                          </SimpleGrid>

                          {/* Multi-HPS Snapshot Breakdown Table */}
                          <Box
                            border="1px"
                            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                            rounded="xl"
                            overflow="hidden"
                          >
                            <Box
                              bg={colorMode === "light" ? "gray.50" : "gray.800"}
                              py={2.5}
                              px={4}
                              borderBottom="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                            >
                              <Flex justify="space-between" align="center">
                                <HStack spacing={2}>
                                  <Icon as={FiPieChart} color="blue.500" boxSize={4} />
                                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                                    Matriks Varian HPS Snapshot ({hpsItems.length} Model)
                                  </Text>
                                </HStack>
                              </Flex>
                            </Box>

                            {hpsItems.length === 0 ? (
                              <Box p={4} textAlign="center">
                                <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                  Tidak ada rincian pilar HPS yang tercatat dalam snapshot ini.
                                </Text>
                              </Box>
                            ) : (
                              <TableContainer>
                                <Table variant="simple" size="sm">
                                  <Thead bg={colorMode === "light" ? "gray.50/60" : "gray.850"}>
                                    <Tr>
                                      <Th fontSize="2xs" py={2.5} w="40px">No.</Th>
                                      <Th fontSize="2xs" py={2.5}>Pilar & Model HPS</Th>
                                      <Th fontSize="2xs" py={2.5} isNumeric>Nominal HPS (Rp.)</Th>
                                      <Th fontSize="2xs" py={2.5} isNumeric>vs Anggaran RBB (A - H)</Th>
                                      <Th fontSize="2xs" py={2.5}>Kecukupan Anggaran RBB</Th>
                                      <Th fontSize="2xs" py={2.5} isNumeric>vs Nilai Kontrak (H - C)</Th>
                                      <Th fontSize="2xs" py={2.5}>Efisiensi Terhadap HPS</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody fontSize="xs">
                                    {hpsItems.map((hps, hIdx) => {
                                      const tagColor = getTagColor(hps.hpsKey);

                                      return (
                                        <Tr
                                          key={hps.id || hIdx}
                                          bg={
                                            hps.isBenchmark
                                              ? colorMode === "light"
                                                ? "blue.50/30"
                                                : "blue.900/10"
                                              : "transparent"
                                          }
                                        >
                                          <Td fontWeight="bold">{hIdx + 1}</Td>

                                          <Td>
                                            <HStack spacing={2}>
                                              <Badge
                                                colorScheme={tagColor}
                                                fontSize="3xs"
                                                px={1.5}
                                                py={0.2}
                                                rounded="md"
                                              >
                                                {hps.hpsTag || "HPS"}
                                              </Badge>
                                              <Text fontWeight="semibold">{hps.hpsName}</Text>
                                              {hps.isBenchmark && (
                                                <Badge colorScheme="yellow" fontSize="3xs" px={1.5}>
                                                  Benchmark
                                                </Badge>
                                              )}
                                            </HStack>
                                          </Td>

                                          <Td isNumeric fontWeight="bold" color="blue.600">
                                            {formatIDR(hps.hpsNominal)}
                                          </Td>

                                          <Td
                                            isNumeric
                                            fontWeight="semibold"
                                            color={hps.diffRbbNominal >= 0 ? "green.600" : "red.500"}
                                          >
                                            {formatIDR(hps.diffRbbNominal)} ({formatPct(hps.diffRbbPercentage)})
                                          </Td>

                                          <Td>
                                            <Badge
                                              colorScheme={hps.diffRbbNominal >= 0 ? "green" : "red"}
                                              fontSize="3xs"
                                              px={1.5}
                                              py={0.5}
                                              rounded="md"
                                            >
                                              {hps.diffRbbStatus || (hps.diffRbbNominal >= 0 ? "CUKUP" : "DEFISIT")}
                                            </Badge>
                                          </Td>

                                          <Td
                                            isNumeric
                                            fontWeight="semibold"
                                            color={hps.diffContractNominal >= 0 ? "teal.600" : "red.500"}
                                          >
                                            {formatIDR(hps.diffContractNominal)} ({formatPct(hps.diffContractPercentage)})
                                          </Td>

                                          <Td>
                                            <Badge
                                              colorScheme={hps.diffContractNominal >= 0 ? "teal" : "red"}
                                              fontSize="3xs"
                                              px={1.5}
                                              py={0.5}
                                              rounded="md"
                                            >
                                              {hps.diffContractStatus || (hps.diffContractNominal >= 0 ? "EFISIEN" : "OVER BUDGET")}
                                            </Badge>
                                          </Td>
                                        </Tr>
                                      );
                                    })}
                                  </Tbody>
                                </Table>
                              </TableContainer>
                            )}
                          </Box>

                          {/* Audit Metadata Footer Box */}
                          <Grid
                            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                            gap={3}
                            p={3.5}
                            rounded="xl"
                            bg={colorMode === "light" ? "gray.50" : "gray.800"}
                            fontSize="2xs"
                            color="gray.500"
                          >
                            <GridItem>
                              <VStack align="start" spacing={0.5}>
                                <Text fontWeight="bold">SNAPSHOT ID</Text>
                                <Text fontFamily="mono">{hist.id}</Text>
                              </VStack>
                            </GridItem>
                            <GridItem>
                              <VStack align="start" spacing={0.5}>
                                <Text fontWeight="bold">ALASAN REVISI / PERUBAHAN</Text>
                                <Text color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {hist.revisionReason || "Tidak ada catatan alasan"}
                                </Text>
                              </VStack>
                            </GridItem>
                          </Grid>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter
          borderTop="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "gray.50" : "gray.850"}
          roundedBottom="2xl"
          py={3}
          px={6}
        >
          <Button size="sm" colorScheme="blue" onClick={onClose}>
            Tutup Riwayat Snapshot
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
