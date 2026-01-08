// Master Status Constants - Matches backend MasterStatusConstant.cs

// REQUIREMENT STATUSES
export const REQ_STATUS_DRAFT = "DRAFT";
export const REQ_STATUS_CARRY_OVER = "CARRY OVER";
export const REQ_STATUS_NEED_REVIEW = "NEEDS REVIEW";
export const REQ_STATUS_IN_PROGRESS_REVIEW = "IN PROGRESS REVIEW";
export const REQ_STATUS_TEMPORARY_APPROVED = "TEMPORARY APPROVED";
export const REQ_STATUS_APPROVED = "APPROVED";
export const REQ_STATUS_ON_HOLD = "ON HOLD";
export const REQ_STATUS_CANCELED = "CANCELED";

export const REQ_STATUS_CAN_EDIT = [
  "DRAFT",
  "NEEDS REVIEW",
  "IN PROGRESS REVIEW",
  "TEMPORARY APPROVED",
];

export const REQ_DONES_STATUS = ["APPROVED", "TEMPORARY APPROVED"];

export const REQUIREMENT_STATUSES = [
  "DRAFT",
  "CARRY OVER",
  "NEEDS REVIEW",
  "IN PROGRESS REVIEW",
  "TEMPORARY APPROVED",
  "APPROVED",
  "ON HOLD",
  "CANCELED",
];

// PROJECT STATUSES
export const PRO_STATUS_INITIATE = "INITIATING";
export const PRO_STATUS_RUNNING = "RUNNING";
export const PRO_STATUS_TEMPORARY_CLOSED = "TEMPORARY CLOSED";
export const PRO_STATUS_CLOSED = "CLOSED";
export const PRO_STATUS_ON_HOLD = "ON HOLD";
export const PRO_STATUS_CANCELED = "CANCELED";
export const PRO_STATUS_COMPLETED = "COMPLETED";

export const PROJECT_STATUSES = [
  "INITIATING",
  "RUNNING",
  "TEMPORARY CLOSED",
  "CLOSED",
  "ON HOLD",
  "CANCELED",
  "COMPLETED",
];

// PROJECT DEVELOPMENT STATUSES
export const PRO_DEV_STATUS_NOT_STARTED = "NOT STARTED";
export const PRO_DEV_STATUS_INITIATE = "INITIATE";
export const PRO_DEV_STATUS_ON_DEVELOPMENT = "ON DEVELOPMENT";
export const PRO_DEV_STATUS_READY_FOR_TESTING = "READY FOR TESTING";
export const PRO_DEV_STATUS_UNIT_TEST_IN_PROGRESS = "UNIT TEST IN PROGRESS";
export const PRO_DEV_STATUS_SIT_IN_PROGRESS = "SIT IN PROGRESS";
export const PRO_DEV_STATUS_UAT_IN_PROGRESS = "UAT IN PROGRESS";
export const PRO_DEV_STATUS_READY_FOR_DEPLOYMENT = "READY FOR DEPLOYMENT";
export const PRO_DEV_STATUS_COMPLETED = "COMPLETED";
export const PRO_DEV_STATUS_ON_HOLD = "ON HOLD";
export const PRO_DEV_STATUS_CANCELED = "CANCELED";

export const PROJECT_DEVELOPMENT_STATUSES = [
  "NOT STARTED",
  "INITIATE",
  "ON DEVELOPMENT",
  "READY FOR TESTING",
  "UNIT TEST IN PROGRESS",
  "SIT IN PROGRESS",
  "UAT IN PROGRESS",
  "READY FOR DEPLOYMENT",
  "COMPLETED",
  "ON HOLD",
  "CANCELED",
];

// STATUS COLOR MAPPINGS
export const STATUS_COLORS = {
  "CANCELED": "red",
  "ON_HOLD": "orange",

  // Requirement Status Colors
  "DRAFT": "gray",
  "CARRY OVER": "orange",
  "NEEDS REVIEW": "yellow",
  "IN PROGRESS REVIEW": "blue",
  "TEMPORARY APPROVED": "cyan",
  "APPROVED": "green",

  // Project Status Colors
  "INITIATING": "blue",
  "RUNNING": "green",
  "TEMPORARY CLOSED": "orange",
  "CLOSED": "green",
  "COMPLETED": "green",

  // Project Development Status Colors
  "NOT STARTED": "gray",
  "ON DEVELOPMENT": "purple",
  "READY FOR TESTING": "cyan",
  "UNIT TEST IN PROGRESS": "yellow",
  "SIT IN PROGRESS": "orange",
  "UAT IN PROGRESS": "pink",
  "READY FOR DEPLOYMENT": "teal",
} as const;

// UTILITY FUNCTIONS
export const getStatusColor = (status: string): string => {
  // Handle duplicate status names by context
  if (status === "ON HOLD") return "orange";
  if (status === "CANCELED") return "red";
  if (status === "INITIATING") return "blue";
  if (status === "COMPLETED") return "green";

  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "gray";
};

export const isRequirementDone = (status: string): boolean => {
  return REQ_DONES_STATUS.includes(status);
};

// OPTION DATA TYPES
export interface StatusOption {
  value: string;
  label: string;
  colorScheme: string;
}

// STATUS OPTIONS FOR DROPDOWNS
export const REQUIREMENT_STATUS_OPTIONS: StatusOption[] =
  REQUIREMENT_STATUSES.map((status) => ({
    value: status,
    label: status,
    colorScheme: getStatusColor(status),
  }));

export const PROJECT_STATUS_OPTIONS: StatusOption[] = PROJECT_STATUSES.map(
  (status) => ({
    value: status,
    label: status,
    colorScheme: getStatusColor(status),
  })
);

export const PROJECT_DEVELOPMENT_STATUS_OPTIONS: StatusOption[] =
  PROJECT_DEVELOPMENT_STATUSES.map((status) => ({
    value: status,
    label: status,
    colorScheme: getStatusColor(status),
  }));
