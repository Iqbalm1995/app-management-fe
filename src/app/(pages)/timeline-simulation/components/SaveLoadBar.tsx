"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { FiSave, FiFolder, FiChevronDown } from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";
import useTimelineSimulation from "@/app/services/useTimelineSimulation";
import {
  TimelineSimulation,
  TimelineSimulationListItem,
  TimelineSimulationSavePayload,
} from "../types";

interface SaveLoadBarProps {
  token: string;
  simulationName: string;
  onNameChange: (name: string) => void;
  buildPayload: (name: string) => TimelineSimulationSavePayload;
  onLoaded: (simulation: TimelineSimulation) => void;
  onSaved: (saved: TimelineSimulation) => void;
}

/**
 * Naming + save + load(list) controls, wired to the timeline simulation API.
 */
const SaveLoadBar = ({
  token,
  simulationName,
  onNameChange,
  buildPayload,
  onLoaded,
  onSaved,
}: SaveLoadBarProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { Save, GetById, List } = useTimelineSimulation();

  const [isSaving, setIsSaving] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [isLoadingOne, setIsLoadingOne] = useState(false);
  const [saved, setSaved] = useState<TimelineSimulationListItem[]>([]);

  const refreshList = useCallback(async () => {
    if (!token) return;
    setIsListing(true);
    try {
      const res = await List(
        {
          search: "",
          limit: 50,
          page: 1,
          filterWhere: [],
          fieldOrder: [],
          orderDir: "desc",
        },
        token
      );
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setSaved(res.data);
      }
    } finally {
      setIsListing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const handleSave = useCallback(async () => {
    const name = simulationName.trim();
    if (!name) {
      showToast({
        description: "Give the simulation a name before saving.",
        statusToast: "warning",
      });
      return;
    }
    setIsSaving(true);
    try {
      const res = await Save(buildPayload(name), token);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        showToast({ description: "Simulation saved.", statusToast: "success" });
        onSaved(res.data);
        refreshList();
      } else {
        showToast({
          description: res?.message || "Failed to save simulation.",
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "An unexpected error occurred while saving.",
        statusToast: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [simulationName, buildPayload, token, Save, onSaved, refreshList, showToast]);

  const handleLoad = useCallback(
    async (id: string) => {
      setIsLoadingOne(true);
      try {
        const res = await GetById(id, token);
        if (res?.statusCode === RES_CODE_OK && res.data) {
          onLoaded(res.data);
          showToast({ description: "Simulation loaded.", statusToast: "success" });
        } else {
          showToast({
            description: res?.message || "Failed to load simulation.",
            statusToast: "error",
          });
        }
      } catch {
        showToast({
          description: "An unexpected error occurred while loading.",
          statusToast: "error",
        });
      } finally {
        setIsLoadingOne(false);
      }
    },
    [token, GetById, onLoaded, showToast]
  );

  return (
    <HStack spacing={2.5} flexWrap="wrap">
      <Input
        value={simulationName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Simulation name…"
        size="sm"
        rounded={radiusStyle}
        maxW={{ base: "100%", sm: "240px" }}
        bg={colorMode === "light" ? "white" : "gray.800"}
        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
        focusBorderColor="secondary.500"
        _placeholder={{ color: colorMode === "light" ? "gray.400" : "gray.500" }}
      />
      <Button
        size="sm"
        leftIcon={<FiSave />}
        colorScheme="secondary"
        rounded={radiusStyle}
        px={4}
        onClick={handleSave}
        isLoading={isSaving}
        _hover={{ transform: "translateY(-1px)", shadow: "sm" }}
        transition="all 0.2s ease"
      >
        Save
      </Button>
      <Menu>
        <MenuButton
          as={Button}
          size="sm"
          variant="outline"
          rounded={radiusStyle}
          px={4}
          leftIcon={<FiFolder />}
          rightIcon={<FiChevronDown />}
          isLoading={isLoadingOne}
          borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
          bg={colorMode === "light" ? "white" : "gray.800"}
          _hover={{
            bg: colorMode === "light" ? "gray.50" : "gray.700",
            borderColor: colorMode === "light" ? "gray.400" : "gray.500",
          }}
        >
          Load
        </MenuButton>
        <MenuList
          maxH="320px"
          overflowY="auto"
          rounded="xl"
          shadow="lg"
          border="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
          p={1.5}
        >
          {isListing ? (
            <MenuItem closeOnSelect={false} rounded="lg" fontSize="sm">
              <Spinner size="xs" mr={2} /> Loading simulations…
            </MenuItem>
          ) : saved.length === 0 ? (
            <MenuItem isDisabled rounded="lg" fontSize="sm">
              <Text color="gray.500">No saved simulations</Text>
            </MenuItem>
          ) : (
            saved.map((s) => (
              <MenuItem
                key={s.id}
                onClick={() => handleLoad(s.id)}
                rounded="lg"
                py={2}
                _hover={{
                  bg: colorMode === "light" ? "blue.50" : "gray.700",
                }}
              >
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" fontWeight="medium">
                    {s.simulationName}
                  </Text>
                  <Badge
                    fontSize="2xs"
                    colorScheme="blue"
                    variant="subtle"
                    rounded="full"
                    px={2}
                  >
                    {s.stageCount} stage{s.stageCount === 1 ? "" : "s"}
                  </Badge>
                </HStack>
              </MenuItem>
            ))
          )}
        </MenuList>
      </Menu>
    </HStack>
  );
};

export default SaveLoadBar;
