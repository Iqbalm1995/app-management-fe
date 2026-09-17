"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FiEdit2, FiLayers, FiPlus, FiTrash2, FiZap } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { SimulationStage } from "../types";

interface StageInputTableProps {
  stages: SimulationStage[];
  onAdd: () => void;
  onEdit: (stage: SimulationStage) => void;
  onRemove: (id: string) => void;
  onReorder?: (stages: SimulationStage[]) => void;
  onSimulate?: () => void;
  isSimulating?: boolean;
}

const StageInputTable = ({
  stages,
  onAdd,
  onEdit,
  onRemove,
  onReorder,
  onSimulate,
  isSimulating = false,
}: StageInputTableProps) => {
  const { colorMode } = useColorMode();
  const border = colorMode === "light" ? "gray.200" : "gray.700";

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...stages];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    const reindexed = updated.map((s, i) => ({ ...s, order: i }));
    if (onReorder) {
      onReorder(reindexed);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Box>
      <HStack justify="space-between" mb={3}>
        <HStack spacing={2}>
          <Text
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wider"
            color={colorMode === "light" ? "gray.600" : "gray.400"}
          >
            Stages
          </Text>
          <Badge
            colorScheme="blue"
            variant="subtle"
            rounded="full"
            px={2}
            fontSize="2xs"
          >
            {stages.length}
          </Badge>
        </HStack>
        <HStack spacing={2}>
          {onSimulate && (
            <Button
              size="sm"
              leftIcon={<FiZap />}
              colorScheme="secondary"
              rounded={radiusStyle}
              px={3.5}
              onClick={onSimulate}
              isLoading={isSimulating}
              isDisabled={stages.length === 0}
              _hover={{ transform: "translateY(-1px)", shadow: "sm" }}
              transition="all 0.2s ease"
            >
              Simulate Timeline
            </Button>
          )}
          <Button
            size="sm"
            leftIcon={<FiPlus />}
            variant={onSimulate ? "outline" : "solid"}
            colorScheme={onSimulate ? "gray" : "secondary"}
            borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
            rounded={radiusStyle}
            px={4}
            onClick={onAdd}
            _hover={{ transform: "translateY(-1px)", shadow: "sm" }}
            transition="all 0.2s ease"
          >
            Add Stage
          </Button>
        </HStack>
      </HStack>

      {stages.length === 0 ? (
        <VStack
          p={10}
          spacing={3}
          border="2px dashed"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "gray.50" : "whiteAlpha.50"}
          rounded="xl"
          textAlign="center"
        >
          <Box
            p={3}
            bg={colorMode === "light" ? "blue.50" : "blue.900"}
            color="blue.500"
            rounded="full"
          >
            <FiLayers size={24} />
          </Box>
          <Text fontWeight="semibold" fontSize="sm">
            No stages added yet
          </Text>
          <Text fontSize="xs" color="gray.500" maxW="380px">
            Claim stages from an assigned project above, apply a standard template, or click &ldquo;Add Stage&rdquo; to build your timeline.
          </Text>
        </VStack>
      ) : (
        <TableContainer
          border="1px solid"
          borderColor={border}
          rounded="xl"
          overflowX="auto"
          overflowY="hidden"
          maxW="100%"
          w="100%"
          sx={{
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: colorMode === "light" ? "#f1f5f9" : "#1e293b",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: colorMode === "light" ? "#cbd5e1" : "#475569",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: colorMode === "light" ? "#94a3b8" : "#64748b",
            },
          }}
        >
          <Table size="sm" variant="simple" minW="950px">
            <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
              <Tr>
                <Th w="64px" fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">
                  Order
                </Th>
                <Th fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">Stage</Th>
                <Th fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">Members</Th>
                <Th fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">Parties</Th>
                <Th fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">Start Date</Th>
                <Th fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">End Date</Th>
                <Th isNumeric fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">Days</Th>
                <Th fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">Backlog</Th>
                <Th textAlign="right" fontSize="2xs" textTransform="uppercase" whiteSpace="nowrap">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stages.map((s, idx) => (
                <Tr
                  key={s.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIndex(idx);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", idx.toString());
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverIndex !== idx) setDragOverIndex(idx);
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === idx) setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(idx);
                  }}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  opacity={draggedIndex === idx ? 0.35 : 1}
                  borderTop={
                    dragOverIndex === idx && draggedIndex !== idx
                      ? "2px solid var(--chakra-colors-blue-500)"
                      : undefined
                  }
                  bg={
                    dragOverIndex === idx
                      ? colorMode === "light"
                        ? "blue.50"
                        : "blue.900"
                      : undefined
                  }
                  _hover={{
                    bg: colorMode === "light" ? "blue.50" : "whiteAlpha.50",
                  }}
                  cursor="grab"
                  _active={{ cursor: "grabbing" }}
                  transition="background-color 0.15s ease, opacity 0.15s ease"
                >
                  <Td fontWeight="semibold" color="gray.500" py={2.5}>
                    <HStack spacing={1.5}>
                      <Tooltip label="Drag to reorder sequence" placement="top" hasArrow>
                        <Box color="gray.400" _hover={{ color: "blue.500" }}>
                          <Icon as={MdDragIndicator} boxSize={4} />
                        </Box>
                      </Tooltip>
                      <Badge
                        colorScheme="blue"
                        variant="solid"
                        rounded="md"
                        fontSize="2xs"
                        px={1.5}
                        py={0.5}
                        fontWeight="bold"
                      >
                        {idx + 1}
                      </Badge>
                    </HStack>
                  </Td>
                  <Td fontWeight="semibold">{s.stageName}</Td>
                  {/* Assigned Members Column */}
                  <Td py={2}>
                    {s.members && s.members.length > 0 ? (
                      s.members.length > 1 ? (
                        <HStack spacing={1.5}>
                          <AvatarGroup size="2xs" max={4} spacing="-1.5">
                            {s.members.map((m) => (
                              <Tooltip
                                key={m.id}
                                label={`${m.name}${m.role ? ` (${m.role})` : ""}${
                                  m.activeProjectCount && m.activeProjectCount >= 2
                                    ? ` • ${m.activeProjectCount} Projects`
                                    : ""
                                }`}
                                placement="top"
                                hasArrow
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
                          <Text fontSize="3xs" color="gray.500">
                            ({s.members.length})
                          </Text>
                        </HStack>
                      ) : (
                        <HStack spacing={1.5} maxW="150px">
                          <Tooltip
                            label={`${s.members[0].name}${s.members[0].role ? ` (${s.members[0].role})` : ""}${
                              s.members[0].activeProjectCount && s.members[0].activeProjectCount >= 2
                                ? ` • ${s.members[0].activeProjectCount} Projects`
                                : ""
                            }`}
                            placement="top"
                            hasArrow
                          >
                            <Avatar
                              size="2xs"
                              boxSize="18px"
                              fontSize="8px"
                              name={s.members[0].name}
                              src={s.members[0].profilePict || undefined}
                            />
                          </Tooltip>
                          <Text fontSize="xs" fontWeight="medium" isTruncated>
                            {s.members[0].name}
                          </Text>
                        </HStack>
                      )
                    ) : (
                      <Text color="gray.400" fontSize="xs">
                        —
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {s.parties.length === 0 ? (
                      <Text color="gray.400" fontSize="xs">
                        —
                      </Text>
                    ) : (
                      <Wrap spacing={1}>
                        {s.parties.map((p) => (
                          <WrapItem key={p.id}>
                            <Badge
                              colorScheme="teal"
                              variant="subtle"
                              fontSize="2xs"
                              rounded="full"
                              px={2}
                            >
                              {p.name}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    )}
                  </Td>
                  <Td fontSize="xs" color={s.startDate ? undefined : "gray.400"}>
                    {s.startDate ?? "—"}
                  </Td>
                  <Td fontSize="xs" color={s.endDate ? undefined : "gray.400"}>
                    {s.endDate ?? "—"}
                  </Td>
                  <Td isNumeric>
                    {s.durationDays != null ? (
                      s.extendedDays && s.extendedDays > 0 ? (
                        <Tooltip
                          label={`Durasi dasar: ${s.durationDays} hari + Buffer contention: ${s.extendedDays} hari`}
                          placement="top"
                          hasArrow
                        >
                          <HStack spacing={1} justify="flex-end">
                            <Badge
                              colorScheme="purple"
                              variant="solid"
                              rounded="full"
                              px={2}
                              fontSize="2xs"
                            >
                              {(s.durationDays ?? 0) + (s.extendedDays ?? 0)}d
                            </Badge>
                            <Badge
                              colorScheme="orange"
                              variant="subtle"
                              rounded="full"
                              px={1.5}
                              fontSize="3xs"
                            >
                              +{s.extendedDays}d
                            </Badge>
                          </HStack>
                        </Tooltip>
                      ) : (
                        <Badge
                          colorScheme="purple"
                          variant="subtle"
                          rounded="full"
                          px={2}
                          fontSize="2xs"
                        >
                          {s.durationDays}d
                        </Badge>
                      )
                    ) : (
                      <Text color="gray.400" fontSize="xs">
                        —
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {s.backlogName ? (
                      <Badge
                        colorScheme="blue"
                        variant="outline"
                        rounded="full"
                        fontSize="2xs"
                        px={2}
                      >
                        {s.backlogName}
                      </Badge>
                    ) : (
                      <Text color="gray.400" fontSize="xs">
                        —
                      </Text>
                    )}
                  </Td>
                  <Td textAlign="right">
                    <HStack justify="flex-end" spacing={1}>
                      <Tooltip label="Edit Stage" fontSize="xs" hasArrow rounded="md">
                        <IconButton
                          aria-label="Edit stage"
                          icon={<FiEdit2 />}
                          size="xs"
                          variant="ghost"
                          rounded="full"
                          onClick={() => onEdit(s)}
                        />
                      </Tooltip>
                      <Tooltip label="Remove Stage" fontSize="xs" hasArrow rounded="md">
                        <IconButton
                          aria-label="Remove stage"
                          icon={<FiTrash2 />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          rounded="full"
                          onClick={() => onRemove(s.id)}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StageInputTable;
