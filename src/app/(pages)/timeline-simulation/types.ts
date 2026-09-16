// Timeline Simulation — shared types
// Follows repo convention: co-located domain types for the module.

/**
 * Activity flow the simulation is modelling. Drives the default stage template
 * and the colour grouping in the visualizations.
 */
export type ActivityType =
  | "INTERNAL DEVELOPMENT"
  | "PROCUREMENT"
  | "RFC";

/** Which visualization the user has chosen to render. */
export type VisualizationMode = "gantt" | "timeline";

/**
 * A party involved in a stage — sourced from master-data organization
 * (directorate / division / group) or master roles.
 */
export interface SimulationParty {
  id: string;
  /** ORG type (DIRECTORATE | DIVISION | GROUP) or ROLE. */
  type: string;
  name: string;
}

/**
 * A team member assigned to a stage with multi-project workload context.
 */
export interface SimulationMember {
  id: string;
  name: string;
  email?: string | null;
  nip?: string | null;
  role?: string | null;
  profilePict?: string | null;
  /** Active concurrent projects count across organization */
  activeProjectCount?: number;
  /** Names of concurrent projects assigned to this user */
  assignedProjectNames?: string[];
}

/**
 * One row of the simulation. Stages are claimed from the user's assigned
 * projects (project SDLC stages) and then edited here.
 */
export interface SimulationStage {
  /** Local client id (uuid-ish). Not the backend id. */
  id: string;
  activityType: ActivityType;
  /** Source project the stage was claimed from (nullable for template stages). */
  projectId: string | null;
  stageName: string;
  /** Order in the timeline (ascending). */
  order: number;
  parties: SimulationParty[];
  /** Team members assigned to this stage. */
  members?: SimulationMember[];
  /** ISO date string (yyyy-MM-dd) or null. */
  startDate: string | null;
  /** ISO date string (yyyy-MM-dd) or null. */
  endDate: string | null;
  /** Base duration in days. */
  durationDays: number | null;
  /** Extra buffer days added to simulate member multi-project contention. */
  extendedDays?: number | null;
  /** Reused kanban backlog id (from requirements backlog list). */
  backlogId: string | null;
  backlogName: string | null;
}

/** The full simulation kept in local state and sent to the API. */
export interface TimelineSimulation {
  /** Backend id when persisted; null for a new unsaved simulation. */
  id: string | null;
  simulationName: string;
  activityType: ActivityType;
  /** Project the simulation was primarily built from, if any. */
  projectId: string | null;
  visualizationMode: VisualizationMode;
  stages: SimulationStage[];
}

/** Payload sent to the save endpoint. */
export interface TimelineSimulationSavePayload {
  id?: string | null;
  simulationName: string;
  activityType: ActivityType;
  projectId: string | null;
  visualizationMode: VisualizationMode;
  stages: SimulationStage[];
}

/** Row shape returned by the list endpoint. */
export interface TimelineSimulationListItem {
  id: string;
  simulationName: string;
  activityType: ActivityType;
  projectId: string | null;
  stageCount: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
}

/** A single month broken into four week-buckets for the axis. */
export interface MonthWeekBucket {
  /** yyyy-MM of the month. */
  monthKey: string;
  /** e.g. "Sep 2025". */
  monthLabel: string;
  /** 1..4 */
  week: number;
  /** e.g. "Sep 2025 · W1". */
  label: string;
}
