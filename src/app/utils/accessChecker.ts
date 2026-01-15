/**
 * Access Checker Utility
 * Core logic for checking user access to routes
 */

import {
  UserAccessResponse,
  UserMenuResponse,
  UserModuleResponse,
} from "../services/useSysModuleGroup";
import { RouteAccessRule } from "../config/routeAccessConfig";
import { matchesMenuPath } from "./routeMatcher";

/**
 * Check if user has access to a specific menu
 */
export const checkMenuAccess = (
  menuLink: string,
  requiresOperations: boolean,
  currentPath: string,
  accessibleMenus: UserMenuResponse[]
): boolean => {
  const { matched, menu } = matchesMenuPath(currentPath, accessibleMenus);
  
  if (!matched || !menu) {
    return false;
  }
  
  // If exact match with menu link
  if (menu.menuLink === menuLink) {
    if (requiresOperations) {
      // Check if menu has operations enabled
      return menu.isOperations === 'Y';
    }
    return true;
  }
  
  // If current path is child of menu link
  if (currentPath.startsWith(menuLink) && menu.menuLink === menuLink) {
    return menu.isOperations === 'Y';
  }
  
  return false;
};

/**
 * Check if user has module access with specific permission
 */
export const checkModuleAccess = (
  moduleCode: string,
  permission: 'make' | 'review' | 'approve' | 'view' | undefined,
  accessibleModules: UserModuleResponse[]
): boolean => {
  const module = accessibleModules.find(m => m.modCode === moduleCode);
  
  if (!module) {
    return false;
  }
  
  // If just checking view access (module exists)
  if (!permission || permission === 'view') {
    return true;
  }
  
  // Check if any auth group has the required permission
  return module.authGroups.some(ag => {
    switch (permission) {
      case 'make':
        return ag.canMake === true;
      case 'review':
        return ag.canReview === true;
      case 'approve':
        return ag.canApprove === true;
      default:
        return false;
    }
  });
};

/**
 * Check aggregated permission
 */
export const checkAggregatedPermission = (
  permission: 'make' | 'review' | 'approve',
  accessData: UserAccessResponse
): boolean => {
  switch (permission) {
    case 'make':
      return accessData.aggregatedPermissions.canMake === true;
    case 'review':
      return accessData.aggregatedPermissions.canReview === true;
    case 'approve':
      return accessData.aggregatedPermissions.canApprove === true;
    default:
      return false;
  }
};

/**
 * Check route access based on rule
 */
export const checkRouteAccess = (
  rule: RouteAccessRule,
  currentPath: string,
  accessData: UserAccessResponse
): boolean => {
  console.log('[checkRouteAccess] Rule:', rule);
  console.log('[checkRouteAccess] Current path:', currentPath);
  
  // Always allow if specified
  if (rule.alwaysAllow) {
    console.log('[checkRouteAccess] Always allow - TRUE');
    return true;
  }
  
  // Check menu-based access
  if (rule.menuLink) {
    const result = checkMenuAccess(
      rule.menuLink,
      rule.requiresOperations || false,
      currentPath,
      accessData.accessibleMenus
    );
    console.log('[checkRouteAccess] Menu access result:', result);
    console.log('[checkRouteAccess] Accessible menus:', accessData.accessibleMenus.map(m => m.menuLink));
    return result;
  }
  
  // Check module-based access
  if (rule.moduleCode) {
    const result = checkModuleAccess(
      rule.moduleCode,
      rule.requiredPermission,
      accessData.accessibleModules
    );
    console.log('[checkRouteAccess] Module access result:', result);
    return result;
  }
  
  console.log('[checkRouteAccess] No rule matched - FALSE');
  return false;
};
