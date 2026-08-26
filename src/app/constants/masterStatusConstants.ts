// Master Status Constants - Matches backend MasterStatusConstant.cs

// REQUIREMENT STATUSES
export const REQ_STATUS_DRAFT = "DRAFT";
export const REQ_STATUS_CARRY_OVER = "CARRY OVER";
export const REQ_STATUS_NEED_REVIEW = "NEEDS REVIEW";
export const REQ_STATUS_IN_PROGRESS_REVIEW = "IN PROGRESS REVIEW";
export const REQ_STATUS_TEMPORARY_APPROVED = "TEMPORARY APPROVED";
export const REQ_WAITING_APPROVAL = "WAITING APPROVAL";
export const REQ_STATUS_APPROVED = "APPROVED";
export const REQ_STATUS_ON_HOLD = "ON HOLD";
export const REQ_STATUS_CANCELED = "CANCELED";

export const REQ_STATUS_CAN_EDIT = [
  "DRAFT",
  "NEEDS REVIEW",
  "IN PROGRESS REVIEW",
  "TEMPORARY APPROVED",
  "ON HOLD",
];

export const REQ_DONES_STATUS = ["APPROVED", "TEMPORARY APPROVED"];

export const REQUIREMENT_STATUSES = [
  "DRAFT",
  "CARRY OVER",
  "WAITING APPROVAL",
  "NEEDS REVIEW",
  "IN PROGRESS REVIEW",
  "TEMPORARY APPROVED",
  "APPROVED",
  "ON HOLD",
  "CANCELED",
];

// PROJECT STATUSES
export const PRO_STATUS_INITIATE = "INITIATING";
export const PRO_WAITING_APPROVAL = "WAITING APPROVAL";
export const PRO_STATUS_RUNNING = "RUNNING";
export const PRO_STATUS_TEMPORARY_CLOSED = "TEMPORARY CLOSED";
export const PRO_STATUS_CLOSED = "CLOSED";
export const PRO_STATUS_ON_HOLD = "ON HOLD";
export const PRO_STATUS_CANCELED = "CANCELED";
export const PRO_STATUS_COMPLETED = "COMPLETED";

export const PROJECT_STATUSES = [
  "INITIATING",
  "RUNNING",
  "CLOSED",
  "TEMPORARY CLOSED",
  "COMPLETED",
  "ON HOLD",
  "CANCELED",
];

// PROJECT STATUS GROUPS (matches backend MasterStatusConstant.cs)
export const PROJECT_ONGOING = [
  "INITIATING",
  "RUNNING",
  "TEMPORARY CLOSED",
  "ON HOLD",
];

export const PROJECT_DONE = ["CANCELED", "COMPLETED", "CLOSED"];

export const PROJECT_WAITING_APPROVE = [
  "WAITING APPROVAL 1",
  "WAITING APPROVAL 2",
  "WAITING APPROVAL 3",
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
  ACTIVE: "green",
  INACTIVE: "red",
  CANCELED: "red",
  ON_HOLD: "orange",
  "ON HOLD": "orange",

  // Requirement Status Colors
  DRAFT: "gray",
  "CARRY OVER": "orange",
  "NEEDS REVIEW": "yellow",
  "IN PROGRESS REVIEW": "blue",
  "TEMPORARY APPROVED": "cyan",
  APPROVED: "green",

  // Project Status Colors
  INITIATING: "blue",
  RUNNING: "green",
  "TEMPORARY CLOSED": "orange",
  CLOSED: "green",
  COMPLETED: "green",

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
export const getStatusColor = (status?: string | null): string => {
  if (!status) return "gray";
  const s = String(status).toUpperCase();
  // Handle CAB specific statuses
  if (s === "DRAFT") return "gray";
  if (s === "PENGAJUAN" || s === "REQUEST") return "blue";
  if (s === "PENJADWALAN" || s === "SCHEDULED" || s === "SUBMITTED") return "purple";
  if (s === "PELAKSANAAN" || s === "CONFIRM") return "teal";
  if (s === "IMPLEMENTASI" || s === "IMPLEMENT") return "orange";
  if (
    s === "SEND TO APPROVAL" ||
    s === "SEND_TO_APPROVAL" ||
    s === "WAITING APPROVE" ||
    s === "WAITING APPROVAL" ||
    s === "IN_REVIEW" ||
    s === "PENDING_APPROVAL"
  ) {
    return "yellow";
  }
  if (s === "APPROVED" || s === "COMPLETED") return "green";
  if (s === "REJECTED") return "red";
  if (s === "CANCELED") return "red";
  if (s === "ON HOLD") return "orange";
  if (s === "INITIATING") return "blue";

  return STATUS_COLORS[s as keyof typeof STATUS_COLORS] || "gray";
};

export const formatCabStatusLabel = (status?: string | null): string => {
  if (!status) return "—";
  const s = String(status).trim().toUpperCase();
  switch (s) {
    case "PENGAJUAN":
    case "REQUEST":
      return "Pengajuan";
    case "PELAKSANAAN":
    case "CONFIRM":
    case "PENJADWALAN":
    case "SCHEDULED":
    case "SUBMITTED":
      return "Pelaksanaan";
    case "IMPLEMENTASI":
    case "IMPLEMENT":
      return "Implementasi";
    case "SEND TO APPROVAL":
    case "SEND_TO_APPROVAL":
    case "WAITING APPROVAL":
    case "WAITING APPROVE":
    case "IN_REVIEW":
    case "PENDING_APPROVAL":
      return "Send to Approval";
    case "COMPLETED":
    case "APPROVED":
      return "Completed";
    case "REJECTED":
      return "Rejected";
    case "DRAFT":
      return "Draft";
    case "CANCELED":
      return "Canceled";
    default:
      return status;
  }
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
  }),
);

export const PROJECT_DEVELOPMENT_STATUS_OPTIONS: StatusOption[] =
  PROJECT_DEVELOPMENT_STATUSES.map((status) => ({
    value: status,
    label: status,
    colorScheme: getStatusColor(status),
  }));

// PROJECT STATUS GROUP OPTIONS
export const PROJECT_ACTIVE_STATUS_OPTIONS: StatusOption[] =
  PROJECT_ONGOING.map((status) => ({
    value: status,
    label: status,
    colorScheme: getStatusColor(status),
  }));

export const PROJECT_CLOSE_STATUS_OPTIONS: StatusOption[] = PROJECT_DONE.map(
  (status) => ({
    value: status,
    label: status,
    colorScheme: getStatusColor(status),
  }),
);
