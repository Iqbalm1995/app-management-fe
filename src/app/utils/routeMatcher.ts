/**
 * Route Matcher Utility
 * Helper functions for matching routes and patterns
 */

import { UserMenuResponse } from "../services/useSysModuleGroup";
import { DynamicRoutePattern } from "../config/specialRoutesConfig";

/**
 * Match a route pattern with :id placeholders against actual path
 * Example: matchPattern('/users/:id/edit', '/users/123/edit') => true
 */
export const matchPattern = (pattern: string, path: string): boolean => {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    if (part.startsWith(':')) {
      return true; // :id, :code, etc. match anything
    }
    return part === pathParts[index];
  });
};

/**
 * Flatten hierarchical menu structure to flat array
 */
export const flattenMenus = (menus: UserMenuResponse[]): UserMenuResponse[] => {
  const result: UserMenuResponse[] = [];
  
  const flatten = (items: UserMenuResponse[]) => {
    items.forEach(item => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        flatten(item.children);
      }
    });
  };
  
  flatten(menus);
  return result;
};

/**
 * Check if current path matches any accessible menu
 * Considers isOperations flag for child path matching
 */
export const matchesMenuPath = (
  currentPath: string,
  menus: UserMenuResponse[]
): { matched: boolean; menu?: UserMenuResponse } => {
  const flatMenus = flattenMenus(menus);
  
  for (const menu of flatMenus) {
    // Strip query params from menu link for comparison
    const cleanMenuLink = menu.menuLink.split('?')[0];
    
    // Exact match
    if (currentPath === cleanMenuLink) {
      return { matched: true, menu };
    }
    
    // If menu has operations enabled, check if current path starts with menu link
    if (menu.isOperations === 'Y' && currentPath.startsWith(cleanMenuLink)) {
      return { matched: true, menu };
    }
  }
  
  return { matched: false };
};

/**
 * Find matching dynamic route pattern
 */
export const findDynamicPattern = (
  currentPath: string,
  patterns: DynamicRoutePattern[]
): DynamicRoutePattern | null => {
  for (const pattern of patterns) {
    if (matchPattern(pattern.pattern, currentPath)) {
      return pattern;
    }
  }
  return null;
};
