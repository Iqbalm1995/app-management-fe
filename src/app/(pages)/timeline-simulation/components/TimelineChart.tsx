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
  Icon,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiFeather,
  FiFileText,
  FiLayers,
  FiCompass,
  FiSearch,
  FiShield,
  FiTrendingUp,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { SimulationStage } from "../types";
import {
  autoScheduleStages,
  computeDuration,
  parseDate,
} from "../utils/weekBucket";

interface TimelineChartProps {
  stages: SimulationStage[];
  height?: number | string;
}

// 8 Vibrant Infographic Palette cycling (matching reference image image.png)
const CHEVRON_PALETTE = [
  { bg: "#E53E3E", hover: "#C53030", glow: "rgba(229, 62, 62, 0.35)", label: "Coral Red" },
  { bg: "#00A3C4", hover: "#0987A0", glow: "rgba(0, 163, 196, 0.35)", label: "Cyan Blue" },
  { bg: "#DD6B20", hover: "#C05621", glow: "rgba(221, 107, 32, 0.35)", label: "Tangerine" },
  { bg: "#D69E2E", hover: "#B7791F", glow: "rgba(214, 158, 46, 0.35)", label: "Golden Amber" },
  { bg: "#38A169", hover: "#2F855A", glow: "rgba(56, 161, 105, 0.35)", label: "Emerald Green" },
  { bg: "#D53F8C", hover: "#B83280", glow: "rgba(213, 63, 140, 0.35)", label: "Hot Magenta" },
  { bg: "#3182CE", hover: "#2B6CB0", glow: "rgba(49, 130, 206, 0.35)", label: "Royal Blue" },
  { bg: "#805AD5", hover: "#6B46C1", glow: "rgba(128, 90, 213, 0.35)", label: "Violet Purple" },
];

/** Select an intuitive icon based on stage name keywords */
const getStageIcon = (name: string, index: number) => {
  const lower = name.toLowerCase();
  if (
    lower.includes("draft") ||
    lower.includes("layout") ||
    lower.includes("concept") ||
    lower.includes("plan") ||
    lower.includes("ide")
  ) {
    return FiCompass;
  }
  if (
    lower.includes("design") ||
    lower.includes("ui") ||
    lower.includes("ux") ||
    lower.includes("mockup")
  ) {
    return FiFeather;
  }
  if (
    lower.includes("pks") ||
    lower.includes("legal") ||
    lower.includes("contract") ||
    lower.includes("doc")
  ) {
    return FiFileText;
  }
  if (
    lower.includes("dev") ||
    lower.includes("android") ||
    lower.includes("ios") ||
    lower.includes("code") ||
    lower.includes("frontend") ||
    lower.includes("backend")
  ) {
    return FiCode;
  }
  if (
    lower.includes("test") ||
    lower.includes("qa") ||
    lower.includes("sit") ||
    lower.includes("review")
  ) {
    return FiSearch;
  }
  if (
    lower.includes("uat") ||
    lower.includes("user") ||
    lower.includes("approval") ||
    lower.includes("sign")
  ) {
    return FiShield;
  }
  if (
    lower.includes("deploy") ||
    lower.includes("playstore") ||
    lower.includes("release") ||
    lower.includes("production") ||
    lower.includes("launch")
  ) {
    return FiUploadCloud;
  }
  if (
    lower.includes("perbaikan") ||
    lower.includes("fix") ||
    lower.includes("bug") ||
    lower.includes("optim")
  ) {
    return FiTrendingUp;
  }
  const fallbacks = [
    FiCompass,
    FiSearch,
    FiCode,
    FiCheckCircle,
    FiUploadCloud,
    FiTrendingUp,
    FiLayers,
    FiUsers,
  ];
  return fallbacks[index % fallbacks.length];
};

const STAGE_COL_WIDTH = 250; // px per stage column in the horizontal ribbon

