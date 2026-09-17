"use client";

import { useMemo } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Table,
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
import { FiBarChart2 } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { SimulationStage } from "../types";
import {
  autoScheduleStages,
  buildMonthWeekAxis,
  computeDuration,
  computeStagesDateRange,
  dateToWeekBucket,
  groupAxisByMonth,
  parseDate,
  toDateString,
} from "../utils/weekBucket";
import { addDays } from "date-fns";

interface GanttChartProps {
  stages: SimulationStage[];
  height?: number | string;
}

// Standardized column widths (in px) for uniform week columns M1, M2, M3, M4 (M = Minggu)
const NO_COL_WIDTH = 50;
const AKTIVITAS_COL_WIDTH = 260;
const PIHAK_COL_WIDTH = 180;
const DURASI_COL_WIDTH = 90;
const WEEK_COL_WIDTH = 64; // Uniform fixed width for each M1, M2, M3, M4 column

/**
 * Executive PMO Gantt Chart Table layout matching reference design
 * (A33D5ACC-0F6C-4FAB-B394-880CC81269DA.png):
 * - Scrollable strictly inside its container without overflowing the page
 * - Standardized uniform column width per week (M1, M2, M3, M4 - M stands for Minggu)
 * - Two-tier headers: No, Aktivitas, Pihak Terlibat, Durasi (Hari), Bulan 1..N with M1..M4
 * - Continuous spanning activity timeline bars with duration labels
 * - Corporate footer note & slogan
 */
