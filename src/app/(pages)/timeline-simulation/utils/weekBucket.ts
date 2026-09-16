// Timeline Simulation — pure date & week-bucketing helpers.
// Kept dependency-light (date-fns only) and side-effect free so the logic is
// unit-testable in isolation.

import {
  differenceInCalendarDays,
  addDays,
  parseISO,
  isValid,
  format,
  startOfMonth,
  eachMonthOfInterval,
} from "date-fns";

import { MonthWeekBucket } from "../types";

/** Parse a yyyy-MM-dd string safely. Returns null when invalid/empty. */
export const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const dateStr = value.includes("T") ? value.slice(0, 10) : value.trim();
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : null;
};

/** Format a Date back to the canonical yyyy-MM-dd string. */
export const toDateString = (date: Date): string => format(date, "yyyy-MM-dd");

/**
 * Duration in days.
 * When start is 1 Jan and end is 9 Jan, duration is 8 days (9 - 1 = 8).
 * Returns null when either date is missing/invalid or end precedes start.
 */
export const computeDuration = (
  startDate: string | null,
  endDate: string | null
): number | null => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return null;
  const diff = differenceInCalendarDays(end, start);
  if (diff < 0) return null;
  return diff;
};

/**
 * End date derived from start date and duration in days.
 * Example: start date 1 Jan + duration 8 days -> end date 9 Jan.
 * Returns null on invalid input.
 */
export const computeEndDate = (
  startDate: string | null,
  durationDays: number | null
): string | null => {
  const start = parseDate(startDate);
  if (!start || durationDays == null || durationDays < 0) return null;
  return toDateString(addDays(start, durationDays));
};

/**
 * Map a single date to its month + 4-week bucket.
 * Weeks are defined as fixed calendar thirds-of-month:
 *   day 1-7 -> W1, 8-14 -> W2, 15-21 -> W3, 22+ -> W4.
 * This yields exactly four buckets per month as required by the spec.
 */
export const dateToWeekBucket = (
  value: string | null
): MonthWeekBucket | null => {
  const date = parseDate(value);
  if (!date) return null;
  const day = date.getDate();
  const week = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4;
  const monthKey = format(date, "yyyy-MM");
  const monthLabel = format(date, "MMM yyyy");
  return {
    monthKey,
    monthLabel,
    week,
    label: `${monthLabel} · W${week}`,
  };
};

/**
 * Build the ordered list of month/4-week buckets spanning [minDate, maxDate].
 * Always emits W1..W4 for every month in range so the axis is uniform.
 * Returns an empty array when the range is invalid.
 */
export const buildMonthWeekAxis = (
  minDate: string | null,
  maxDate: string | null
): MonthWeekBucket[] => {
  const start = parseDate(minDate);
  const end = parseDate(maxDate);
  if (!start || !end || end < start) return [];

  const months = eachMonthOfInterval({
    start: startOfMonth(start),
    end: startOfMonth(end),
  });

  const buckets: MonthWeekBucket[] = [];
  for (const month of months) {
    const monthKey = format(month, "yyyy-MM");
    const monthLabel = format(month, "MMM yyyy");
    for (let week = 1; week <= 4; week++) {
      buckets.push({
        monthKey,
        monthLabel,
        week,
        label: `${monthLabel} · W${week}`,
      });
    }
  }
  return buckets;
};

/**
 * Compute the overall [min, max] date range across a set of stages.
 * Ignores stages without both dates. Returns nulls when no datable stage.
 */
export const computeStagesDateRange = (
  stages: { startDate: string | null; endDate: string | null }[]
): { min: string | null; max: string | null } => {
  let min: Date | null = null;
  let max: Date | null = null;
  for (const stage of stages) {
    const s = parseDate(stage.startDate);
    const e = parseDate(stage.endDate);
    if (s && (!min || s < min)) min = s;
    if (e && (!max || e > max)) max = e;
  }
  return {
    min: min ? toDateString(min) : null,
    max: max ? toDateString(max) : null,
  };
};

/**
 * Automatically calculates sequential start & end dates for a list of stages.
 * If a stage already has valid start & end dates, preserves them and advances the date pointer.
 * If a stage lacks dates, cascades sequentially using durationDays (or default template duration).
 */
export const autoScheduleStages = <
  T extends {
    stageName: string;
    startDate: string | null;
    endDate: string | null;
    durationDays: number | null;
  }
>(
  stages: T[],
  baseStartDate?: string | null
): T[] => {
  const todayStr = toDateString(new Date());
  let currentStart = baseStartDate || todayStr;

  return stages.map((stage) => {
    if (stage.startDate && stage.endDate) {
      const parsedStart = parseDate(stage.startDate);
      const parsedEnd = parseDate(stage.endDate);
      if (parsedStart && parsedEnd && parsedEnd >= parsedStart) {
        currentStart = toDateString(addDays(parsedEnd, 1));
        return stage;
      }
    }

    const duration =
      stage.durationDays && stage.durationDays >= 1
        ? stage.durationDays
        : 7;

    const start = stage.startDate || currentStart;
    const end = computeEndDate(start, duration) || start;

    const parsedEnd = parseDate(end);
    if (parsedEnd) {
      currentStart = toDateString(addDays(parsedEnd, 1));
    }

    return {
      ...stage,
      startDate: start,
      endDate: end,
      durationDays: duration,
    };
  });
};

/** A month grouping containing its sequence number ("Bulan 1") and its 4 week buckets. */
export interface MonthGroup {
  monthIndex: number;
  displayNumber: number; // 1-based (Bulan 1, Bulan 2...)
  monthKey: string; // "yyyy-MM"
  monthLabel: string; // "Sep 2026"
  weeks: MonthWeekBucket[];
}

/** Group a flat list of 4-week month buckets into ordered MonthGroup objects. */
export const groupAxisByMonth = (axis: MonthWeekBucket[]): MonthGroup[] => {
  const map = new Map<string, MonthGroup>();
  let monthCounter = 1;

  for (const bucket of axis) {
    if (!map.has(bucket.monthKey)) {
      map.set(bucket.monthKey, {
        monthIndex: monthCounter - 1,
        displayNumber: monthCounter++,
        monthKey: bucket.monthKey,
        monthLabel: bucket.monthLabel,
        weeks: [],
      });
    }
    map.get(bucket.monthKey)!.weeks.push(bucket);
  }

  return Array.from(map.values());
};