/**
 * Horizontal Chevron Roadmap / Milestone Infographic Timeline matching reference image (image.png):
 * - Continuous central interlocking chevron ribbon (Stage 1 > Stage 2 > Stage 3...)
 * - Alternating Top (odd) and Bottom (even) milestone nodes with circular icon badges
 * - Vertical dashed connector lines
 * - Rich stage detail cards (Stage name, duration, date range, parties, backlog)
 * - Container-scoped horizontal scrolling without page overflow
 */
const TimelineChart = ({ stages }: TimelineChartProps) => {
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
    () => [...effectiveStages].sort((a, b) => a.order - b.order),
    [effectiveStages]
  );

  const totalDuration = useMemo(
    () =>
      sortedStages.reduce(
        (acc, s) =>
          acc +
          (s.durationDays ?? computeDuration(s.startDate, s.endDate) ?? 1),
        0
      ),
    [sortedStages]
  );

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
          <FiActivity size={28} />
        </Box>
        <Text fontWeight="bold" fontSize="md">
          No timeline stages available
        </Text>
        <Text fontSize="xs" color="gray.500" maxW="380px">
          Add or claim stages above to render the sequential milestone roadmap.
        </Text>
      </VStack>
    );
  }

  const ribbonTotalWidth = Math.max(
    sortedStages.length * STAGE_COL_WIDTH + 40,
    600
  );

  return (
    <Box w="100%" maxW="100%" minW="0" py={2}>
      {/* ── 1. Top Section: Header & Milestone Metrics ── */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "flex-end" }}
        mb={5}
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
            PROJECT MILESTONE TIMELINE
          </Heading>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color={isDark ? "gray.400" : "gray.600"}
          >
            Sequential Stage Progression & Milestones
          </Text>
        </VStack>

        <HStack spacing={2.5}>
          <Badge
            variant="subtle"
            colorScheme="blue"
            px={3}
            py={1}
            rounded="full"
            fontSize="xs"
            fontWeight="bold"
          >
            {sortedStages.length} Milestones
          </Badge>
          <Badge
            variant="subtle"
            colorScheme="purple"
            px={3}
            py={1}
            rounded="full"
            fontSize="xs"
            fontWeight="bold"
          >
            Total: {totalDuration} hari
          </Badge>
        </HStack>
      </Flex>

      {/* ── 2. Main Infographic Canvas (Scrollable strictly inside container) ── */}
      <Box
        w="100%"
        maxW="100%"
        minW="0"
        overflowX="auto"
        border="1px solid"
        borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
        rounded={radiusStyle}
        shadow="md"
        bg={isDark ? "gray.900" : "#F7FAFC"}
        p={{ base: 4, md: 6 }}
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
        <Box w={`${ribbonTotalWidth}px`} minW={`${ribbonTotalWidth}px`}>
          {/* ── A. Top Milestone Cards (Odd Stages: Index 0, 2, 4...) ── */}
          <Flex w="100%" justify="flex-start" align="flex-end" mb={1}>
            {sortedStages.map((stage, idx) => {
              const isTop = idx % 2 === 0;
              const palette = CHEVRON_PALETTE[idx % CHEVRON_PALETTE.length];
              const StageIcon = getStageIcon(stage.stageName, idx);
              const duration =
                stage.durationDays ??
                computeDuration(stage.startDate, stage.endDate) ??
                1;

              return (
                <Box
                  key={`top_col_${stage.id}`}
                  w={`${STAGE_COL_WIDTH}px`}
                  minW={`${STAGE_COL_WIDTH}px`}
                  px={2}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="flex-end"
                  minH="180px"
                >
                  {isTop ? (
                    <VStack spacing={2} align="center" w="100%">
                      {/* Circular Icon Badge */}
                      <Flex
                        w="46px"
                        h="46px"
                        rounded="full"
                        bg={palette.bg}
                        color="white"
                        align="center"
                        justify="center"
                        shadow="lg"
                        boxShadow={`0 6px 14px ${palette.glow}`}
                        _hover={{ transform: "scale(1.08)" }}
                        transition="transform 0.2s ease"
                      >
                        <Icon as={StageIcon} boxSize={5} />
                      </Flex>

                      {/* Top Detail Card */}
                      <Box
                        w="100%"
                        bg={isDark ? "gray.800" : "white"}
                        border="1px solid"
                        borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                        borderTop="3px solid"
                        borderTopColor={palette.bg}
                        rounded="xl"
                        p={3}
                        shadow="sm"
                        _hover={{
                          shadow: "md",
                          transform: "translateY(-2px)",
                        }}
                        transition="all 0.2s ease"
                      >
                        <HStack justify="space-between" align="start" mb={1}>
                          <Text
                            fontSize="xs"
                            fontWeight="800"
                            lineHeight="short"
                            noOfLines={2}
                            color={isDark ? "white" : "gray.800"}
                          >
                            {stage.stageName}
                          </Text>
                          <Badge
                            bg={palette.bg}
                            color="white"
                            fontSize="3xs"
                            fontWeight="bold"
                            rounded="full"
                            px={2}
                            py={0.5}
                            flexShrink={0}
                          >
                            {duration} hari
                          </Badge>
                        </HStack>

                        <HStack
                          spacing={1}
                          fontSize="3xs"
                          color={isDark ? "gray.400" : "gray.500"}
                          mb={1.5}
                        >
                          <Icon as={FiCalendar} boxSize={3} />
                          <Text fontFamily="mono">
                            {stage.startDate ?? "—"} → {stage.endDate ?? "—"}
                          </Text>
                        </HStack>

                        {stage.parties.length > 0 && (
                          <HStack spacing={1} fontSize="3xs" color="gray.500">
                            <Icon as={FiUsers} boxSize={3} />
                            <Text noOfLines={1}>
                              {stage.parties.map((p) => p.name).join(", ")}
                            </Text>
                          </HStack>
                        )}

                        {stage.members && stage.members.length > 0 && (
                          <HStack spacing={1.5} mt={1.5} justify="space-between" w="100%">
                            {stage.members.length > 1 ? (
                              <AvatarGroup size="2xs" max={4} spacing="-1.5">
                                {stage.members.map((m) => (
                                  <Tooltip
                                    key={m.id}
                                    label={`${m.name}${m.role ? ` (${m.role})` : ""}${
                                      m.activeProjectCount && m.activeProjectCount >= 2
                                        ? ` • ${m.activeProjectCount} Projects`
                                        : ""
                                    }`}
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
                              <HStack spacing={1} minW="0">
                                <Tooltip
                                  label={`${stage.members[0].name}${stage.members[0].role ? ` (${stage.members[0].role})` : ""}${
                                    stage.members[0].activeProjectCount && stage.members[0].activeProjectCount >= 2
                                      ? ` • ${stage.members[0].activeProjectCount} Projects`
                                      : ""
                                  }`}
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
                                <Text fontSize="3xs" color={isDark ? "gray.300" : "gray.600"} noOfLines={1} maxW="70px">
                                  {stage.members[0].name}
                                </Text>
                              </HStack>
                            )}
                            {stage.extendedDays && stage.extendedDays > 0 ? (
                              <Badge colorScheme="orange" fontSize="4xs" rounded="xs" px={1}>
                                +{stage.extendedDays}d buffer
                              </Badge>
                            ) : null}
                          </HStack>
                        )}

                        {stage.backlogName && (
                          <Badge
                            colorScheme="teal"
                            variant="subtle"
                            fontSize="3xs"
                            rounded="sm"
                            px={1.5}
                            mt={1.5}
                            noOfLines={1}
                          >
                            {stage.backlogName}
                          </Badge>
                        )}
                      </Box>

                      {/* Vertical Dashed Connector Line to Chevron */}
                      <Box
                        w="2px"
                        h="20px"
                        borderLeft="2px dashed"
                        borderColor={palette.bg}
                      />
                    </VStack>
                  ) : (
                    // Spacer for rhythm
                    <Box h="180px" w="100%" />
                  )}
                </Box>
              );
            })}
          </Flex>

          {/* ── B. Central Chevron Ribbon (Interlocking process arrows) ── */}
          <Flex
            w="100%"
            h="52px"
            align="center"
            position="relative"
            zIndex={2}
            my={1}
          >
            {sortedStages.map((stage, idx) => {
              const palette = CHEVRON_PALETTE[idx % CHEVRON_PALETTE.length];
              const isFirst = idx === 0;

              // Authentic interlocking chevron polygon clip path
              const clipPath = isFirst
                ? "polygon(0% 0%, calc(100% - 22px) 0%, 100% 50%, calc(100% - 22px) 100%, 0% 100%)"
                : "polygon(0% 0%, calc(100% - 22px) 0%, 100% 50%, calc(100% - 22px) 100%, 0% 100%, 22px 50%)";

              return (
                <Box
                  key={`chevron_${stage.id}`}
                  w={`${STAGE_COL_WIDTH + 20}px`}
                  minW={`${STAGE_COL_WIDTH + 20}px`}
                  h="48px"
                  bg={palette.bg}
                  color="white"
                  style={{ clipPath }}
                  ml={isFirst ? 0 : "-20px"}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  pl={isFirst ? "14px" : "32px"}
                  pr="28px"
                  shadow="md"
                  _hover={{
                    filter: "brightness(1.1)",
                    transform: "scale(1.02)",
                    zIndex: 5,
                  }}
                  transition="all 0.15s ease"
                  cursor="default"
                  title={`${stage.stageName} — ${stage.startDate} to ${stage.endDate}`}
                >
                  <HStack spacing={2} justify="center">
                    <Text
                      fontSize="sm"
                      fontWeight="900"
                      letterSpacing="wider"
                      whiteSpace="nowrap"
                      textTransform="uppercase"
                    >
                      STAGE {stage.order + 1}
                    </Text>
                  </HStack>
                </Box>
              );
            })}
          </Flex>

          {/* ── C. Bottom Milestone Cards (Even Stages: Index 1, 3, 5...) ── */}
          <Flex w="100%" justify="flex-start" align="flex-start" mt={1}>
            {sortedStages.map((stage, idx) => {
              const isBottom = idx % 2 === 1;
              const palette = CHEVRON_PALETTE[idx % CHEVRON_PALETTE.length];
              const StageIcon = getStageIcon(stage.stageName, idx);
              const duration =
                stage.durationDays ??
                computeDuration(stage.startDate, stage.endDate) ??
                1;

              return (
                <Box
                  key={`bottom_col_${stage.id}`}
                  w={`${STAGE_COL_WIDTH}px`}
                  minW={`${STAGE_COL_WIDTH}px`}
                  px={2}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="flex-start"
                  minH="180px"
                >
                  {isBottom ? (
                    <VStack spacing={2} align="center" w="100%">
                      {/* Vertical Dashed Connector Line from Chevron */}
                      <Box
                        w="2px"
                        h="20px"
                        borderLeft="2px dashed"
                        borderColor={palette.bg}
                      />

                      {/* Bottom Detail Card */}
                      <Box
                        w="100%"
                        bg={isDark ? "gray.800" : "white"}
                        border="1px solid"
                        borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                        borderTop="3px solid"
                        borderTopColor={palette.bg}
                        rounded="xl"
                        p={3}
                        shadow="sm"
                        _hover={{
                          shadow: "md",
                          transform: "translateY(2px)",
                        }}
                        transition="all 0.2s ease"
                      >
                        <HStack justify="space-between" align="start" mb={1}>
                          <Text
                            fontSize="xs"
                            fontWeight="800"
                            lineHeight="short"
                            noOfLines={2}
                            color={isDark ? "white" : "gray.800"}
                          >
                            {stage.stageName}
                          </Text>
                          <Badge
                            bg={palette.bg}
                            color="white"
                            fontSize="3xs"
                            fontWeight="bold"
                            rounded="full"
                            px={2}
                            py={0.5}
                            flexShrink={0}
                          >
                            {duration} hari
                          </Badge>
                        </HStack>

                        <HStack
                          spacing={1}
                          fontSize="3xs"
                          color={isDark ? "gray.400" : "gray.500"}
                          mb={1.5}
                        >
                          <Icon as={FiCalendar} boxSize={3} />
                          <Text fontFamily="mono">
                            {stage.startDate ?? "—"} → {stage.endDate ?? "—"}
                          </Text>
                        </HStack>

                        {stage.parties.length > 0 && (
                          <HStack spacing={1} fontSize="3xs" color="gray.500">
                            <Icon as={FiUsers} boxSize={3} />
                            <Text noOfLines={1}>
                              {stage.parties.map((p) => p.name).join(", ")}
                            </Text>
                          </HStack>
                        )}

                        {stage.members && stage.members.length > 0 && (
                          <HStack spacing={1.5} mt={1.5} justify="space-between" w="100%">
                            {stage.members.length > 1 ? (
                              <AvatarGroup size="2xs" max={4} spacing="-1.5">
                                {stage.members.map((m) => (
                                  <Tooltip
                                    key={m.id}
                                    label={`${m.name}${m.role ? ` (${m.role})` : ""}${
                                      m.activeProjectCount && m.activeProjectCount >= 2
                                        ? ` • ${m.activeProjectCount} Projects`
                                        : ""
                                    }`}
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
                              <HStack spacing={1} minW="0">
                                <Tooltip
                                  label={`${stage.members[0].name}${stage.members[0].role ? ` (${stage.members[0].role})` : ""}${
                                    stage.members[0].activeProjectCount && stage.members[0].activeProjectCount >= 2
                                      ? ` • ${stage.members[0].activeProjectCount} Projects`
                                      : ""
                                  }`}
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
                                <Text fontSize="3xs" color={isDark ? "gray.300" : "gray.600"} noOfLines={1} maxW="70px">
                                  {stage.members[0].name}
                                </Text>
                              </HStack>
                            )}
                            {stage.extendedDays && stage.extendedDays > 0 ? (
                              <Badge colorScheme="orange" fontSize="4xs" rounded="xs" px={1}>
                                +{stage.extendedDays}d buffer
                              </Badge>
                            ) : null}
                          </HStack>
                        )}

                        {stage.backlogName && (
                          <Badge
                            colorScheme="teal"
                            variant="subtle"
                            fontSize="3xs"
                            rounded="sm"
                            px={1.5}
                            mt={1.5}
                            noOfLines={1}
                          >
                            {stage.backlogName}
                          </Badge>
                        )}
                      </Box>

                      {/* Circular Icon Badge */}
                      <Flex
                        w="46px"
                        h="46px"
                        rounded="full"
                        bg={palette.bg}
                        color="white"
                        align="center"
                        justify="center"
                        shadow="lg"
                        boxShadow={`0 6px 14px ${palette.glow}`}
                        _hover={{ transform: "scale(1.08)" }}
                        transition="transform 0.2s ease"
                      >
                        <Icon as={StageIcon} boxSize={5} />
                      </Flex>
                    </VStack>
                  ) : (
                    // Spacer for rhythm
                    <Box h="180px" w="100%" />
                  )}
                </Box>
              );
            })}
          </Flex>
        </Box>
      </Box>

      {/* ── 3. Footer: Slogan & Catatan ── */}
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
          Catatan: Timeline roadmap ini menggambarkan alur sekuensial tahapan proyek secara visual.
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

export default TimelineChart;