const GanttChart = ({ stages }: GanttChartProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Ensure stages have valid dates for the visualization
  const effectiveStages = useMemo(() => {
    const hasAnyMissingDate = stages.some(
      (s) => !parseDate(s.startDate) || !parseDate(s.endDate)
    );
    if (hasAnyMissingDate && stages.length > 0) {
      return autoScheduleStages(stages);
    }
    return stages;
  }, [stages]);

  const sortedStages = useMemo(
    () =>
      [...effectiveStages]
        .sort((a, b) => a.order - b.order)
        .filter((s) => parseDate(s.startDate) && parseDate(s.endDate)),
    [effectiveStages]
  );

  // Build the ordered month & 4-week bucket axis spanning the simulation
  const axis = useMemo(() => {
    const range = computeStagesDateRange(sortedStages);
    if (range.min && range.max) {
      return buildMonthWeekAxis(range.min, range.max);
    }
    // Fallback: default to current month & next month (2 months) if no stages
    const today = new Date();
    const min = toDateString(today);
    const max = toDateString(addDays(today, 60));
    return buildMonthWeekAxis(min, max);
  }, [sortedStages]);

  const monthGroups = useMemo(() => groupAxisByMonth(axis), [axis]);
  const totalWeeks = axis.length;

  // Exact table geometry calculations
  const totalWeeksWidth = totalWeeks * WEEK_COL_WIDTH;
  const totalTableWidth =
    NO_COL_WIDTH +
    AKTIVITAS_COL_WIDTH +
    PIHAK_COL_WIDTH +
    DURASI_COL_WIDTH +
    totalWeeksWidth;

  /** Map a date string (yyyy-MM-dd) to its overall index within the week axis */
  const indexOfDate = (value: string | null): number => {
    const bucket = dateToWeekBucket(value);
    if (!bucket) return -1;
    return axis.findIndex(
      (a) => a.monthKey === bucket.monthKey && a.week === bucket.week
    );
  };

  // Color tokens aligned with reference image & bank bjb brand
  const headerBgPrimary = isDark ? "secondary.900" : "#0D47A1";
  const headerBgSecondary = isDark ? "secondary.800" : "#1565C0";
  const headerBgSub = isDark ? "secondary.700" : "#1976D2";
  const gridBorderColor = isDark ? "whiteAlpha.200" : "#CBD5E0";
  const rowAltBg = isDark ? "whiteAlpha.50" : "#F8FAFC";
  const barBg = isDark ? "#2B6CB0" : "#1E88E5";

  if (stages.length === 0) {
    return (
      <VStack
        minH="380px"
        justify="center"
        align="center"
        spacing={3}
        border="2px dashed"
        borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
        bg={isDark ? "transparent" : "gray.50"}
        rounded="xl"
        p={8}
        textAlign="center"
      >
        <Box
          p={3}
          bg={isDark ? "blue.900" : "blue.50"}
          color="blue.500"
          rounded="full"
        >
          <FiBarChart2 size={28} />
        </Box>
        <Text fontWeight="bold" fontSize="md">
          No stages available
        </Text>
        <Text fontSize="xs" color="gray.500" maxW="380px">
          Select an Activity Stream or claim SDLC stages from an assigned project to simulate the timeline.
        </Text>
      </VStack>
    );
  }

  return (
    <Box w="100%" maxW="100%" minW="0" py={2}>
      {/* ── 1. Top Section: Title & Legend (Matching Reference Image) ── */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "flex-end" }}
        mb={4}
        gap={3}
        w="100%"
        maxW="100%"
      >
        <VStack align="start" spacing={0.5}>
          <Heading
            as="h2"
            size="md"
            fontWeight="900"
            letterSpacing="tight"
            color={isDark ? "blue.200" : "#1A365D"}
          >
            PROJECT TIMELINE
          </Heading>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color={isDark ? "gray.400" : "gray.600"}
          >
            Timeline Simulation (Gantt Chart)
          </Text>
        </VStack>

        {/* Legend Pill */}
        <HStack
          bg={isDark ? "whiteAlpha.100" : "white"}
          border="1px solid"
          borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
          rounded="lg"
          px={3.5}
          py={1.5}
          spacing={2.5}
          shadow="sm"
        >
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color={isDark ? "gray.300" : "gray.600"}
          >
            Keterangan:
          </Text>
          <Box w="30px" h="14px" bg={barBg} rounded="sm" shadow="xs" />
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={isDark ? "gray.200" : "gray.700"}
          >
            Durasi Aktivitas
          </Text>
        </HStack>
      </Flex>

      {/* ── 2. Gantt Table Grid (Scrolls inside container, never page overflow) ── */}
      <Box
        w="100%"
        maxW="100%"
        minW="0"
        overflowX="auto"
        border="1px solid"
        borderColor={gridBorderColor}
        rounded={radiusStyle}
        shadow="md"
        bg={isDark ? "gray.850" : "white"}
        sx={{
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: isDark ? "gray.800" : "gray.100",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: isDark ? "gray.600" : "gray.300",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: isDark ? "gray.500" : "gray.400",
          },
        }}
      >
        <Table
          variant="unstyled"
          size="sm"
          style={{
            tableLayout: "fixed",
            width: `${totalTableWidth}px`,
            minWidth: `${totalTableWidth}px`,
            borderCollapse: "collapse",
          }}
        >
          <Thead>
            {/* ── Header Tier 1: Fixed Columns (Rowspan 2) + Month Groups (Colspan 4) ── */}
            {/* ── Header Tier 1: Fixed Columns (Rowspan 2) + Month Groups (Colspan 4) ── */}
            <Tr color="white">
              <Th
                rowSpan={2}
                bg={headerBgPrimary}
                color="white"
                textAlign="center"
                verticalAlign="middle"
                w={`${NO_COL_WIDTH}px`}
                minW={`${NO_COL_WIDTH}px`}
                maxW={`${NO_COL_WIDTH}px`}
                py={2}
                px={2}
                fontSize="xs"
                fontWeight="bold"
                borderRight="1px solid rgba(255, 255, 255, 0.2)"
                borderBottom="1px solid rgba(255, 255, 255, 0.2)"
              >
                <Flex align="center" justify="center" minH="46px">
                  No.
                </Flex>
              </Th>
              <Th
                rowSpan={2}
                bg={headerBgPrimary}
                color="white"
                textAlign="center"
                verticalAlign="middle"
                w={`${AKTIVITAS_COL_WIDTH}px`}
                minW={`${AKTIVITAS_COL_WIDTH}px`}
                maxW={`${AKTIVITAS_COL_WIDTH}px`}
                py={2}
                px={3}
                fontSize="xs"
                fontWeight="bold"
                borderRight="1px solid rgba(255, 255, 255, 0.2)"
                borderBottom="1px solid rgba(255, 255, 255, 0.2)"
              >
                <Flex align="center" justify="center" minH="46px">
                  Aktivitas
                </Flex>
              </Th>
              <Th
                rowSpan={2}
                bg={headerBgPrimary}
                color="white"
                textAlign="center"
                verticalAlign="middle"
                w={`${PIHAK_COL_WIDTH}px`}
                minW={`${PIHAK_COL_WIDTH}px`}
                maxW={`${PIHAK_COL_WIDTH}px`}
                py={2}
                px={3}
                fontSize="xs"
                fontWeight="bold"
                borderRight="1px solid rgba(255, 255, 255, 0.2)"
                borderBottom="1px solid rgba(255, 255, 255, 0.2)"
              >
                <Flex align="center" justify="center" minH="46px">
                  Pihak Terlibat
                </Flex>
              </Th>
              <Th
                rowSpan={2}
                bg={headerBgPrimary}
                color="white"
                textAlign="center"
                verticalAlign="middle"
                w={`${DURASI_COL_WIDTH}px`}
                minW={`${DURASI_COL_WIDTH}px`}
                maxW={`${DURASI_COL_WIDTH}px`}
                py={2}
                px={2}
                fontSize="xs"
                fontWeight="bold"
                borderRight="1px solid rgba(255, 255, 255, 0.2)"
                borderBottom="1px solid rgba(255, 255, 255, 0.2)"
              >
                <VStack spacing={0} justify="center" align="center" minH="46px">
                  <Text fontSize="xs" fontWeight="bold" color="white">
                    Durasi
                  </Text>
                  <Text fontSize="2xs" fontWeight="normal" color="whiteAlpha.800">
                    (Hari)
                  </Text>
                </VStack>
              </Th>

              {/* Month Group Headers (Colspan 4, fixed 4 * 64px width) */}
              {monthGroups.map((mg) => {
                const monthWidth = mg.weeks.length * WEEK_COL_WIDTH;
                return (
                  <Th
                    key={mg.monthKey}
                    colSpan={mg.weeks.length}
                    w={`${monthWidth}px`}
                    minW={`${monthWidth}px`}
                    maxW={`${monthWidth}px`}
                    color="white"
                    textAlign="center"
                    py={2.5}
                    px={2}
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wider"
                    bg={headerBgSecondary}
                    borderRight="1px solid rgba(255, 255, 255, 0.2)"
                    borderBottom="1px solid rgba(255, 255, 255, 0.2)"
                  >
                    Bulan {mg.displayNumber}
                    <Text
                      as="span"
                      fontSize="2xs"
                      fontWeight="normal"
                      opacity={0.85}
                      ml={1.5}
                    >
                      ({mg.monthLabel})
                    </Text>
                  </Th>
                );
              })}
            </Tr>

            {/* ── Header Tier 2: Standard uniform Week columns M1, M2, M3, M4 (M = Minggu) ── */}
            <Tr color="white">
              {monthGroups.map((mg) =>
                mg.weeks.map((w) => (
                  <Th
                    key={`${mg.monthKey}-w${w.week}`}
                    bg={headerBgSub}
                    color="white"
                    textAlign="center"
                    w={`${WEEK_COL_WIDTH}px`}
                    minW={`${WEEK_COL_WIDTH}px`}
                    maxW={`${WEEK_COL_WIDTH}px`}
                    py={1.5}
                    px={1}
                    fontSize="xs"
                    fontWeight="bold"
                    borderRight="1px solid rgba(255, 255, 255, 0.2)"
                    borderBottom="1px solid rgba(255, 255, 255, 0.2)"
                    title={`Minggu ${w.week} (${mg.monthLabel})`}
                  >
                    M{w.week}
                  </Th>
                ))
              )}
            </Tr>
          </Thead>

          {/* ── Body: Stages + Aligned Activity Timeline Bars ── */}
          <Tbody>
            {sortedStages.map((stage, idx) => {
              const duration =
                stage.durationDays ??
                computeDuration(stage.startDate, stage.endDate) ??
                1;

              const startBucketIdx = indexOfDate(stage.startDate);
              const endBucketIdx = indexOfDate(stage.endDate);

              const startCol = Math.max(0, startBucketIdx >= 0 ? startBucketIdx : 0);
              const endCol = Math.max(
                startCol,
                endBucketIdx >= 0 ? endBucketIdx : startCol
              );

              // 1-indexed for CSS grid placement
              const gridColStart = startCol + 1;
              const gridColEnd = endCol + 2;

              const isEven = idx % 2 === 1;
              const rowBg = isEven ? rowAltBg : "transparent";

              return (
                <Tr
                  key={stage.id || `stg_row_${idx}`}
                  bg={rowBg}
                  _hover={{ bg: isDark ? "whiteAlpha.100" : "blue.50" }}
                  transition="background 0.15s ease"
                  borderBottom="1px solid"
                  borderColor={gridBorderColor}
                >
                  {/* 1. No */}
                  <Td
                    w={`${NO_COL_WIDTH}px`}
                    minW={`${NO_COL_WIDTH}px`}
                    maxW={`${NO_COL_WIDTH}px`}
                    textAlign="center"
                    fontWeight="bold"
                    fontSize="xs"
                    color={isDark ? "gray.300" : "gray.700"}
                    py={2.5}
                    px={2}
                    borderRight="1px solid"
                    borderColor={gridBorderColor}
                  >
                    {idx + 1}
                  </Td>

                  {/* 2. Aktivitas (Stage Name) */}
                  <Td
                    w={`${AKTIVITAS_COL_WIDTH}px`}
                    minW={`${AKTIVITAS_COL_WIDTH}px`}
                    maxW={`${AKTIVITAS_COL_WIDTH}px`}
                    fontWeight="600"
                    fontSize="xs"
                    color={isDark ? "gray.100" : "gray.800"}
                    py={2.5}
                    px={3}
                    borderRight="1px solid"
                    borderColor={gridBorderColor}
                  >
                    <VStack align="start" spacing={0.5}>
                      <Text lineHeight="short">{stage.stageName}</Text>
                      {stage.backlogName && (
                        <Badge
                          colorScheme="teal"
                          variant="subtle"
                          fontSize="3xs"
                          rounded="sm"
                          px={1.5}
                        >
                          {stage.backlogName}
                        </Badge>
                      )}
                    </VStack>
                  </Td>

                  {/* 3. Pihak Terlibat / Anggota */}
                  <Td
                    w={`${PIHAK_COL_WIDTH}px`}
                    minW={`${PIHAK_COL_WIDTH}px`}
                    maxW={`${PIHAK_COL_WIDTH}px`}
                    fontSize="xs"
                    color={isDark ? "gray.300" : "gray.600"}
                    py={2}
                    px={3}
                    borderRight="1px solid"
                    borderColor={gridBorderColor}
                  >
                    <VStack align="start" spacing={1}>
                      <Text noOfLines={1} lineHeight="short">
                        {stage.parties.map((p) => p.name).join(", ") || "—"}
                      </Text>
                      {stage.members && stage.members.length > 0 && (
                        stage.members.length > 1 ? (
                          <AvatarGroup size="2xs" max={4} spacing="-1.5">
                            {stage.members.map((m) => (
                              <Tooltip
                                key={m.id}
                                label={`${m.name}${m.role ? ` (${m.role})` : ""}`}
                                hasArrow
                                placement="top"
                              >
                                <Avatar
                                  size="2xs"
                                  boxSize="18px"
                                  fontSize="8px"
                                  name={m.name}
                                  src={m.profilePict || undefined}
                                />
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                        ) : (
                          <HStack spacing={1}>
                            <Tooltip
                              label={`${stage.members[0].name}${stage.members[0].role ? ` (${stage.members[0].role})` : ""}`}
                              hasArrow
                              placement="top"
                            >
                              <Avatar
                                size="2xs"
                                boxSize="18px"
                                fontSize="8px"
                                name={stage.members[0].name}
                                src={stage.members[0].profilePict || undefined}
                              />
                            </Tooltip>
                            <Text fontSize="3xs" color="gray.500" noOfLines={1} maxW="90px">
                              {stage.members[0].name}
                            </Text>
                          </HStack>
                        )
                      )}
                    </VStack>
                  </Td>

                  {/* 4. Durasi (Hari) */}
                  <Td
                    w={`${DURASI_COL_WIDTH}px`}
                    minW={`${DURASI_COL_WIDTH}px`}
                    maxW={`${DURASI_COL_WIDTH}px`}
                    textAlign="center"
                    py={2}
                    px={2}
                    borderRight="1px solid"
                    borderColor={gridBorderColor}
                  >
                    <VStack spacing={0} align="center">
                      <Text fontWeight="bold" fontSize="xs" color={isDark ? "gray.200" : "gray.700"}>
                        {duration}
                      </Text>
                      {stage.extendedDays && stage.extendedDays > 0 ? (
                        <Badge colorScheme="orange" fontSize="4xs" rounded="xs" px={1}>
                          +{stage.extendedDays} ext
                        </Badge>
                      ) : null}
                    </VStack>
                  </Td>

                  {/* 5. Standard Week Columns (M1..M4) & Spanning Activity Bar */}
                  <Td
                    colSpan={totalWeeks}
                    w={`${totalWeeksWidth}px`}
                    minW={`${totalWeeksWidth}px`}
                    maxW={`${totalWeeksWidth}px`}
                    p={0}
                    position="relative"
                    borderRight="none"
                  >
                    <Box
                      display="grid"
                      gridTemplateColumns={`repeat(${totalWeeks}, ${WEEK_COL_WIDTH}px)`}
                      w={`${totalWeeksWidth}px`}
                      minW={`${totalWeeksWidth}px`}
                      h="100%"
                      minH="44px"
                      position="relative"
                    >
                      {/* Vertical Grid Lines matching 1:1 with M1, M2, M3, M4 headers */}
                      {axis.map((w, colIdx) => (
                        <Box
                          key={`col_bg_${colIdx}`}
                          w={`${WEEK_COL_WIDTH}px`}
                          minW={`${WEEK_COL_WIDTH}px`}
                          maxW={`${WEEK_COL_WIDTH}px`}
                          h="100%"
                          borderRight="1px solid"
                          borderColor={gridBorderColor}
                          gridColumn={`${colIdx + 1} / ${colIdx + 2}`}
                          gridRow="1 / 2"
                        />
                      ))}

                      {/* Continuous Activity Bar spanning across exact start/end week buckets */}
                      <Flex
                        position="relative"
                        gridColumn={`${gridColStart} / ${gridColEnd}`}
                        alignSelf="center"
                        my={1.5}
                        mx={1}
                        h="26px"
                        bg={barBg}
                        rounded="md"
                        align="center"
                        justify="center"
                        px={2}
                        color="white"
                        shadow="xs"
                        zIndex={2}
                        title={`${stage.stageName} (${duration} hari${
                          stage.extendedDays && stage.extendedDays > 0
                            ? ` [Base: ${stage.durationDays}d + Buffer: ${stage.extendedDays}d]`
                            : ""
                        }: ${stage.startDate} → ${stage.endDate})`}
                        _hover={{
                          filter: "brightness(1.08)",
                          transform: "translateY(-1px)",
                          shadow: "sm",
                        }}
                        transition="all 0.15s ease"
                      >
                        <Text
                          fontSize="2xs"
                          fontWeight="bold"
                          whiteSpace="nowrap"
                          letterSpacing="tight"
                        >
                          {duration} hari{stage.extendedDays && stage.extendedDays > 0 ? ` (+${stage.extendedDays}d)` : ""}
                        </Text>
                      </Flex>
                    </Box>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {/* ── 3. Footer: Catatan & Corporate Slogan (Matching Reference Image) ── */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        mt={3}
        px={1}
        gap={2}
        w="100%"
        maxW="100%"
      >
        <Text
          fontStyle="italic"
          fontSize="xs"
          color={isDark ? "gray.400" : "gray.500"}
        >
          Catatan: Timeline ini merupakan contoh simulasi dan dapat disesuaikan dengan kebutuhan proyek.
        </Text>

        <HStack
          spacing={2}
          fontSize="xs"
          fontWeight="bold"
          color={isDark ? "secondary.300" : "secondary.600"}
        >
          <Text>Plan</Text>
          <Text opacity={0.5}>•</Text>
          <Text>Execute</Text>
          <Text opacity={0.5}>•</Text>
          <Text>Deliver</Text>
          <Text opacity={0.5}>•</Text>
          <Text>Together</Text>
          <Box
            w="36px"
            h="2px"
            bg={isDark ? "secondary.300" : "secondary.600"}
            rounded="full"
            ml={1}
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default GanttChart;
