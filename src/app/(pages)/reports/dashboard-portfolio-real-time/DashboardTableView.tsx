"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge, Box, Card, CardBody, CardHeader, Divider, Flex, Grid, GridItem, Heading, HStack,
  Icon, Spinner, Text, useColorMode, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, useReactTable,
} from "@tanstack/react-table";
import { TableComponentFull } from "@/app/components/tableComponents";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import useSnapshotServices, {
  ProjectSummaryDashboardResponse,
  ProjectCharacteristicsDashboardResponse,
  ProjectTypeDashboardResponse,
  ProcurementWorkProgramDashboardResponse,
  ProjectAcquisitionsDashboardResponse,
  ProjectByGroupManageDashboardResponse,
  DevStaffProjectClosedDashboardResponse,
  DevStaffProjectActiveDashboardResponse,
  RealtimeDashboardFilterRequest,
} from "@/app/services/useSnapshotServices";
import { FiActivity, FiBarChart } from "react-icons/fi";

interface DashboardTableViewProps {
  tokenData: string;
}

// Section wrapper with loading state
function TableSection({ title, icon, loading, children, count }: {
  title: string; icon: any; loading: boolean; children: React.ReactNode; count?: number;
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"} overflow="hidden">
      <CardHeader py={3} px={5}>
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Box w={7} h={7} bg="blue.500" rounded="md" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={icon} boxSize={3.5} />
            </Box>
            <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>{title}</Heading>
          </HStack>
          {count !== undefined && <Badge colorScheme="blue" variant="subtle" fontSize="xs">{count} records</Badge>}
        </HStack>
      </CardHeader>
      <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
      <CardBody px={3} py={3} overflowX="auto">
        {loading ? (
          <Flex justify="center" py={8}>
            <VStack spacing={2}>
              <Spinner size="md" color="blue.500" />
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>Loading data...</Text>
            </VStack>
          </Flex>
        ) : children}
      </CardBody>
    </Card>
  );
}

