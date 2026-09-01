/**
 * Special Routes Configuration
 * Centralized configuration for routes that need special handling
 */

/**
 * Routes that don't require authentication at all
 */
export const publicRoutes: string[] = [
  "/",
  "/landing",
  "/tentang-kami",
  "/hubungi-kami",
  "/pricing",
];

/**
 * Routes always accessible for ANY authenticated user
 * (no menu/module check needed)
 */
export const authenticatedOnlyRoutes: string[] = [
  "/profile",
  "/change-password",
  "/coming-soon",
  "/forbidden",
  "/settings",
  "/additional-menus",
];

/**
 * Routes that should redirect based on auth status
 */
export const routeRedirects: Record<
  string,
  { authenticated: string; unauthenticated: string }
> = {
  "/": {
    unauthenticated: "/landing",
    authenticated: "/home",
  },
};

/**
 * Routes that bypass menu check but still need module permission
 * Use case: Pages not in menu but need permission check
 */
export const moduleOnlyRoutes: Record<
  string,
  { moduleCode: string; permission?: "make" | "review" | "approve" }
> = {
  "/file-archives": {
    moduleCode: "FILE_MODULE",
  },
};

/**
 * Routes that need aggregated permission check (not specific module)
 * Use case: Global actions that need maker/review/approve
 */
export const aggregatedPermissionRoutes: Record<
  string,
  "make" | "review" | "approve"
> = {
  "/approval-hub": "approve",
  "/review-center": "review",
};

/**
 * Dynamic route patterns - SIMPLIFIED
 * Use :id as placeholder for dynamic segments
 * Example: '/requirements/brd/:id/edit' matches '/requirements/brd/123/edit'
 */
export interface DynamicRoutePattern {
  pattern: string; // Simple pattern with :id, :code, etc.
  baseMenu?: string;
  moduleCode?: string;
  permission?:
    | "make"
    | "review"
    | "approve"
    | ("make" | "review" | "approve")[];
}

