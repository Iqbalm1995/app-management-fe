"use client";

import {
  Heading,
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  useColorMode,
  Flex,
  Stack,
  Divider,
  Input,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  SimpleGrid,
  Button,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import {
  FiLayers,
  FiEye,
  FiCalendar,
} from "react-icons/fi";
import { BacklogDataResponse } from "@/app/services/useRequirements";
import { useState, useMemo } from "react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { ColumnMetaCustom, ListSearchByParamProps } from "@/app/types/masterTypes";

interface BacklogsSectionProps {
  backlogList: BacklogDataResponse[];
  backlogStats?: any;
  requirementType?: string | null;
}

export const BacklogsSection = ({
  backlogList,
  requirementType,
}: BacklogsSectionProps) => {
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState("");

  // Modal inspection state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inspectedBacklog, setInspectedBacklog] =
    useState<BacklogDataResponse | null>(null);

  const handleInspect = (backlog: BacklogDataResponse) => {
    setInspectedBacklog(backlog);
    onOpen();
  };

  const isRfc = requirementType === "RFC";

  const getPriorityColor = (priority?: string | null) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
        return "red";
      case "HIGH":
        return "orange";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "green";
      default:
        return "gray";
    }
  };

  const getUrgencyColor = (urgency?: string | null) => {
    switch (urgency?.toUpperCase()) {
      case "HIGH":
      case "CRITICAL":
        return "orange";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "green";
      default:
        return "gray";
    }
  };

  const getImpactColor = (impact?: string | null) => {
    switch (impact?.toUpperCase()) {
      case "HIGH":
      case "CRITICAL":
        return "red";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "green";
      default:
        return "gray";
    }
  };

  const getEnvBadgeColor = (env?: string | null) => {
    switch (env?.toUpperCase()) {
      case "FRONTEND":
        return "teal";
      case "BACKEND":
        return "purple";
      case "DATABASE":
      case "DB":
        return "blue";
      case "FULLSTACK":
        return "cyan";
      case "MOBILE":
        return "pink";
      case "INFRASTRUCTURE":
      case "DEVOPS":
        return "orange";
      default:
        return "gray";
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered dataset by keyword
  const filteredList = useMemo(() => {
    if (!backlogList) return [];
    if (!searchTerm.trim()) return backlogList;
    const term = searchTerm.toLowerCase().trim();
    return backlogList.filter((b) => {
      return (
        b.backlogName?.toLowerCase().includes(term) ||
        b.backlogCode?.toLowerCase().includes(term) ||
        b.backlogDesc?.toLowerCase().includes(term) ||
        b.envSide?.toLowerCase().includes(term) ||
        b.maintenanceCategory?.toLowerCase().includes(term) ||
        b.priority?.toLowerCase().includes(term) ||
        b.rfcPriorities?.toLowerCase().includes(term)
      );
    });
  }, [backlogList, searchTerm]);

  // Priority counts for summary bar
  const priorityStats = useMemo(() => {
    const stats = { critical: 0, high: 0, medium: 0, low: 0 };
    (backlogList || []).forEach((b) => {
      const p = (b.priority || b.rfcPriorities || "").toUpperCase();
      if (p === "CRITICAL") stats.critical++;
      else if (p === "HIGH") stats.high++;
      else if (p === "MEDIUM") stats.medium++;
      else if (p === "LOW") stats.low++;
    });
    return stats;
  }, [backlogList]);

  // TanStack Table Column Definitions matching /projects/manage (projectFeaturesView.tsx)
  const columnsData = useMemo<ColumnDef<BacklogDataResponse>[]>(() => {
    return [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontSize="xs" fontWeight="semibold">
              {info.row.index + 1}.
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">No.</Flex>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.backlogName,
        id: "backlogName",
        cell: (info) => (
          <Flex
            w="full"
            h="full"
            justifyContent="center"
            alignItems="start"
            as={Stack}
            spacing={1}
            py={1}
          >
            <HStack spacing={2} align="center">
              <Text fontWeight={600} fontSize="sm">
                {info.row.original.backlogName}
              </Text>
              {info.row.original.backlogCode && (
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  fontFamily="mono"
                  fontSize="2xs"
                  px={1.5}
                >
                  {info.row.original.backlogCode}
                </Badge>
              )}
              {info.row.original.version && (
                <Badge size="xs" colorScheme="gray" fontSize="2xs" variant="outline">
                  v{info.row.original.version}
                </Badge>
              )}
            </HStack>
            <Text as="p" fontSize="xs" color="gray.500" noOfLines={2}>
              {info.row.original.backlogDesc || "-"}
            </Text>
            {info.row.original.note && (
              <Text fontSize="2xs" color="gray.400" fontStyle="italic" noOfLines={1}>
                Note: {info.row.original.note}
              </Text>
            )}
          </Flex>
        ),
        header: () => <Flex justifyContent="start">Scopes</Flex>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.envSide,
        id: "envSide",
        cell: (info) => (
          <Flex w="full" h="full" alignItems="start" as={Stack} spacing={1} py={1}>
            {info.row.original.envSide ? (
              <Badge
                colorScheme={getEnvBadgeColor(info.row.original.envSide)}
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="md"
                textTransform="uppercase"
              >
                {info.row.original.envSide}
              </Badge>
            ) : (
              <Badge colorScheme="gray" fontSize="2xs">
                General
              </Badge>
            )}
            {info.row.original.maintenanceCategory && (
              <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                {info.row.original.maintenanceCategory}
                {info.row.original.maintenanceType
                  ? ` • ${info.row.original.maintenanceType}`
                  : ""}
              </Text>
            )}
          </Flex>
        ),
        header: () => <Flex justifyContent="start">Environment</Flex>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.backlogEnddate,
        id: "backlogEnddate",
        cell: (info) => (
          <Flex w="full" h="full" alignItems="start" as={Stack} spacing={1} py={1}>
            <HStack spacing={1.5} fontSize="xs">
              <FiCalendar size={12} />
              <Text fontSize="2xs" fontWeight="medium">
                {formatDate(info.row.original.backlogStartdate)} -{" "}
                {formatDate(info.row.original.backlogEnddate)}
              </Text>
            </HStack>
          </Flex>
        ),
        header: () => <Flex justifyContent="start">Target Schedule</Flex>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.urgency,
        id: "urgencyImpact",
        cell: (info) => (
          <Flex w="full" h="full" alignItems="start" as={Stack} spacing={1} py={1}>
            <HStack spacing={1}>
              <Text fontSize="2xs" color="gray.500">
                U:
              </Text>
              <Badge
                colorScheme={getUrgencyColor(info.row.original.urgency)}
                fontSize="2xs"
              >
                {info.row.original.urgency || "LOW"}
              </Badge>
              <Text fontSize="2xs" color="gray.500" ml={1}>
                I:
              </Text>
              <Badge
                colorScheme={getImpactColor(info.row.original.impact)}
                fontSize="2xs"
              >
                {info.row.original.impact || "LOW"}
              </Badge>
            </HStack>
          </Flex>
        ),
        header: () => <Flex justifyContent="start">Urgency & Impact</Flex>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => (isRfc ? row.rfcPriorities : row.priority),
        id: isRfc ? "rfcPriorities" : "priority",
        cell: (info) => {
          const priorityValue = isRfc
            ? info.row.original.rfcPriorities
            : info.row.original.priority;
          return (
            <Flex w="full" h="full" alignItems="start" as={Stack} spacing={1} py={1}>
              <Badge
                colorScheme={getPriorityColor(priorityValue)}
                fontSize="xs"
                px={2.5}
                py={0.5}
                rounded="md"
                fontWeight={600}
              >
                {priorityValue || "LOW"}
              </Badge>
            </Flex>
          );
        },
        header: () => (
          <Flex justifyContent="start">
            {isRfc ? "RFC Priority" : "Priority"}
          </Flex>
        ),
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.rppb,
        id: "compliance",
        cell: (info) => (
          <Flex w="full" h="full" alignItems="start" as={Stack} spacing={1} py={1}>
            <HStack spacing={1}>
              <Badge
                colorScheme={info.row.original.rppb === "YES" ? "green" : "gray"}
                fontSize="2xs"
                variant="subtle"
              >
                RPPB: {info.row.original.rppb || "N/A"}
              </Badge>
              <Badge
                colorScheme={
                  info.row.original.licensing === "YES" ? "blue" : "gray"
                }
                fontSize="2xs"
                variant="subtle"
              >
                Lic: {info.row.original.licensing || "N/A"}
              </Badge>
            </HStack>
          </Flex>
        ),
        header: () => <Flex justifyContent="start">Compliance</Flex>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.id,
        id: "action",
        cell: (info) => (
          <Flex w="full" justifyContent="center">
            <Tooltip label="View detailed specification" hasArrow>
              <IconButton
                aria-label="View Details"
                icon={<FiEye />}
                size="xs"
                colorScheme="secondary"
                variant="ghost"
                onClick={() => handleInspect(info.row.original)}
              />
            </Tooltip>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">Action</Flex>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
    ];
  }, [isRfc]);

  // TanStack Table Instance matching projectFeaturesView.tsx
  const tableBacklogs = useReactTable({
    data: filteredList,
    columns: columnsData,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    debugTable: false,
    manualFiltering: false,
    manualPagination: false,
  });

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    // Column filter handler placeholder matching projectFeaturesView
  };

  if (!backlogList || backlogList.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500">No project scope backlogs defined</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* 1. Header Toolbar matching /projects/manage */}
      <Flex
        w="full"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        gap={3}
      >
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient="linear(135deg, secondary.500, secondary.700)"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            shadow="sm"
          >
            <FiLayers size={20} />
          </Box>
          <Box>
            <Heading as="h4" size="md">
              Project Scope (Backlogs)
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Detailed scope items and technical specifications
            </Text>
          </Box>
        </HStack>

        {/* Priority Counts Summary Bar */}
        <HStack spacing={2} flexWrap="wrap">
          <Badge
            colorScheme="secondary"
            variant="subtle"
            fontSize="xs"
            px={3}
            py={1}
            rounded="full"
          >
            Total: {backlogList.length}
          </Badge>
          {priorityStats.critical > 0 && (
            <Badge
              colorScheme="red"
              variant="solid"
              fontSize="2xs"
              px={2}
              py={0.5}
              rounded="full"
            >
              {priorityStats.critical} Critical
            </Badge>
          )}
          {priorityStats.high > 0 && (
            <Badge
              colorScheme="orange"
              variant="solid"
              fontSize="2xs"
              px={2}
              py={0.5}
              rounded="full"
            >
              {priorityStats.high} High
            </Badge>
          )}
          {priorityStats.medium > 0 && (
            <Badge
              colorScheme="yellow"
              variant="subtle"
              fontSize="2xs"
              px={2}
              py={0.5}
              rounded="full"
            >
              {priorityStats.medium} Medium
            </Badge>
          )}
          {priorityStats.low > 0 && (
            <Badge
              colorScheme="green"
              variant="subtle"
              fontSize="2xs"
              px={2}
              py={0.5}
              rounded="full"
            >
              {priorityStats.low} Low
            </Badge>
          )}
        </HStack>
      </Flex>

      {/* 2. Main Content: RFC Comparison Cards vs TableComponentWithFilterCTX */}
      {isRfc ? (
        <RfcBacklogView
          backlogList={backlogList}
          colorMode={colorMode}
          getPriorityColor={getPriorityColor}
        />
      ) : (
        <Flex w="full" as={Stack} spacing={4}>
          {/* Search Input matching projectFeaturesView */}
          <Flex w="full" as={HStack} justifyContent="space-between">
            <Flex as={HStack} maxW={{ base: "full", sm: "360px" }} w="full">
              <Input
                id="backlogSearch"
                name="backlogSearch"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Scopes..."
                minLength={1}
                maxLength={150}
                size="sm"
                rounded={radiusStyle}
              />
            </Flex>
          </Flex>

          {/* TableComponentWithFilterCTX directly from project manage */}
          <Flex as={Stack} w="full" spacing={5}>
            <TableComponentWithFilterCTX
              table={tableBacklogs}
              handleFilterChange={handleFilterChange}
            />
          </Flex>
        </Flex>
      )}

      {/* 3. Deep Inspection Modal */}
      {inspectedBacklog && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          isCentered
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent rounded="xl">
            <ModalHeader
              bg={colorMode === "light" ? "secondary.50" : "gray.900"}
              roundedTop="xl"
              borderBottom="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              py={4}
            >
              <HStack justify="space-between" align="center" pr={6}>
                <HStack spacing={3}>
                  <Box
                    w={8}
                    h={8}
                    bg="secondary.500"
                    color="white"
                    rounded="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiLayers size={18} />
                  </Box>
                  <Box>
                    <Text fontSize="md" fontWeight="bold">
                      {inspectedBacklog.backlogName}
                    </Text>
                    <HStack spacing={2} mt={0.5}>
                      <Badge
                        colorScheme="blue"
                        fontFamily="mono"
                        fontSize="2xs"
                      >
                        {inspectedBacklog.backlogCode || "NO CODE"}
                      </Badge>
                      {inspectedBacklog.envSide && (
                        <Badge
                          colorScheme={getEnvBadgeColor(
                            inspectedBacklog.envSide
                          )}
                          fontSize="2xs"
                        >
                          {inspectedBacklog.envSide}
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>
                <Badge
                  colorScheme={getPriorityColor(
                    inspectedBacklog.priority ||
                      inspectedBacklog.rfcPriorities
                  )}
                  fontSize="xs"
                  px={3}
                  py={1}
                  rounded="md"
                >
                  {inspectedBacklog.priority ||
                    inspectedBacklog.rfcPriorities ||
                    "LOW"}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton mt={2} />

            <ModalBody py={6}>
              <VStack spacing={5} align="stretch">
                {/* Scope Description */}
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.500"
                    textTransform="uppercase"
                    mb={1.5}
                  >
                    Scope Description
                  </Text>
                  <Box
                    p={4}
                    rounded="md"
                    bg={colorMode === "light" ? "gray.50" : "gray.900"}
                    border="1px"
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.700"
                    }
                  >
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {inspectedBacklog.backlogDesc ||
                        "No detailed description recorded for this item."}
                    </Text>
                  </Box>
                </Box>

                {/* Technical Specifications Grid */}
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.500"
                    textTransform="uppercase"
                    mb={2}
                  >
                    Technical & Delivery Metadata
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Box
                      p={3}
                      rounded="md"
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.700"
                      }
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                        ENVIRONMENT / LAYER
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" mt={0.5}>
                        {inspectedBacklog.envSide || "General / Unspecified"}
                      </Text>
                    </Box>

                    <Box
                      p={3}
                      rounded="md"
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.700"
                      }
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                        MAINTENANCE CATEGORY & TYPE
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" mt={0.5}>
                        {inspectedBacklog.maintenanceCategory || "Feature"}
                        {inspectedBacklog.maintenanceType
                          ? ` • ${inspectedBacklog.maintenanceType}`
                          : ""}
                      </Text>
                    </Box>

                    <Box
                      p={3}
                      rounded="md"
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.700"
                      }
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                        TARGET START DATE
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" mt={0.5}>
                        {formatDate(inspectedBacklog.backlogStartdate)}
                      </Text>
                    </Box>

                    <Box
                      p={3}
                      rounded="md"
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.700"
                      }
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                        TARGET COMPLETION DATE
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" mt={0.5}>
                        {formatDate(inspectedBacklog.backlogEnddate)}
                      </Text>
                    </Box>

                    <Box
                      p={3}
                      rounded="md"
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.700"
                      }
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                        URGENCY & IMPACT RATINGS
                      </Text>
                      <HStack spacing={2} mt={1}>
                        <Badge
                          colorScheme={getUrgencyColor(
                            inspectedBacklog.urgency
                          )}
                          fontSize="xs"
                        >
                          Urgency: {inspectedBacklog.urgency || "LOW"}
                        </Badge>
                        <Badge
                          colorScheme={getImpactColor(
                            inspectedBacklog.impact
                          )}
                          fontSize="xs"
                        >
                          Impact: {inspectedBacklog.impact || "LOW"}
                        </Badge>
                      </HStack>
                    </Box>

                    <Box
                      p={3}
                      rounded="md"
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.700"
                      }
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                        GOVERNANCE & COMPLIANCE
                      </Text>
                      <HStack spacing={2} mt={1}>
                        <Badge
                          colorScheme={
                            inspectedBacklog.rppb === "YES" ? "green" : "gray"
                          }
                          fontSize="xs"
                        >
                          RPPB: {inspectedBacklog.rppb || "N/A"}
                        </Badge>
                        <Badge
                          colorScheme={
                            inspectedBacklog.licensing === "YES"
                              ? "blue"
                              : "gray"
                          }
                          fontSize="xs"
                        >
                          License: {inspectedBacklog.licensing || "N/A"}
                        </Badge>
                      </HStack>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Remarks / Notes */}
                {inspectedBacklog.note && (
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.500"
                      textTransform="uppercase"
                      mb={1}
                    >
                      Remarks & Evaluation Notes
                    </Text>
                    <Box
                      p={3}
                      rounded="md"
                      bg={colorMode === "light" ? "yellow.50" : "yellow.950"}
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "yellow.200" : "yellow.800"
                      }
                    >
                      <Text fontSize="sm">{inspectedBacklog.note}</Text>
                    </Box>
                  </Box>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter
              borderTop="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <Button onClick={onClose} size="sm">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </VStack>
  );
};