export default function DashboardTableView({ tokenData }: DashboardTableViewProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const {
    getRealtimeProjectSummary,
    getRealtimeProjectCharacteristics,
    getRealtimeProjectType,
    getRealtimeProcurementWorkProgram,
    getRealtimeProjectAcquisitions,
    getRealtimeProjectByGroupManage,
    getRealtimeDevStaffProjectClosed,
    getRealtimeDevStaffProjectActive,
  } = useSnapshotServices();

  // Per-section data + loading state
  const [summaryData, setSummaryData] = useState<ProjectSummaryDashboardResponse[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [characteristicsData, setCharacteristicsData] = useState<ProjectCharacteristicsDashboardResponse[]>([]);
  const [characteristicsLoading, setCharacteristicsLoading] = useState(false);

  const [typeData, setTypeData] = useState<ProjectTypeDashboardResponse[]>([]);
  const [typeLoading, setTypeLoading] = useState(false);

  const [procurementData, setProcurementData] = useState<ProcurementWorkProgramDashboardResponse[]>([]);
  const [procurementLoading, setProcurementLoading] = useState(false);

  const [acquisitionsData, setAcquisitionsData] = useState<ProjectAcquisitionsDashboardResponse[]>([]);
  const [acquisitionsLoading, setAcquisitionsLoading] = useState(false);

  const [groupManageData, setGroupManageData] = useState<ProjectByGroupManageDashboardResponse[]>([]);
  const [groupManageLoading, setGroupManageLoading] = useState(false);

  const [devClosedData, setDevClosedData] = useState<DevStaffProjectClosedDashboardResponse[]>([]);
  const [devClosedLoading, setDevClosedLoading] = useState(false);

  const [devActiveData, setDevActiveData] = useState<DevStaffProjectActiveDashboardResponse[]>([]);
  const [devActiveLoading, setDevActiveLoading] = useState(false);

  // Load all sections in batches
  useEffect(() => {
    if (!tokenData) return;
    const filter: RealtimeDashboardFilterRequest = {};

    const loadBatch1 = async () => {
      setSummaryLoading(true); setCharacteristicsLoading(true); setTypeLoading(true);
      const [r1, r2, r3] = await Promise.all([
        getRealtimeProjectSummary(filter, tokenData),
        getRealtimeProjectCharacteristics(filter, tokenData),
        getRealtimeProjectType(filter, tokenData),
      ]);
      if (r1?.statusCode === RES_CODE_OK) setSummaryData(r1.data || []);
      if (r2?.statusCode === RES_CODE_OK) setCharacteristicsData(r2.data || []);
      if (r3?.statusCode === RES_CODE_OK) setTypeData(r3.data || []);
      setSummaryLoading(false); setCharacteristicsLoading(false); setTypeLoading(false);
    };

    const loadBatch2 = async () => {
      setProcurementLoading(true); setAcquisitionsLoading(true); setGroupManageLoading(true);
      const [r1, r2, r3] = await Promise.all([
        getRealtimeProcurementWorkProgram(filter, tokenData),
        getRealtimeProjectAcquisitions(filter, tokenData),
        getRealtimeProjectByGroupManage(filter, tokenData),
      ]);
      if (r1?.statusCode === RES_CODE_OK) setProcurementData(r1.data || []);
      if (r2?.statusCode === RES_CODE_OK) setAcquisitionsData(r2.data || []);
      if (r3?.statusCode === RES_CODE_OK) setGroupManageData(r3.data || []);
      setProcurementLoading(false); setAcquisitionsLoading(false); setGroupManageLoading(false);
    };

    const loadBatch3 = async () => {
      setDevClosedLoading(true); setDevActiveLoading(true);
      const [r1, r2] = await Promise.all([
        getRealtimeDevStaffProjectClosed(filter, tokenData),
        getRealtimeDevStaffProjectActive(filter, tokenData),
      ]);
      if (r1?.statusCode === RES_CODE_OK) setDevClosedData(r1.data || []);
      if (r2?.statusCode === RES_CODE_OK) setDevActiveData(r2.data || []);
      setDevClosedLoading(false); setDevActiveLoading(false);
    };

    // Staggered load
    loadBatch1().then(() => loadBatch2()).then(() => loadBatch3());
  }, [tokenData]);

  // Column definitions
  const summaryColumns = useMemo<ColumnDef<ProjectSummaryDashboardResponse>[]>(() => [
    { accessorKey: "projectStatus", header: () => <Text>Status</Text>, cell: (info) => <Badge colorScheme={info.getValue() === "RUNNING" ? "green" : info.getValue() === "COMPLETED" ? "blue" : "gray"} variant="subtle">{info.getValue() as string}</Badge> },
    { accessorKey: "projectCount", header: () => <Text>Count</Text>, cell: (info) => <Text fontWeight="bold">{info.getValue() as number}</Text> },
    { accessorKey: "percentage", header: () => <Text>%</Text>, cell: (info) => <Text>{(info.getValue() as number).toFixed(1)}%</Text> },
  ], []);

  const characteristicsColumns = useMemo<ColumnDef<ProjectCharacteristicsDashboardResponse>[]>(() => [
    { accessorKey: "characteristicName", header: () => <Text>Characteristic</Text>, cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text> },
    { accessorKey: "projectCount", header: () => <Text>Count</Text>, cell: (info) => <Text fontWeight="bold">{info.getValue() as number}</Text> },
  ], []);

  const typeColumns = useMemo<ColumnDef<ProjectTypeDashboardResponse>[]>(() => [
    { accessorKey: "projectTypeName", header: () => <Text>Project Type</Text>, cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text> },
    { accessorKey: "projectCount", header: () => <Text>Count</Text>, cell: (info) => <Text fontWeight="bold">{info.getValue() as number}</Text> },
  ], []);

  const procurementColumns = useMemo<ColumnDef<ProcurementWorkProgramDashboardResponse>[]>(() => [
    { accessorKey: "procurementWorkProgramFlag", header: () => <Text>Work Program</Text>, cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text> },
    { accessorKey: "projectCount", header: () => <Text>Count</Text>, cell: (info) => <Text fontWeight="bold">{info.getValue() as number}</Text> },
  ], []);

  const acquisitionsColumns = useMemo<ColumnDef<ProjectAcquisitionsDashboardResponse>[]>(() => [
    { accessorKey: "projectAcquisitionName", header: () => <Text>Acquisition</Text>, cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text> },
    { accessorKey: "projectCount", header: () => <Text>Count</Text>, cell: (info) => <Text fontWeight="bold">{info.getValue() as number}</Text> },
  ], []);

  const groupManageColumns = useMemo<ColumnDef<ProjectByGroupManageDashboardResponse>[]>(() => [
    { accessorKey: "projectGroupNameManage", header: () => <Text>Group</Text>, cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text> },
    { accessorKey: "projectCount", header: () => <Text>Count</Text>, cell: (info) => <Text fontWeight="bold">{info.getValue() as number}</Text> },
  ], []);

  const devClosedColumns = useMemo<ColumnDef<DevStaffProjectClosedDashboardResponse>[]>(() => [
    { accessorKey: "userFullName", header: () => <Text>Staff</Text>, cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text> },
    { accessorKey: "projectCount", header: () => <Text>Projects</Text>, cell: (info) => <Text fontWeight="bold">{info.getValue() as number}</Text> },
  ], []);

  const devActiveColumns = useMemo<ColumnDef<DevStaffProjectActiveDashboardResponse>[]>(() => [
    { accessorKey: "userFullName", header: () => <Text>Staff</Text>, cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text> },
    { accessorKey: "projectCount", header: () => <Text>Projects</Text>, cell: (info) => <Text fontWeight="bold">{info.getValue() as number}</Text> },
  ], []);

  // Tables
  const summaryTable = useReactTable({ data: summaryData, columns: summaryColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const characteristicsTable = useReactTable({ data: characteristicsData, columns: characteristicsColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const typeTable = useReactTable({ data: typeData, columns: typeColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const procurementTable = useReactTable({ data: procurementData, columns: procurementColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const acquisitionsTable = useReactTable({ data: acquisitionsData, columns: acquisitionsColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const groupManageTable = useReactTable({ data: groupManageData, columns: groupManageColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const devClosedTable = useReactTable({ data: devClosedData, columns: devClosedColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const devActiveTable = useReactTable({ data: devActiveData, columns: devActiveColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });

  return (
    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5} pt={4} w="full" overflow="hidden">
      <GridItem minW={0}>
        <TableSection title="Project Summary" icon={FiBarChart} loading={summaryLoading} count={summaryData.length}>
          <TableComponentFull table={summaryTable} />
        </TableSection>
      </GridItem>

      <GridItem minW={0}>
        <TableSection title="Project Type" icon={FiBarChart} loading={typeLoading} count={typeData.length}>
          <TableComponentFull table={typeTable} />
        </TableSection>
      </GridItem>

      <GridItem minW={0}>
        <TableSection title="Project Characteristics" icon={FiBarChart} loading={characteristicsLoading} count={characteristicsData.length}>
          <TableComponentFull table={characteristicsTable} />
        </TableSection>
      </GridItem>

      <GridItem minW={0}>
        <TableSection title="Procurement Work Program" icon={FiBarChart} loading={procurementLoading} count={procurementData.length}>
          <TableComponentFull table={procurementTable} />
        </TableSection>
      </GridItem>

      <GridItem minW={0}>
        <TableSection title="Project Acquisitions" icon={FiBarChart} loading={acquisitionsLoading} count={acquisitionsData.length}>
          <TableComponentFull table={acquisitionsTable} />
        </TableSection>
      </GridItem>

      <GridItem minW={0}>
        <TableSection title="Project by Group Manage" icon={FiBarChart} loading={groupManageLoading} count={groupManageData.length}>
          <TableComponentFull table={groupManageTable} />
        </TableSection>
      </GridItem>

      <GridItem minW={0}>
        <TableSection title="Dev Staff — Project Closed" icon={FiActivity} loading={devClosedLoading} count={devClosedData.length}>
          <TableComponentFull table={devClosedTable} />
        </TableSection>
      </GridItem>

      <GridItem minW={0}>
        <TableSection title="Dev Staff — Project Active" icon={FiActivity} loading={devActiveLoading} count={devActiveData.length}>
          <TableComponentFull table={devActiveTable} />
        </TableSection>
      </GridItem>
    </Grid>
  );
}