export const dynamicRoutePatterns: DynamicRoutePattern[] = [
  // Multiple permissions (user needs ANY of them)
  // {
  //   pattern: "/requirements/brd/:id/edit",
  //   baseMenu: "/requirements",
  //   permission: ["make", "review"]  // User needs make OR review
  // }

  // ===== WORKSPACE =====
  {
    pattern: "/workspace/project",
    baseMenu: "/workspace",
  },
  {
    pattern: "/cab/cab-request",
    baseMenu: "/cab",
  },
  {
    pattern: "/cab/cab-request/detail",
    baseMenu: "/cab",
  },
  {
    pattern: "/cab/cab-request/create",
    baseMenu: "/cab",
    permission: "make",
  },
  {
    pattern: "/cab/cab-approve",
    baseMenu: "/cab",
  },

  // ===== REQUIREMENTS =====
  // BRD routes
  {
    pattern: "/requirements/brd/register",
    baseMenu: "/requirements",
    permission: "make",
  },
  {
    pattern: "/requirements/brd/:id/edit",
    baseMenu: "/requirements",
    permission: "make",
  },
  {
    pattern: "/requirements/brd/:id/review",
    baseMenu: "/requirements",
    permission: "review",
  },
  {
    pattern: "/requirements/brd/:id/approve",
    baseMenu: "/requirements",
    permission: "approve",
  },
  {
    pattern: "/requirements/brd/:id/detail",
    baseMenu: "/requirements",
  },

  // RFC routes
  {
    pattern: "/requirements/rfc/register",
    baseMenu: "/requirements",
    permission: "make",
  },
  {
    pattern: "/requirements/rfc/:id/edit",
    baseMenu: "/requirements",
    permission: "make",
  },
  {
    pattern: "/requirements/rfc/:id/review",
    baseMenu: "/requirements",
    permission: "review",
  },
  {
    pattern: "/requirements/rfc/:id/approve",
    baseMenu: "/requirements",
    permission: "approve",
  },
  {
    pattern: "/requirements/rfc/:id/detail",
    baseMenu: "/requirements",
  },

  // Requirements detail page
  {
    pattern: "/requirements/detail",
    baseMenu: "/requirements",
  },

  // ===== PROJECTS =====
  {
    pattern: "/projects-manager/register",
    baseMenu: "/projects",
    permission: "make",
  },
  {
    pattern: "/projects-procurements/register",
    baseMenu: "/projects",
    permission: "make",
  },
  {
    pattern: "/projects/manage",
    baseMenu: "/projects",
  },
  {
    pattern: "/projects/preview",
    baseMenu: "/projects",
  },

  //projects/doc
  {
    pattern: "/projects/doc",
    baseMenu: "/projects",
  },

  //performances
  {
    pattern: "/projects/doc",
    baseMenu: "/projects",
  },

  // ===== VENDOR MANAGEMENT =====

  {
    pattern: "/vendor-management/register",
    baseMenu: "/vendor-management",
  },
  {
    pattern: "/vendor-management/detail",
    baseMenu: "/vendor-management",
  },
  {
    pattern: "/vendor-management/contracts/detail",
    baseMenu: "/vendor-management",
  },
  {
    pattern: "/vendor-management/contracts/register",
    baseMenu: "/vendor-management",
  },

  ///master-data/rbb/register/
  {
    pattern: "/master-data/rbb/register",
    baseMenu: "/master-data/rbb",
  },
  {
    pattern: "/master-data/rbb/detail",
    baseMenu: "/master-data/rbb",
  },
  {
    pattern: "/master-data/rbb/edi",
    baseMenu: "/master-data/rbb",
  },

  {
    pattern: "/performances/divisions/detail",
    baseMenu: "/performances",
  },
  {
    pattern: "/performances/groups/detail",
    baseMenu: "/performances",
  },
  {
    pattern: "/performances/teams/detail",
    baseMenu: "/performances",
  },

  // ===== MASTER DATA =====
  // Users
  {
    pattern: "/master-data/users/:id/edit",
    baseMenu: "/master-data/users",
  },
  {
    pattern: "/master-data/users/:id/detail",
    baseMenu: "/master-data/users",
  },
  {
    pattern: "/master-data/authorize-groups/detail",
    baseMenu: "/master-data/authorize-groups",
  },
  {
    pattern: "/master-data/sequences-config",
    baseMenu: "/master-data/sequences-config",
  },
  {
    pattern: "/user-data/assign-module",
    baseMenu: "/user-data/assign-module",
  },
  {
    pattern: "/master-data/workflow/preset-workflow-detail",
    baseMenu: "/master-data/workflow",
  },
  {
    pattern: "/master-data/conf-matrix-criteria-apps/criteria/new",
    baseMenu: "/master-data/conf-matrix-criteria-apps",
  },
  {
    pattern: "/master-data/conf-matrix-criteria-apps/criteria/detail",
    baseMenu: "/master-data/conf-matrix-criteria-apps",
  },

  // report

  {
    pattern: "/report/apps-assessments/detail",
    baseMenu: "/report/apps-assessments",
  },
  {
    pattern: "/report/apps-assessments/assessment",
    baseMenu: "/report/apps-assessments",
  },
  {
    pattern: "/report/upload-report-assessments-apps/detail",
    baseMenu: "/report/upload-report-assessments-apps",
  },

  // Menus
  {
    pattern: "/master-data/menus/:id/edit",
    baseMenu: "/master-data/menus",
  },
  {
    pattern: "/master-data/menus/:id/detail",
    baseMenu: "/master-data/menus",
  },

  // Modules
  {
    pattern: "/master-data/modules/:id/edit",
    baseMenu: "/master-data/modules",
  },
  {
    pattern: "/master-data/modules/:id/detail",
    baseMenu: "/master-data/modules",
  },
  {
    pattern: "/master-data/sys-module-group/detail",
    baseMenu: "/master-data/sys-module-group",
  },

  // Application
  {
    pattern: "/master-data/Application/detail",
    baseMenu: "/master-data",
  },

  // Workflow
  {
    pattern: "/master-data/workflow/detail",
    baseMenu: "/master-data",
  },
  {
    pattern: "/master-data/workflow/preset-workflow",
    baseMenu: "/master-data",
  },

  // http://localhost:8998/master-data/authorize-groups/detail?id=1b2a6b11-4f2f-443d-a263-bb5ed344316b

  {
    pattern: "/master-data/authorize-groups/detail",
    baseMenu: "/master-data",
  },

  //http://localhost:8998/master-data/sdlc-flow/detail?flowId=a7925d13-8432-4d6d-aa68-ae235175cbda

  {
    pattern: "/master-data/sdlc-flow/detail",
    baseMenu: "/master-data",
  },

  // ===== TEAMS =====
  {
    pattern: "/teams-center/detail",
    baseMenu: "/teams",
  },
  {
    pattern: "/teams-center/add",
    baseMenu: "/teams",
  },

  // ==== SPECIALITATION ====
  {
    pattern: "/master-data/specialization",
    baseMenu: "/master-data",
  },
];

/**
 * Workspace-specific routes (different layout)
 * These use workspace menu instead of main menu
 */
export const workspaceRoutes: string[] = [
  "/workspace",
  "/workspace/development",
  "/workspace/testing",
  "/workspace/deployment",
];

/**
 * Routes that should be accessible if user has ANY menu access
 * Use case: Dashboard, home pages that aggregate data
 */
export const anyMenuAccessRoutes: string[] = ["/home", "/calendar", "/kanban"];
