/**
 * Route Access Configuration
 * Maps routes to their access requirements (menu-based or module-based)
 * Auto-generated from LinkItems in menuApplication.ts
 */

import { LinkItems, LinkItemProps } from "../constants/menuApplication";

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
 * Generate route access map from LinkItems
 */
const generateRouteAccessMap = (): Record<string, RouteAccessRule> => {
  const map: Record<string, RouteAccessRule> = {};
  
  const processItem = (item: LinkItemProps) => {
    // Skip coming-soon and pro features
    if (item.link === '/coming-soon' || item.isPro) {
      return;
    }
    
    // Strip query params from link to get clean path
    const cleanLink = item.link.split('?')[0];
    
    // Add the item's link (without query params)
    map[cleanLink] = {
      menuLink: cleanLink,
      requiresOperations: true
    };
    
    // Process children recursively
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => processItem(child));
    }
  };
  
  // Process all LinkItems
  LinkItems.forEach(item => processItem(item));
  
  // Add special routes that need custom configuration
  map['/profile'] = { alwaysAllow: true, requiresAuth: true };
  map['/change-password'] = { alwaysAllow: true, requiresAuth: true };
  map['/settings'] = { alwaysAllow: true, requiresAuth: true };
  
  return map;
};

/**
 * Route Access Map
 * Auto-generated from LinkItems in menuApplication.ts
 */
export const routeAccessMap: Record<string, RouteAccessRule> = generateRouteAccessMap();
