// Default fallback stage names per activity flow.
// Used when a claimed project has no SDLC stages, or when the user starts a
// simulation from scratch without picking a project. These mirror the common
// business flows in the app (internal development, procurement, RFC).

import { ActivityType } from "../types";

export const STAGE_TEMPLATES: Record<ActivityType, string[]> = {
  "INTERNAL DEVELOPMENT": [
    "Requirement Analysis",
    "System Design",
    "Development",
    "Unit Testing",
    "SIT",
    "UAT",
    "Deployment",
  ],
  PROCUREMENT: [
    "Requirement Definition",
    "Vendor Selection",
    "Contract & PO",
    "Delivery",
    "Installation & Config",
    "UAT",
    "Go Live",
  ],
  RFC: [
    "Change Request Drafting",
    "Impact Assessment",
    "CAB Review",
    "Approval",
    "Implementation",
  ],
};

/** Default duration (in days) assigned to standard stages for auto-scheduling. */
export const DEFAULT_STAGE_DURATIONS: Record<string, number> = {
  // Internal Development
  "Requirement Analysis": 7,
  "System Design": 7,
  "Development": 21,
  "Unit Testing": 5,
  "SIT": 7,
  "UAT": 7,
  "Deployment": 3,
  // Procurement
  "Requirement Definition": 7,
  "Vendor Selection": 14,
  "Contract & PO": 10,
  "Delivery": 14,
  "Installation & Config": 7,
  "Go Live": 3,
  // RFC
  "Change Request Drafting": 3,
  "Impact Assessment": 5,
  "CAB Review": 4,
  "Approval": 3,
  "Implementation": 5,
};

/** Human-readable label + colour scheme for each activity type. */
export const ACTIVITY_TYPE_META: Record<
  ActivityType,
  { label: string; colorScheme: string }
> = {
  "INTERNAL DEVELOPMENT": { label: "Internal Development", colorScheme: "blue" },
  PROCUREMENT: { label: "Procurement", colorScheme: "purple" },
  RFC: { label: "RFC", colorScheme: "orange" },
};

export const ACTIVITY_TYPES: ActivityType[] = [
  "INTERNAL DEVELOPMENT",
  "PROCUREMENT",
  "RFC",
];
