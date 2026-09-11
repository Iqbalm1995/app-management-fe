"use client";

import { useMemo } from "react";
import { AuthDataResponse } from "./useAuthentications";
import { UserAccessResponse } from "./useSysModuleGroup";
import { CabCommitteeMember, CabRequestDetail, CabRequestItem } from "../types/cabTypes";

export interface CabUserPermissions {
  // Aggregate Permissions (Maker / Reviewer / Approver)
  isMaker: boolean;
  isReviewer: boolean;
  isApprover: boolean;

  // Granular Action Permissions
  canCreateCab: boolean;
  canSendToApproval: boolean;
  canApproveOrReject: boolean;

  // Contextual Ownership & Committee Assignment
  isOwner: (requesterIdOrName?: string | null) => boolean;
  isAssignedCommittee: (committees?: CabCommitteeMember[] | null) => boolean;
}

/**
 * Custom hook to automatically resolve and aggregate CAB user authorization
 * based on current logged-in user (DataAuth) and Access Data (aggregatedPermissions).
 */
export const useCabAuthorization = (
  authData: AuthDataResponse | null,
  cabContext?: CabRequestDetail | CabRequestItem | null
): CabUserPermissions => {
  const permissions = useMemo<CabUserPermissions>(() => {
    // 1. Retrieve aggregated access data from localStorage (cached from GetMyAccess)
    let accessData: UserAccessResponse | null = null;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("accessData");
        if (cached) {
          accessData = JSON.parse(cached);
        }
      } catch (err) {
        console.error("Failed to parse accessData in useCabAuthorization:", err);
      }
    }

    const isApprovalFlag =
      String(authData?.isApproval || "").toUpperCase() === "Y" ||
      String(authData?.isApproval || "") === "1" ||
      String(authData?.isApproval || "").toLowerCase() === "true";

    // 2. Automatic Role Resolution
    // Maker: aggregated permission canMake === true, or any authenticated user by default
    const isMaker =
      accessData?.aggregatedPermissions?.canMake !== undefined
        ? Boolean(accessData.aggregatedPermissions.canMake)
        : Boolean(authData);

    // Reviewer: aggregated permission canReview === true
    const isReviewer = Boolean(accessData?.aggregatedPermissions?.canReview);

    // Approver: aggregated permission canApprove === true OR authData.isApproval is Y
    const isApprover =
      Boolean(accessData?.aggregatedPermissions?.canApprove) || isApprovalFlag;

    // 3. Document Ownership Resolver
    const isOwner = (requesterIdOrName?: string | null): boolean => {
      if (!authData || !requesterIdOrName) return false;
      const target = requesterIdOrName.toLowerCase().trim();
      const myId = String(authData.userId || authData.id || "").toLowerCase().trim();
      const myUsername = String(authData.username || "").toLowerCase().trim();
      const myName = String(authData.nama || "").toLowerCase().trim();
      const myEmail = String(authData.email || authData.userEmail || "").toLowerCase().trim();

      return (
        target === myId ||
        target === myUsername ||
        target === myName ||
        target === myEmail ||
        target.includes(myName) ||
        myName.includes(target)
      );
    };

    // 4. Assigned Committee Resolver
    const isAssignedCommittee = (committees?: CabCommitteeMember[] | null): boolean => {
      if (!authData || !committees || committees.length === 0) return false;
      const myId = String(authData.userId || authData.id || "").toLowerCase().trim();
      const myUsername = String(authData.username || "").toLowerCase().trim();
      const myName = String(authData.nama || "").toLowerCase().trim();

      return committees.some((c) => {
        const cUserId = String(c.userId || "").toLowerCase().trim();
        const cUserName = String(c.userName || "").toLowerCase().trim();
        return (
          (cUserId && cUserId === myId) ||
          (cUserName && (cUserName === myUsername || cUserName === myName || cUserName.includes(myName)))
        );
      });
    };

    // 5. Context-based Action Permissions
    const canCreateCab = isMaker;
    const canSendToApproval = isMaker;

    const detailCommittees =
      (cabContext as CabRequestDetail)?.committeeCab ||
      (cabContext as any)?.committees ||
      (cabContext as any)?.CabRequestCommittees;

    const canApproveOrReject =
      isApprover || isAssignedCommittee(detailCommittees);

    return {
      isMaker,
      isReviewer,
      isApprover,
      canCreateCab,
      canSendToApproval,
      canApproveOrReject,
      isOwner,
      isAssignedCommittee,
    };
  }, [authData, cabContext]);

  return permissions;
};

export default useCabAuthorization;