// ============================================================================
// RFC Scope View with Side-by-Side Comparison
// ============================================================================
interface RfcBacklogViewProps {
  backlogList: BacklogDataResponse[];
  colorMode: string;
  getPriorityColor: (priority?: string | null) => string;
}

const RfcBacklogView = ({
  backlogList,
  colorMode,
  getPriorityColor,
}: RfcBacklogViewProps) => {
  const sortedBacklogs = [...backlogList].sort(
    (a, b) => (b.posOrder || 0) - (a.posOrder || 0)
  );

  return (
    <VStack w="full" spacing={6} align="stretch">
      {sortedBacklogs.map((backlog, index) => {
        const latestHistory =
          backlog.backlogHistories && backlog.backlogHistories.length > 0
            ? backlog.backlogHistories[backlog.backlogHistories.length - 1]
            : null;

        return (
          <Card
            key={backlog.id || index}
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            shadow="sm"
            rounded="xl"
            overflow="hidden"
          >
            <CardHeader
              bg={colorMode === "light" ? "gray.100" : "gray.750"}
              py={3}
              px={5}
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5}>
                    Scope #{index + 1}
                  </Badge>
                  <Text fontWeight="bold" fontSize="sm">
                    {backlog.backlogName}
                  </Text>
                  {backlog.backlogCode && (
                    <Badge variant="outline" fontFamily="mono" fontSize="2xs">
                      {backlog.backlogCode}
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={2}>
                  <Badge
                    colorScheme={getPriorityColor(
                      backlog.rfcPriorities || backlog.priority
                    )}
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    rounded="md"
                  >
                    Priority: {backlog.rfcPriorities || backlog.priority || "LOW"}
                  </Badge>
                </HStack>
              </Flex>
            </CardHeader>

            <CardBody p={5}>
              <Grid
                templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                gap={5}
              >
                {/* Existing Condition - Left Column */}
                <GridItem w="full">
                  <Box
                    p={4}
                    rounded={radiusStyle}
                    border="2px"
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.700"
                    }
                    h="full"
                    bg={colorMode === "light" ? "gray.50" : "gray.900"}
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <Heading as="h6" size="xs" color="gray.600">
                        EXISTING CONDITION
                      </Heading>
                      <Badge colorScheme="gray" fontSize="2xs">
                        Current Baseline
                      </Badge>
                    </Flex>
                    <Divider borderColor="gray.300" mb={3} />

                    <VStack align="stretch" spacing={3} fontSize="xs">
                      <Box>
                        <Text fontWeight="bold" color="gray.500">
                          Scope Name:
                        </Text>
                        <Text fontWeight="medium">
                          {latestHistory?.backlogName || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.500">
                          Description:
                        </Text>
                        <Text>{latestHistory?.backlogDesc || "-"}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.500">
                          Notes / Remarks:
                        </Text>
                        <Text>{latestHistory?.note || "-"}</Text>
                      </Box>
                      <HStack justify="space-between" pt={2}>
                        <Text fontWeight="bold" color="gray.500">
                          Order Position:
                        </Text>
                        <Badge colorScheme="gray">
                          {latestHistory?.posOrder || 0}
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>
                </GridItem>

                {/* Proposed Change - Right Column */}
                <GridItem w="full">
                  <Box
                    p={4}
                    rounded={radiusStyle}
                    border="2px"
                    borderColor="secondary.400"
                    h="full"
                    bg={colorMode === "light" ? "white" : "gray.850"}
                    shadow="sm"
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <Heading as="h6" size="xs" color="secondary.600">
                        PROPOSED CHANGE SPECIFICATION
                      </Heading>
                      <Badge colorScheme="secondary" fontSize="2xs">
                        Proposed
                      </Badge>
                    </Flex>
                    <Divider borderColor="secondary.200" mb={3} />

                    <VStack align="stretch" spacing={3} fontSize="xs">
                      <Box>
                        <Text fontWeight="bold" color="gray.500">
                          Scope Name:
                        </Text>
                        <Text fontWeight="semibold" color="secondary.600">
                          {backlog.backlogName || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.500">
                          Description:
                        </Text>
                        <Text>{backlog.backlogDesc || "-"}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.500">
                          Notes / Remarks:
                        </Text>
                        <Text>{backlog.note || "-"}</Text>
                      </Box>

                      <SimpleGrid columns={2} spacing={2} pt={2}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">
                            Change Type:
                          </Text>
                          <Badge colorScheme="blue" fontSize="2xs" mt={0.5}>
                            {backlog.rfcBacklogChanges || "-"}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">
                            Importance:
                          </Text>
                          <Badge colorScheme="cyan" fontSize="2xs" mt={0.5}>
                            {backlog.rfcBacklogImportant || "-"}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">
                            Impact on Others:
                          </Text>
                          <Badge colorScheme="teal" fontSize="2xs" mt={0.5}>
                            {backlog.rfcBacklogImpactOthers || "-"}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">
                            Order Position:
                          </Text>
                          <Badge colorScheme="secondary" fontSize="2xs" mt={0.5}>
                            {backlog.posOrder || 0}
                          </Badge>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        );
      })}
    </VStack>
  );
};
