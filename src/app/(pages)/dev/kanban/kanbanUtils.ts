/**
 * Utility functions for Dev Kanban Board
 */

export const normalizeStageName = (name?: string | null): string => {
  if (!name) return "";
  const n = name.trim().toUpperCase();
  if (n === "TO DO" || n === "TODO") return "TODO";
  if (n.includes("PROGRESS") || n.includes("DOING") || n === "IN_PROGRESS") return "INPROGRESS";
  if (n.includes("REVIEW") || n.includes("TEST") || n.includes("QA") || n === "IN_REVIEW") return "REVIEW";
  if (n.includes("DONE") || n.includes("COMPLETE") || n.includes("FINISH")) return "DONE";
  return n;
};
