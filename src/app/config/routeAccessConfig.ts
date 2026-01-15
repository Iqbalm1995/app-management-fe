/**
 * Route Access Configuration
 * Maps routes to their access requirements (menu-based or module-based)
 */

export type PermissionType = 'make' | 'review' | 'approve' | 'view';

export interface RouteAccessRule {
  // Menu-based access
  menuLink?: string;
  requiresOperations?: boolean; // If true, allows child paths like /register, /:id/edit
  
  // Module-based access
  moduleCode?: string;
  requiredPermission?: PermissionType;
  
  // Special cases
  alwaysAllow?: boolean;
  requiresAuth?: boolean;
}

/**
 * Route Access Map
 * Define access rules for specific routes
 */
export const routeAccessMap: Record<string, RouteAccessRule> = {
  // ===== DASHBOARD & HOME =====
  '/home': { 
    menuLink: '/home' 
  },
  
  // ===== MASTER DATA =====
  '/master-data/users': { 
    menuLink: '/master-data/users',
    requiresOperations: true // Allows /register, /:id/edit, /:id/detail
  },
  
  '/master-data/users/register': {
    menuLink: '/master-data/users',
    requiresOperations: true
  },
  
  '/master-data/menus': { 
    menuLink: '/master-data/menus',
    requiresOperations: true
  },
  
  '/master-data/menus/register': {
    menuLink: '/master-data/menus',
    requiresOperations: true
  },
  
  '/master-data/modules': { 
    menuLink: '/master-data/modules',
    requiresOperations: true
  },
  
  '/master-data/authorize-groups': { 
    menuLink: '/master-data/authorize-groups',
    requiresOperations: true
  },
  
  '/master-data/function-groups': { 
    menuLink: '/master-data/function-groups',
    requiresOperations: true
  },
  
  // ===== REQUIREMENTS =====
  '/requirements/brd': {
    moduleCode: 'BRD_MODULE',
    requiredPermission: 'view'
  },
  
  '/requirements/brd/register': {
    moduleCode: 'BRD_MODULE',
    requiredPermission: 'make'
  },
  
  '/requirements/rfc': {
    moduleCode: 'RFC_MODULE',
    requiredPermission: 'view'
  },
  
  '/requirements/rfc/register': {
    moduleCode: 'RFC_MODULE',
    requiredPermission: 'make'
  },
  
  '/requirements/approval-hub': {
    moduleCode: 'APPROVAL_MODULE',
    requiredPermission: 'approve'
  },
  
  // ===== PROJECTS =====
  '/projects-manager': {
    menuLink: '/projects',
    requiresOperations: true
  },
  
  '/project-development': {
    menuLink: '/project-development',
    requiresOperations: true
  },
  
  '/projects-deployments': {
    menuLink: '/projects-deployments',
    requiresOperations: true
  },
  
  '/projects-procurements': {
    menuLink: '/projects-procurements',
    requiresOperations: true
  },
  
  // ===== TEAMS =====
  '/teams': {
    menuLink: '/teams',
    requiresOperations: true
  },
  
  '/teams-center': {
    menuLink: '/teams-center'
  },
  
  // ===== UTILITIES =====
  '/calendar': {
    menuLink: '/calendar'
  },
  
  '/kanban': {
    menuLink: '/kanban'
  },
  
  '/kanban-alt': {
    menuLink: '/kanban-alt'
  },
  
  '/show-flow': {
    menuLink: '/show-flow'
  },
  
  '/resource-monitor': {
    menuLink: '/resource-monitor'
  },
  
  '/file-archives': {
    moduleCode: 'FILE_MODULE',
    requiredPermission: 'view'
  },
  
  '/audit-trail': {
    menuLink: '/audit-trail'
  },
  
  // ===== WORKSPACE =====
  '/workspace': {
    menuLink: '/workspace'
  },
  
  '/workspace/development': {
    menuLink: '/workspace'
  },
  
  '/workspace/testing': {
    menuLink: '/workspace'
  },
  
  '/workspace/deployment': {
    menuLink: '/workspace'
  },
  
  // ===== ALWAYS ACCESSIBLE (Authenticated) =====
  '/profile': { 
    alwaysAllow: true,
    requiresAuth: true 
  },
  
  '/change-password': { 
    alwaysAllow: true,
    requiresAuth: true 
  },
  
  '/coming-soon': { 
    alwaysAllow: true,
    requiresAuth: true 
  },
  
  '/settings': { 
    alwaysAllow: true,
    requiresAuth: true 
  },
  
  '/dropzone': { 
    alwaysAllow: true,
    requiresAuth: true 
  }
};
