"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ActivityType,
  SimulationMember,
  SimulationParty,
  SimulationStage,
  TimelineSimulation,
  VisualizationMode,
} from "../types";
import {
  computeDuration,
  computeEndDate,
  computeStagesDateRange,
} from "../utils/weekBucket";

/** Generate a lightweight client-side id (no backend dependency). */
const genId = (): string =>
  `stg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Fields a caller may pass when creating a stage. */
export interface NewStageInput {
  activityType: ActivityType;
  projectId?: string | null;
  stageName: string;
  parties?: SimulationParty[];
  members?: SimulationMember[];
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
  extendedDays?: number | null;
  backlogId?: string | null;
  backlogName?: string | null;
}

/**
 * Reconcile date fields on a stage so duration and endDate stay consistent.
 * Incorporates extendedDays (workload contention buffer) into effective duration.
 */
const reconcileStageDates = (stage: SimulationStage): SimulationStage => {
  const base = stage.durationDays ?? 1;
  const ext = stage.extendedDays ?? 0;
  const effectiveDuration = Math.max(1, base + ext);

  if (stage.startDate && stage.durationDays != null) {
    return {
      ...stage,
      endDate: computeEndDate(stage.startDate, effectiveDuration),
    };
  }
  if (stage.startDate && stage.endDate) {
    const rawDiff = computeDuration(stage.startDate, stage.endDate) ?? 1;
    const computedBase = Math.max(1, rawDiff - ext);
    return { ...stage, durationDays: computedBase };
  }
  return stage;
};

export interface UseTimelineSimulationState {
  simulationId: string | null;
  simulationName: string;
  activityType: ActivityType;
  projectId: string | null;
  visualizationMode: VisualizationMode;
  stages: SimulationStage[];
  dateRange: { min: string | null; max: string | null };

  setSimulationName: (name: string) => void;
  setActivityType: (type: ActivityType) => void;
  setProjectId: (id: string | null) => void;
  setVisualizationMode: (mode: VisualizationMode) => void;

  addStage: (input: NewStageInput) => void;
  updateStage: (id: string, patch: Partial<SimulationStage>) => void;
  removeStage: (id: string) => void;
  replaceStages: (stages: SimulationStage[]) => void;
  clearStages: () => void;

  hydrate: (simulation: TimelineSimulation) => void;
  toSavePayload: (name?: string) => TimelineSimulation;
}

const useTimelineSimulationState = (
  initialActivityType: ActivityType = "INTERNAL DEVELOPMENT"
): UseTimelineSimulationState => {
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [simulationName, setSimulationName] = useState<string>("");
  const [activityType, setActivityType] = useState<ActivityType>(
    initialActivityType
  );
  const [projectId, setProjectId] = useState<string | null>(null);
  const [visualizationMode, setVisualizationMode] =
    useState<VisualizationMode>("gantt");
  const [stages, setStages] = useState<SimulationStage[]>([]);

  const addStage = useCallback((input: NewStageInput) => {
    setStages((prev) => {
      const stage: SimulationStage = reconcileStageDates({
        id: genId(),
        activityType: input.activityType,
        projectId: input.projectId ?? null,
        stageName: input.stageName,
        order: prev.length,
        parties: input.parties ?? [],
        members: input.members ?? [],
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        durationDays: input.durationDays ?? null,
        extendedDays: input.extendedDays ?? 0,
        backlogId: input.backlogId ?? null,
        backlogName: input.backlogName ?? null,
      });
      return [...prev, stage];
    });
  }, []);

  const updateStage = useCallback(
    (id: string, patch: Partial<SimulationStage>) => {
      setStages((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const merged: SimulationStage = { ...s, ...patch };
          const durationOrBufferChanged =
            (patch.durationDays !== undefined || patch.extendedDays !== undefined) &&
            patch.startDate === undefined &&
            patch.endDate === undefined;
          if (durationOrBufferChanged && merged.startDate && merged.durationDays != null) {
            const eff = Math.max(1, (merged.durationDays ?? 1) + (merged.extendedDays ?? 0));
            return {
              ...merged,
              endDate: computeEndDate(merged.startDate, eff),
            };
          }
          return reconcileStageDates(merged);
        })
      );
    },
    []
  );

  const removeStage = useCallback((id: string) => {
    setStages((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, order: idx }))
    );
  }, []);

  const replaceStages = useCallback((next: SimulationStage[]) => {
    setStages(next.map((s, idx) => reconcileStageDates({ ...s, order: idx })));
  }, []);

  const clearStages = useCallback(() => setStages([]), []);

  const hydrate = useCallback((simulation: TimelineSimulation) => {
    setSimulationId(simulation.id);
    setSimulationName(simulation.simulationName);
    setActivityType(simulation.activityType);
    setProjectId(simulation.projectId);
    setVisualizationMode(simulation.visualizationMode);
    setStages(
      (simulation.stages ?? []).map((s, idx) =>
        reconcileStageDates({
          ...s,
          order: idx,
          parties: s.parties ?? [],
          members: s.members ?? [],
          extendedDays: s.extendedDays ?? 0,
        })
      )
    );
  }, []);

  const toSavePayload = useCallback(
    (name?: string): TimelineSimulation => ({
      id: simulationId,
      simulationName: name ?? simulationName,
      activityType,
      projectId,
      visualizationMode,
      stages,
    }),
    [simulationId, simulationName, activityType, projectId, visualizationMode, stages]
  );

  const dateRange = useMemo(() => computeStagesDateRange(stages), [stages]);

  return {
    simulationId,
    simulationName,
    activityType,
    projectId,
    visualizationMode,
    stages,
    dateRange,
    setSimulationName,
    setActivityType,
    setProjectId,
    setVisualizationMode,
    addStage,
    updateStage,
    removeStage,
    replaceStages,
    clearStages,
    hydrate,
    toSavePayload,
  };
};

export default useTimelineSimulationState;
