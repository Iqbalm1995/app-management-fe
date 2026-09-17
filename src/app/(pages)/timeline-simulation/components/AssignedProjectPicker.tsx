"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  HStack,
  Icon,
  Text,
  useColorMode,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { FiDownload, FiLayers, FiCheckCircle, FiInfo } from "react-icons/fi";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import {
  RES_CODE_OK,
  radiusStyle,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import { ListSearchByParam, PaggingListPayloadCustom } from "@/app/types/masterTypes";
import { ActivityType, SimulationStage } from "../types";
import { STAGE_TEMPLATES } from "../constants/stageTemplates";
import { computeDuration, autoScheduleStages } from "../utils/weekBucket";

interface ProjectOption {
  value: string;
  label: string;
}

interface AssignedProjectPickerProps {
  token: string;
  userId: string;
  activityType: ActivityType;
  onClaim: (stages: SimulationStage[], projectId: string | null) => void;
}

const genId = (): string =>
  `stg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Loads projects assigned to the current user and, on "Claim Stages", pulls
 * that project's SDLC stages into the simulation. Falls back to the activity
 * template when the project has no stages.
 */
const AssignedProjectPicker = ({
  token,
  userId,
  activityType,
  onClaim,
}: AssignedProjectPickerProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const toast = useToast();
  const { GetAssignedProjects, List, GetProjectSdlcStages } = useProjects();

  const [options, setOptions] = useState<ProjectOption[]>([]);
  const [selected, setSelected] = useState<ProjectOption | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const hasLoadedKeyRef = useRef<string | null>(null);

  // Clear selected project if user switches activity stream
  useEffect(() => {
    setSelected(null);
  }, [activityType]);

  const loadProjects = useCallback(async () => {
    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("tokenData") || ""
        : "");
    if (!activeToken) return;

    const cacheKey = `${activeToken}_${userId}_${activityType}`;
    if (hasLoadedKeyRef.current === cacheKey) return;
    hasLoadedKeyRef.current = cacheKey;

    setIsLoadingProjects(true);
    try {
      // Build filters aligned with /projects-manager?reqType= logic
      const filterWhere: ListSearchByParam[] = [];
      let projectTypeFilter: string | null = null;
      let requirementTypeFilter: string | null = null;

      if (activityType === "INTERNAL DEVELOPMENT") {
        projectTypeFilter = PROJECT_TYPE_INTERNAL_DEVELOPMENT;
        requirementTypeFilter = "BRD";
        filterWhere.push({
          field: "projectType",
          operator: "=",
          value: PROJECT_TYPE_INTERNAL_DEVELOPMENT,
        });
      } else if (activityType === "PROCUREMENT") {
        projectTypeFilter = PROJECT_TYPE_PROCUREMENT;
        filterWhere.push({
          field: "projectType",
          operator: "=",
          value: PROJECT_TYPE_PROCUREMENT,
        });
      } else if (activityType === "RFC") {
        requirementTypeFilter = "RFC";
        filterWhere.push({
          field: "requirementType",
          operator: "=",
          value: "RFC",
        });
      }

      const payload: PaggingListPayloadCustom = {
        search: "",
        limit: 100,
        page: 0,
        projectType: projectTypeFilter,
        requirementType: requirementTypeFilter,
        filterWhere,
        fieldOrder: ["projectName"],
        orderDir: "asc",
      };

      // Strict client-side validator ensuring only projects matching the activity stream are displayed
      const matchesActivity = (p: ProjectDataResponse) => {
        const pType = (p.projectType || "").toUpperCase();
        const rType = (
          p.requirementData?.requirementType ||
          (p as any).requirementType ||
          ""
        ).toUpperCase();
        const cat = (p.projectCategory || "").toUpperCase();

        if (activityType === "INTERNAL DEVELOPMENT") {
          return (
            pType === PROJECT_TYPE_INTERNAL_DEVELOPMENT ||
            pType.includes("INTERNAL") ||
            (rType === "BRD" && !pType.includes("PROCUREMENT"))
          );
        }
        if (activityType === "PROCUREMENT") {
          return (
            pType === PROJECT_TYPE_PROCUREMENT ||
            pType.includes("PROCUREMENT") ||
            cat.includes("PROCUREMENT")
          );
        }
        if (activityType === "RFC") {
          return rType === "RFC" || pType === "RFC" || cat === "RFC";
        }
        return true;
      };

      const res = await GetAssignedProjects(payload, activeToken);
      if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data) && res.data.length > 0) {
        const matched = res.data.filter(matchesActivity);
        setOptions(
          matched.map((p) => {
            const code = p.projectNo || p.projectCode;
            const typeLabel = p.projectType ? ` [${p.projectType}]` : "";
            return {
              value: p.id,
              label: `${code ? `${code} — ` : ""}${p.projectName}${typeLabel}`,
            };
          })
        );
      } else {
        // Fallback to List (matching /projects-manager for admins & non-group users)
        const listRes = await List(
          {
            search: payload.search,
            limit: payload.limit,
            page: payload.page,
            filterWhere: payload.filterWhere,
            fieldOrder: payload.fieldOrder,
            orderDir: payload.orderDir,
          },
          activeToken
        );
        if (listRes?.statusCode === RES_CODE_OK && Array.isArray(listRes.data)) {
          const matched = listRes.data.filter(matchesActivity);
          setOptions(
            matched.map((p) => {
              const code = p.projectNo || p.projectCode;
              const typeLabel = p.projectType ? ` [${p.projectType}]` : "";
              return {
                value: p.id,
                label: `${code ? `${code} — ` : ""}${p.projectName}${typeLabel}`,
              };
            })
          );
        }
      }
    } finally {
      setIsLoadingProjects(false);
    }
  }, [token, userId, activityType, GetAssignedProjects, List]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const applyTemplateFallback = useCallback(
    (projectId: string | null) => {
      const names = STAGE_TEMPLATES[activityType] ?? [];
      const rawStages: SimulationStage[] = names.map((name, idx) => ({
        id: genId(),
        activityType,
        projectId,
        stageName: name,
        order: idx,
        parties: [],
        startDate: null,
        endDate: null,
        durationDays: 7,
        backlogId: null,
        backlogName: null,
      }));
      const scheduled = autoScheduleStages(rawStages);
      onClaim(scheduled, projectId);
    },
    [activityType, onClaim]
  );

  const handleClaim = useCallback(async () => {
    if (!selected) {
      toast({
        description: "Select an assigned project first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsClaiming(true);
    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("tokenData") || ""
        : "");
    try {
      const res = await GetProjectSdlcStages(selected.value, activeToken);
      if (res?.statusCode === RES_CODE_OK && res.data && res.data.length > 0) {
        const rawStages: SimulationStage[] = [...res.data]
          .sort((a, b) => a.stagePosOrder - b.stagePosOrder)
          .map((s, idx) => ({
            id: genId(),
            activityType,
            projectId: selected.value,
            stageName: s.stageName,
            order: idx,
            parties: [],
            startDate: s.startDate ? s.startDate.slice(0, 10) : null,
            endDate: s.endDate ? s.endDate.slice(0, 10) : null,
            durationDays:
              s.durationDays ??
              computeDuration(
                s.startDate ? s.startDate.slice(0, 10) : null,
                s.endDate ? s.endDate.slice(0, 10) : null
              ),
            backlogId: null,
            backlogName: null,
          }));
        const scheduled = autoScheduleStages(rawStages);
        onClaim(scheduled, selected.value);
        toast({
          description: `Claimed ${scheduled.length} stage(s) from project with scheduled timeline.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        applyTemplateFallback(selected.value);
        toast({
          description:
            "Project has no SDLC stages — applied the activity template with auto-schedule.",
          status: "info",
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      setIsClaiming(false);
    }
  }, [
    selected,
    token,
    activityType,
    GetProjectSdlcStages,
    onClaim,
    applyTemplateFallback,
    toast,
  ]);

  return (
    <VStack align="stretch" spacing={2.5}>
      <Select
        options={options}
        value={selected}
        onChange={(opt) => setSelected(opt as ProjectOption | null)}
        isLoading={isLoadingProjects}
        placeholder="Select Project"
        isClearable
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        menuPosition="fixed"
        menuPlacement="auto"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        chakraStyles={{
          container: (base) => ({ ...base, width: "100%" }),
          control: (base) => ({
            ...base,
            borderRadius: radiusStyle,
            minHeight: "38px",
            borderColor: isDark ? "gray.700" : "gray.300",
            bg: isDark ? "gray.800" : "white",
            _hover: {
              borderColor: "secondary.400",
            },
            _focus: {
              borderColor: "secondary.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
            },
          }),
          menu: (base) => ({
            ...base,
            borderRadius: radiusStyle,
            bg: isDark ? "gray.800" : "white",
            boxShadow: "2xl",
            border: "1px solid",
            borderColor: isDark ? "gray.700" : "gray.200",
            zIndex: 9999,
          }),
          menuList: (base) => ({
            ...base,
            py: 1,
            maxHeight: "280px",
            overflowY: "auto",
          }),
          option: (base) => ({
            ...base,
            fontSize: "xs",
            lineHeight: "tall",
            whiteSpace: "normal",
            wordBreak: "break-word",
            py: 2,
          }),
        }}
      />

      {/* Dynamic status hint */}
      {selected ? (
        <HStack spacing={1.5} color={isDark ? "secondary.300" : "secondary.600"} px={0.5}>
          <Icon as={FiCheckCircle} boxSize={3.5} />
          <Text fontSize="2xs" fontWeight="600">
            Project selected — click Claim to import SDLC
          </Text>
        </HStack>
      ) : (
        <HStack spacing={1.5} color={isDark ? "gray.400" : "gray.500"} px={0.5}>
          <Icon as={FiInfo} boxSize={3} />
          <Text fontSize="2xs">
            Link an assigned project or use standard template
          </Text>
        </HStack>
      )}

      {/* Action buttons */}
      <HStack spacing={2} pt={1}>
        <Button
          size="sm"
          leftIcon={<FiDownload />}
          colorScheme="secondary"
          rounded={radiusStyle}
          flex={1}
          onClick={handleClaim}
          isLoading={isClaiming}
          isDisabled={!selected}
          _hover={{ transform: "translateY(-1px)", shadow: "sm" }}
          transition="all 0.2s ease"
        >
          Claim Stages
        </Button>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FiLayers />}
          rounded={radiusStyle}
          px={3}
          borderColor={isDark ? "gray.600" : "gray.300"}
          color={isDark ? "gray.300" : "gray.600"}
          onClick={() => applyTemplateFallback(selected?.value ?? null)}
          _hover={{
            bg: isDark ? "whiteAlpha.100" : "gray.50",
            borderColor: "secondary.400",
            color: isDark ? "white" : "secondary.600",
          }}
          transition="all 0.2s ease"
        >
          Template
        </Button>
      </HStack>
    </VStack>
  );
};

export default AssignedProjectPicker;
