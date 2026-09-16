import {
  WORKLOAD_ESTIMATION_RULES,
  WorkloadRuleItem,
} from "@/app/constants/applicationConstants";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { SimulationMember, SimulationStage } from "../types";

export interface UserWorkloadRecord {
  userId: string;
  projectCount: number;
  projectNames: string[];
}

/**
 * Builds an in-memory index from the project list mapping each user to their
 * total active project count and assigned project names (0(1) lookup).
 */
export const buildWorkloadMap = (
  projects: ProjectDataResponse[]
): Map<string, UserWorkloadRecord> => {
  const map = new Map<string, UserWorkloadRecord>();

  if (!Array.isArray(projects)) return map;

  for (const proj of projects) {
    const pName = proj.projectName || proj.projectCode || "Untitled Project";
    if (Array.isArray(proj.userAssignment)) {
      for (const ua of proj.userAssignment) {
        // Collect user id from userData or direct fields
        const uid =
          ua.userData?.id ||
          ua.userData?.userId ||
          ua.userSysId ||
          ua.userId ||
          ua.id;
        if (!uid) continue;

        const existing = map.get(uid);
        if (existing) {
          if (!existing.projectNames.includes(pName)) {
            existing.projectCount += 1;
            existing.projectNames.push(pName);
          }
        } else {
          map.set(uid, {
            userId: uid,
            projectCount: 1,
            projectNames: [pName],
          });
        }
      }
    }
  }

  return map;
};

/**
 * Gets the corresponding JSON estimation rule based on a user's concurrent project count.
 */
export const getRuleForProjectCount = (projectCount: number): WorkloadRuleItem => {
  const rules = WORKLOAD_ESTIMATION_RULES.rules;
  if (projectCount <= 1) {
    return rules[0];
  }
  if (projectCount === 2) {
    return rules[1];
  }
  if (projectCount === 3) {
    return rules[2];
  }
  return rules[rules.length - 1]; // 4+ critical
};

/**
 * Calculates realistic buffer days for a given base duration and project count.
 * Formula: Extended Days = round(Base Duration * Overhead Factor)
 */
export const calculateRealisticBuffer = (
  baseDuration: number,
  projectCount: number
): { bufferDays: number; rule: WorkloadRuleItem } => {
  const rule = getRuleForProjectCount(projectCount);
  const dur = Math.max(1, baseDuration || 1);
  const bufferDays = Math.round(dur * rule.overheadFactor);
  return { bufferDays, rule };
};

export interface StageContentionAnalysis {
  hasContention: boolean;
  maxProjectCount: number;
  bottleneckMember: SimulationMember | null;
  suggestedBufferDays: number;
  primaryRule: WorkloadRuleItem;
  memberBreakdowns: Array<{
    member: SimulationMember;
    projectCount: number;
    bufferDays: number;
    rule: WorkloadRuleItem;
  }>;
}

/**
 * Evaluates multi-project contention across all assigned members of a stage.
 * Uses the critical path bottleneck member with team mitigation options.
 */
export const calculateStageContention = (
  baseDuration: number,
  members: SimulationMember[]
): StageContentionAnalysis => {
  if (!members || members.length === 0) {
    const defaultRule = WORKLOAD_ESTIMATION_RULES.rules[0];
    return {
      hasContention: false,
      maxProjectCount: 0,
      bottleneckMember: null,
      suggestedBufferDays: 0,
      primaryRule: defaultRule,
      memberBreakdowns: [],
    };
  }

  const breakdowns = members.map((m) => {
    const count = m.activeProjectCount ?? 1;
    const { bufferDays, rule } = calculateRealisticBuffer(baseDuration, count);
    return {
      member: m,
      projectCount: count,
      bufferDays,
      rule,
    };
  });

  // Find the bottleneck member (highest project count)
  let bottleneck = breakdowns[0];
  for (const b of breakdowns) {
    if (b.projectCount > bottleneck.projectCount) {
      bottleneck = b;
    }
  }

  const hasContention = bottleneck.projectCount >= 2;

  return {
    hasContention,
    maxProjectCount: bottleneck.projectCount,
    bottleneckMember: bottleneck.member,
    suggestedBufferDays: bottleneck.bufferDays,
    primaryRule: bottleneck.rule,
    memberBreakdowns: breakdowns,
  };
};

/**
 * Summary totals across all stages for the Timeline Simulation sidebar and metrics overview.
 */
export const calculateSimulationContentionTotals = (
  stages: SimulationStage[]
) => {
  let totalBaseDays = 0;
  let totalExtendedDays = 0;
  const highLoadMembers = new Map<string, { member: SimulationMember; count: number }>();
  let stagesWithBufferCount = 0;

  for (const s of stages) {
    const base = s.durationDays || 0;
    const ext = s.extendedDays || 0;
    totalBaseDays += base;
    totalExtendedDays += ext;
    if (ext > 0) stagesWithBufferCount++;

    if (Array.isArray(s.members)) {
      for (const m of s.members) {
        const pCount = m.activeProjectCount || 1;
        if (pCount >= 2) {
          highLoadMembers.set(m.id, { member: m, count: pCount });
        }
      }
    }
  }

  const totalEffectiveDays = totalBaseDays + totalExtendedDays;

  return {
    totalBaseDays,
    totalExtendedDays,
    totalEffectiveDays,
    stagesWithBufferCount,
    overloadedMembers: Array.from(highLoadMembers.values()),
  };
};
