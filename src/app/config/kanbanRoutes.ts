/**
 * Kanban Navigation Configuration
 * Centralized routing logic for kanban back navigation
 */

export interface KanbanRouteConfig {
  source: string;
  backUrl: (projectId: string) => string;
  label: string;
}

export const KANBAN_SOURCES = {
  PROJECTS_MANAGER: "projects-manager",
  PROJECTS_PROCUREMENTS: "projects-procurements",
  PROJECT_DEVELOPMENT: "project-development",
} as const;

export const kanbanRouteConfigs: Record<string, KanbanRouteConfig> = {
  [KANBAN_SOURCES.PROJECTS_MANAGER]: {
    source: KANBAN_SOURCES.PROJECTS_MANAGER,
    backUrl: (projectId: string) =>
      `/projects-manager/detail?projectId=${projectId}`,
    label: "Back to Project Manager",
  },

  [KANBAN_SOURCES.PROJECTS_PROCUREMENTS]: {
    source: KANBAN_SOURCES.PROJECTS_PROCUREMENTS,
    backUrl: (projectId: string) =>
      `/projects-procurements/manage?projectId=${projectId}`,
    label: "Back to Procurement",
  },

  [KANBAN_SOURCES.PROJECT_DEVELOPMENT]: {
    source: KANBAN_SOURCES.PROJECT_DEVELOPMENT,
    backUrl: (projectId: string) =>
      `/project-development/development?projectId=${projectId}`,
    label: "Back to Development",
  },
};

/**
 * Get back navigation URL based on source
 */
export const getKanbanBackUrl = (
  source: string | null,
  projectId: string
): string => {
  const config = source ? kanbanRouteConfigs[source] : null;
  return config
    ? config.backUrl(projectId)
    : kanbanRouteConfigs[KANBAN_SOURCES.PROJECTS_MANAGER].backUrl(projectId);
};

/**
 * Get back button label based on source
 */
export const getKanbanBackLabel = (source: string | null): string => {
  const config = source ? kanbanRouteConfigs[source] : null;
  return config ? config.label : "Kembali";
};
