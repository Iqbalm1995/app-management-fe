/**
 * Access Control Hook
 * Main hook for checking route access in components
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserAccessResponse } from "../services/useSysModuleGroup";
import {
  publicRoutes,
  authenticatedOnlyRoutes,
  routeRedirects,
  moduleOnlyRoutes,
  aggregatedPermissionRoutes,
  dynamicRoutePatterns,
  anyMenuAccessRoutes,
} from "../config/specialRoutesConfig";
import { routeAccessMap } from "../config/routeAccessConfig";
import {
  checkRouteAccess,
  checkModuleAccess,
  checkAggregatedPermission,
} from "../utils/accessChecker";
import { findDynamicPattern, matchesMenuPath, flattenMenus } from "../utils/routeMatcher";

export interface AccessControlResult {
  hasAccess: boolean;
  isLoading: boolean;
  redirectTo?: string;
}

export const useAccessControl = (isAuthenticated: boolean, isAuthLoading: boolean): AccessControlResult => {
  const pathname = usePathname();
  const [result, setResult] = useState<AccessControlResult>({
    hasAccess: false,
    isLoading: true,
  });
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const checkAccess = async () => {
      setResult({ hasAccess: false, isLoading: true });

      // Strip query params from pathname for comparison
      const cleanPath = pathname.split('?')[0];
      
      console.log('=== ACCESS CONTROL START ===');
      console.log('[Access Control] Original pathname:', pathname);
      console.log('[Access Control] Clean path:', cleanPath);
      console.log('[Access Control] isAuthLoading:', isAuthLoading);

      // Wait for auth to finish loading
      if (isAuthLoading) {
        console.log('[Access Control] Waiting for auth to load...');
        return;
      }

      // 1. Check if route is public
      if (publicRoutes.includes(cleanPath)) {
        console.log('[Access Control] Step 1 - Public route ALLOW');
        setResult({ hasAccess: true, isLoading: false });
        return;
      }

      // 2. Check if user is authenticated
      if (!isAuthenticated) {
        console.log('[Access Control] Step 2 - Not authenticated DENY');
        setResult({
          hasAccess: false,
          isLoading: false,
          redirectTo: "/landing",
        });
        return;
      }

      // 3. Check route redirects
      const redirect = routeRedirects[cleanPath];
      if (redirect) {
        console.log('[Access Control] Step 3 - Redirect to:', redirect.authenticated);
        setResult({
          hasAccess: false,
          isLoading: false,
          redirectTo: redirect.authenticated,
        });
        return;
      }

      // 4. Check authenticated-only routes
      if (authenticatedOnlyRoutes.includes(cleanPath)) {
        console.log('[Access Control] Step 4 - Authenticated-only route ALLOW');
        setResult({ hasAccess: true, isLoading: false });
        return;
      }

      // 5. Get access data from localStorage
      const accessDataStr = localStorage.getItem("accessData");
      if (!accessDataStr) {
        console.log('[Access Control] Step 5 - No accessData');
        
        // Before redirecting, check if this route is in a whitelist that would need accessData
        // If it is, we should retry instead of redirecting immediately
        const isInDynamicPatterns = findDynamicPattern(cleanPath, dynamicRoutePatterns) !== null;
        const isInModuleRoutes = moduleOnlyRoutes[cleanPath] !== undefined;
        const isInAggregatedRoutes = aggregatedPermissionRoutes[cleanPath] !== undefined;
        const isInAnyMenuRoutes = anyMenuAccessRoutes.includes(cleanPath);
        const isInRouteAccessMap = routeAccessMap[cleanPath] !== undefined;
        
        const isWhitelisted = isInDynamicPatterns || isInModuleRoutes || isInAggregatedRoutes || isInAnyMenuRoutes || isInRouteAccessMap;
        
        console.log('[Access Control] Route whitelist check:', {
          isInDynamicPatterns,
          isInModuleRoutes,
          isInAggregatedRoutes,
          isInAnyMenuRoutes,
          isInRouteAccessMap,
          isWhitelisted
        });
        
        // Check if user has auth data (authenticated)
        const authDataStr = localStorage.getItem("authData");
        const tokenData = localStorage.getItem("tokenData");
        
        if (authDataStr && tokenData && isWhitelisted && retryCount < MAX_RETRIES) {
          // User is authenticated and route is whitelisted but accessData is missing
          // Retry after a short delay to allow data to load
          console.log(`[Access Control] Whitelisted route - Retry ${retryCount + 1}/${MAX_RETRIES} - waiting for accessData`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 500);
          return;
        }
        
        // After max retries or no auth data or not whitelisted, redirect to landing
        console.log('[Access Control] No accessData after retries - redirect to landing');
        setResult({
          hasAccess: false,
          isLoading: false,
          redirectTo: "/landing",
        });
        return;
      }
      
      // Reset retry count if accessData is found
      if (retryCount > 0) {
        setRetryCount(0);
      }

      let accessData: UserAccessResponse;
      try {
        accessData = JSON.parse(accessDataStr);
      } catch (error) {
        console.error('[Access Control] Step 5 - Failed to parse accessData, redirect to landing');
        setResult({
          hasAccess: false,
          isLoading: false,
          redirectTo: "/landing",
        });
        return;
      }
      
      console.log('[Access Control] Step 5 - AccessData loaded');

      // 6. FIRST: Check if route matches user's accessible menus (EXACT MATCH)
      const flatMenus = flattenMenus(accessData.accessibleMenus);
      const exactMenuMatch = flatMenus.some(menu => {
        const cleanMenuLink = menu.menuLink.split('?')[0];
        return cleanMenuLink === cleanPath;
      });
      if (exactMenuMatch) {
        console.log('[Access Control] Step 6 - Exact menu match ALLOW');
        setResult({ hasAccess: true, isLoading: false });
        return;
      }

      // 7. Check aggregated permission routes
      const aggregatedPermission = aggregatedPermissionRoutes[cleanPath];
      if (aggregatedPermission) {
        console.log('[Access Control] Step 6 - Checking aggregated permission:', aggregatedPermission);
        const hasPermission = checkAggregatedPermission(
          aggregatedPermission,
          accessData
        );
        setResult({
          hasAccess: hasPermission,
          isLoading: false,
          redirectTo: hasPermission ? undefined : "/forbidden",
        });
        return;
      }

      // 7. Check module-only routes
      const moduleRoute = moduleOnlyRoutes[cleanPath];
      if (moduleRoute) {
        console.log('[Access Control] Step 7 - Checking module-only route:', moduleRoute.moduleCode);
        const hasAccess = checkModuleAccess(
          moduleRoute.moduleCode,
          moduleRoute.permission,
          accessData.accessibleModules
        );
        setResult({
          hasAccess,
          isLoading: false,
          redirectTo: hasAccess ? undefined : "/forbidden",
        });
        return;
      }

      // 8. Check dynamic route patterns
      const dynamicPattern = findDynamicPattern(cleanPath, dynamicRoutePatterns);
      if (dynamicPattern) {
        console.log('[Access Control] Step 8 - Dynamic pattern matched:', dynamicPattern);
        let hasAccess = false;

        // Check if user has the required menu
        if (dynamicPattern.baseMenu) {
          const flatMenus = flattenMenus(accessData.accessibleMenus);
          const hasMenu = flatMenus.some(menu => menu.menuLink.startsWith(dynamicPattern.baseMenu!));
          console.log('[Access Control] Base menu check:', dynamicPattern.baseMenu, 'Result:', hasMenu);
          
          if (!hasMenu) {
            hasAccess = false;
          } else if (dynamicPattern.permission) {
            // Check aggregated permission (single or multiple)
            const permissions = Array.isArray(dynamicPattern.permission) 
              ? dynamicPattern.permission 
              : [dynamicPattern.permission];
            
            hasAccess = permissions.some(perm => checkAggregatedPermission(perm, accessData));
            console.log('[Access Control] Permission check:', permissions, 'Result:', hasAccess);
          } else {
            // No permission required, just menu access
            hasAccess = true;
          }
        } else if (dynamicPattern.moduleCode) {
          // Only check module if no baseMenu specified
          console.log('[Access Control] Checking module:', dynamicPattern.moduleCode);
          
          if (dynamicPattern.permission && Array.isArray(dynamicPattern.permission)) {
            // Multiple permissions - check if user has any
            hasAccess = dynamicPattern.permission.some(perm => 
              checkModuleAccess(dynamicPattern.moduleCode!, perm, accessData.accessibleModules)
            );
          } else {
            // Single permission or no permission
            hasAccess = checkModuleAccess(
              dynamicPattern.moduleCode,
              Array.isArray(dynamicPattern.permission) ? undefined : dynamicPattern.permission,
              accessData.accessibleModules
            );
          }
          console.log('[Access Control] Module access result:', hasAccess);
        }

        setResult({
          hasAccess,
          isLoading: false,
          redirectTo: hasAccess ? undefined : "/forbidden",
        });
        return;
      }

      // 9. Check any menu access routes
      if (anyMenuAccessRoutes.includes(cleanPath)) {
        console.log('[Access Control] Step 9 - Any menu access route');
        const hasAnyMenu = accessData.accessibleMenus.length > 0;
        setResult({
          hasAccess: hasAnyMenu,
          isLoading: false,
          redirectTo: hasAnyMenu ? undefined : "/forbidden",
        });
        return;
      }

      // 10. Check route access map
      const routeRule = routeAccessMap[cleanPath];
      if (routeRule) {
        console.log('[Access Control] Step 10 - Route access map matched:', routeRule);
        const hasAccess = checkRouteAccess(routeRule, cleanPath, accessData);
        setResult({
          hasAccess,
          isLoading: false,
          redirectTo: hasAccess ? undefined : "/forbidden",
        });
        return;
      }
      
      console.log('[Access Control] Reached step 11 - Final fallback');

      // 11. Check if route matches any accessible menu (FINAL FALLBACK)
      console.log('[Access Control] Step 11 - Final menu check');
      console.log('[Access Control] Clean path:', cleanPath);
      console.log('[Access Control] All accessible menus:', accessData.accessibleMenus.map(m => m.menuLink));
      
      const { matched } = matchesMenuPath(cleanPath, accessData.accessibleMenus);
      console.log('[Access Control] matchesMenuPath result:', matched);
      
      // If not matched by path, check exact menu link match
      if (!matched) {
        const flatMenus = flattenMenus(accessData.accessibleMenus);
        console.log('[Access Control] Flat menus:', flatMenus.map(m => m.menuLink));
        const exactMatch = flatMenus.some(menu => {
          const cleanMenuLink = menu.menuLink.split('?')[0];
          return cleanMenuLink === cleanPath;
        });
        console.log('[Access Control] Exact match result:', exactMatch);
        setResult({
          hasAccess: exactMatch,
          isLoading: false,
          redirectTo: exactMatch ? undefined : "/forbidden",
        });
        return;
      }
      
      console.log('[Access Control] ALLOW - matched by path');
      setResult({
        hasAccess: matched,
        isLoading: false,
        redirectTo: matched ? undefined : "/forbidden",
      });
    };

    checkAccess();
  }, [pathname, isAuthenticated, isAuthLoading, retryCount]);

  return result;
};
