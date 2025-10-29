import {
  REQUIREMENT_STATUSES,
  PROJECT_STATUSES,
  PROJECT_DEVELOPMENT_STATUSES,
  REQ_DONES_STATUS,
  getStatusColor,
  REQ_STATUS_APPROVED,
  REQ_STATUS_TEMPORARY_APPROVED,
  PRO_STATUS_COMPLETED,
  PRO_DEV_STATUS_COMPLETED,
} from "@/app/constants/masterStatusConstants";

// Status validation functions
export const isValidRequirementStatus = (status: string): boolean => {
  return REQUIREMENT_STATUSES.includes(status);
};

export const isValidProjectStatus = (status: string): boolean => {
  return PROJECT_STATUSES.includes(status);
};

export const isValidProjectDevelopmentStatus = (status: string): boolean => {
  return PROJECT_DEVELOPMENT_STATUSES.includes(status);
};

// Status checking functions
export const isRequirementApproved = (status: string): boolean => {
  return status === REQ_STATUS_APPROVED || status === REQ_STATUS_TEMPORARY_APPROVED;
};

export const isProjectCompleted = (status: string): boolean => {
  return status === PRO_STATUS_COMPLETED;
};

export const isProjectDevelopmentCompleted = (status: string): boolean => {
  return status === PRO_DEV_STATUS_COMPLETED;
};

// Progress calculation based on status
export const getProjectProgressByStatus = (status: string): number => {
  const statusIndex = PROJECT_DEVELOPMENT_STATUSES.indexOf(status);
  if (statusIndex === -1) return 0;
  
  const totalStatuses = PROJECT_DEVELOPMENT_STATUSES.length - 3; // Exclude ON HOLD, CANCELED, COMPLETED
  return Math.round((statusIndex / totalStatuses) * 100);
};

// Status transition helpers
export const getNextRequirementStatus = (currentStatus: string): string | null => {
  const currentIndex = REQUIREMENT_STATUSES.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= REQUIREMENT_STATUSES.length - 1) return null;
  return REQUIREMENT_STATUSES[currentIndex + 1];
};

export const canTransitionRequirementStatus = (from: string, to: string): boolean => {
  if (!isValidRequirementStatus(from) || !isValidRequirementStatus(to)) return false;
  
  const fromIndex = REQUIREMENT_STATUSES.indexOf(from);
  const toIndex = REQUIREMENT_STATUSES.indexOf(to);
  
  // Allow forward progression or moving to ON HOLD/CANCELED from any status
  return toIndex > fromIndex || to === "ON HOLD" || to === "CANCELED";
};

// Export centralized getStatusColor for consistency
export { getStatusColor };
