import { SimulationStage, ActivityType } from "../types";
import { WORKLOAD_ESTIMATION_RULES } from "@/app/constants/applicationConstants";
import {
  autoScheduleStages,
  buildMonthWeekAxis,
  computeStagesDateRange,
  computeDuration,
  dateToWeekBucket,
  groupAxisByMonth,
  MonthWeekBucket,
} from "./weekBucket";

export interface ExportTimelineSimulationPdfOptions {
  simulationName: string;
  activityType: ActivityType;
  projectName?: string | null;
  stages: SimulationStage[];
  generatedBy?: string;
  totalDays: number;
  visualizationMode?: "gantt" | "timeline";
  elementId?: string;
  isDark?: boolean;
  contentionTotals?: {
    totalBaseDays?: number;
    totalExtendedDays?: number;
    totalBufferDays?: number;
    totalEffectiveDays?: number;
    stagesWithBufferCount?: number;
    contendedStagesCount?: number;
    overloadedMembers?: Array<unknown>;
  };
}

const BRAND_BLUE: [number, number, number] = [0, 87, 173]; // Bank bjb primary blue #0057ad
const BRAND_NAVY: [number, number, number] = [0, 50, 107]; // Deep navy #00326b
const ACCENT_ORANGE: [number, number, number] = [221, 107, 32]; // Contention warning #dd6b20
const BG_LIGHT: [number, number, number] = [248, 250, 252];
const TEXT_DARK: [number, number, number] = [30, 41, 59];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const BORDER_COLOR: [number, number, number] = [226, 232, 240];

const CHEVRON_PALETTE: Array<{ rgb: [number, number, number]; hex: string }> = [
  { rgb: [229, 62, 62], hex: "#E53E3E" },
  { rgb: [0, 163, 196], hex: "#00A3C4" },
  { rgb: [221, 107, 32], hex: "#DD6B20" },
  { rgb: [214, 158, 46], hex: "#D69E2E" },
  { rgb: [56, 161, 105], hex: "#38A169" },
  { rgb: [213, 63, 140], hex: "#D53F8C" },
  { rgb: [49, 130, 206], hex: "#3182CE" },
  { rgb: [128, 90, 213], hex: "#805AD5" },
];

/** Truncate text to fit max width in mm */
function fitText(
  doc: { getTextWidth: (t: string) => number },
  text: string,
  maxWidth: number
): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && doc.getTextWidth(t + "…") > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

// ── 1. Vector Gantt Chart Renderer ──────────────────────────────────────────
function drawGanttChart(
  doc: any,
  stages: SimulationStage[],
  axis: MonthWeekBucket[],
  contentX: number,
  contentY: number,
  contentW: number,
  availableH: number
): void {
  const monthGroups = groupAxisByMonth(axis);
  const totalWeeks = Math.max(axis.length, 1);

  // Column width calculations
  let colNo = 8;
  let colName = 48;
  let colParty = 38;
  let colDur = 16;

  let fixedW = colNo + colName + colParty + colDur;
  let remainingW = contentW - fixedW;
  let weekColW = remainingW / totalWeeks;

  // If too many weeks, compress fixed columns slightly
  if (weekColW < 6.5) {
    colNo = 7;
    colName = 40;
    colParty = 30;
    colDur = 14;
    fixedW = colNo + colName + colParty + colDur;
    remainingW = contentW - fixedW;
    weekColW = remainingW / totalWeeks;
  }

  const headerH1 = 6;
  const headerH2 = 5;
  const totalHeaderH = headerH1 + headerH2;

  // Determine row height dynamically based on stage count
  const maxRows = Math.max(stages.length, 1);
  const targetRowH = Math.min(8, Math.max(5, (availableH - totalHeaderH - 6) / maxRows));
  const rowH = targetRowH;

  const tableTopY = contentY;
  const gridStartX = contentX + fixedW;

  // ── Header Tier 1: Fixed Column Headers + Month Groups ──
  // Header Tier 1 background for fixed columns
  doc.setFillColor(13, 71, 161); // Primary dark blue
  doc.rect(contentX, tableTopY, fixedW, totalHeaderH, "F");

  // Dividers in fixed header
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(contentX + colNo, tableTopY, contentX + colNo, tableTopY + totalHeaderH);
  doc.line(contentX + colNo + colName, tableTopY, contentX + colNo + colName, tableTopY + totalHeaderH);
  doc.line(contentX + fixedW - colDur, tableTopY, contentX + fixedW - colDur, tableTopY + totalHeaderH);

  // Fixed Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  doc.text("No", contentX + colNo / 2, tableTopY + totalHeaderH / 2 + 1, { align: "center" });
  doc.text("Aktivitas / Stage", contentX + colNo + 3, tableTopY + totalHeaderH / 2 + 1);
  doc.text("Pihak Terlibat", contentX + colNo + colName + 3, tableTopY + totalHeaderH / 2 + 1);

  doc.text("Durasi", contentX + fixedW - colDur / 2, tableTopY + totalHeaderH / 2 - 0.5, { align: "center" });
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.text("(Hari)", contentX + fixedW - colDur / 2, tableTopY + totalHeaderH / 2 + 3, { align: "center" });

  // Month Groups
  let currentMonthX = gridStartX;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);

  monthGroups.forEach((mg) => {
    const mgW = mg.weeks.length * weekColW;
    doc.setFillColor(21, 101, 192); // Secondary blue
    doc.rect(currentMonthX, tableTopY, mgW, headerH1, "F");
    doc.setDrawColor(255, 255, 255);
    doc.rect(currentMonthX, tableTopY, mgW, headerH1, "S");

    const label = `Bulan ${mg.displayNumber} (${mg.monthLabel})`;
    doc.setTextColor(255, 255, 255);
    doc.text(fitText(doc, label, mgW - 2), currentMonthX + mgW / 2, tableTopY + 4, { align: "center" });
    currentMonthX += mgW;
  });

  // ── Header Tier 2: Week Columns (W1..W4) ──
  doc.setFontSize(6);
  axis.forEach((bucket, idx) => {
    const wx = gridStartX + idx * weekColW;
    doc.setFillColor(25, 118, 210); // Lighter blue
    doc.rect(wx, tableTopY + headerH1, weekColW, headerH2, "F");
    doc.setDrawColor(255, 255, 255);
    doc.rect(wx, tableTopY + headerH1, weekColW, headerH2, "S");

    doc.setTextColor(255, 255, 255);
    doc.text(`M${bucket.week}`, wx + weekColW / 2, tableTopY + headerH1 + 3.5, { align: "center" });
  });

  // ── Body Rows ──
  const indexOfDate = (dateVal: string | null): number => {
    const b = dateToWeekBucket(dateVal);
    if (!b) return -1;
    return axis.findIndex((a) => a.monthKey === b.monthKey && a.week === b.week);
  };

  stages.forEach((stage, idx) => {
    const rowY = tableTopY + totalHeaderH + idx * rowH;
    const isEven = idx % 2 === 1;

    // Row background
    if (isEven) {
      doc.setFillColor(...BG_LIGHT);
      doc.rect(contentX, rowY, contentW, rowH, "F");
    }

    // Row border line
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.15);
    doc.line(contentX, rowY + rowH, contentX + contentW, rowY + rowH);

    // Fixed Column Dividers
    doc.line(contentX + colNo, rowY, contentX + colNo, rowY + rowH);
    doc.line(contentX + colNo + colName, rowY, contentX + colNo + colName, rowY + rowH);
    doc.line(contentX + fixedW - colDur, rowY, contentX + fixedW - colDur, rowY + rowH);
    doc.line(contentX + fixedW, rowY, contentX + fixedW, rowY + rowH);

    // Text content
    doc.setTextColor(...TEXT_DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);

    // 1. No
    doc.text(String(idx + 1), contentX + colNo / 2, rowY + rowH / 2 + 1.2, { align: "center" });

    // 2. Aktivitas / Stage Name
    doc.setFont("helvetica", "bold");
    doc.text(fitText(doc, stage.stageName, colName - 4), contentX + colNo + 2, rowY + rowH / 2 + 1.2);

    // 3. Pihak Terlibat
    doc.setFont("helvetica", "normal");
    const partiesStr =
      stage.parties && stage.parties.length > 0
        ? stage.parties.map((p) => p.name).join(", ")
        : stage.members && stage.members.length > 0
        ? stage.members.map((m) => m.name).join(", ")
        : "—";
    doc.text(fitText(doc, partiesStr, colParty - 4), contentX + colNo + colName + 2, rowY + rowH / 2 + 1.2);

    // 4. Durasi
    const duration = stage.durationDays ?? computeDuration(stage.startDate, stage.endDate) ?? 1;
    doc.text(`${duration}d`, contentX + fixedW - colDur / 2, rowY + rowH / 2 + 1.2, { align: "center" });

    // Timeline Grid vertical lines
    axis.forEach((_, wIdx) => {
      const wx = gridStartX + wIdx * weekColW;
      doc.setDrawColor(238, 242, 246);
      doc.line(wx, rowY, wx, rowY + rowH);
    });

    // 5. Activity Gantt Bar
    const startIdx = indexOfDate(stage.startDate);
    const endIdx = indexOfDate(stage.endDate);
    const barStartCol = Math.max(0, startIdx >= 0 ? startIdx : 0);
    const barEndCol = Math.max(barStartCol, endIdx >= 0 ? endIdx : barStartCol);

    const barX = gridStartX + barStartCol * weekColW + 0.8;
    const barW = Math.max(2, (barEndCol - barStartCol + 1) * weekColW - 1.6);
    const barH = rowH - 2.4;
    const barY = rowY + 1.2;

    const palette = CHEVRON_PALETTE[idx % CHEVRON_PALETTE.length];
    doc.setFillColor(...palette.rgb);
    doc.roundedRect(barX, barY, barW, barH, 1, 1, "F");

    // Inside Bar Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    const barLabel = `${duration}d`;
    if (doc.getTextWidth(barLabel) < barW - 2) {
      doc.text(barLabel, barX + barW / 2, barY + barH / 2 + 1, { align: "center" });
    }

    // Contention buffer extension badge if extendedDays > 0
    if (stage.extendedDays && stage.extendedDays > 0) {
      const bufW = Math.max(6, weekColW * 0.7);
      const bufX = barX + barW + 1;
      if (bufX + bufW < contentX + contentW) {
        doc.setFillColor(...ACCENT_ORANGE);
        doc.roundedRect(bufX, barY + 0.4, bufW, barH - 0.8, 0.8, 0.8, "F");
        doc.setFontSize(4.5);
        doc.text(`+${stage.extendedDays}d`, bufX + bufW / 2, barY + barH / 2 + 0.8, { align: "center" });
      }
    }
  });

  // Outer border around whole Gantt table
  const totalTableH = totalHeaderH + stages.length * rowH;
  doc.setDrawColor(...BRAND_NAVY);
  doc.setLineWidth(0.3);
  doc.rect(contentX, tableTopY, contentW, totalTableH, "S");
}

// ── 2. Vector Chevron Timeline / Roadmap Renderer ───────────────────────────
function drawChevronTimeline(
  doc: any,
  stages: SimulationStage[],
  contentX: number,
  contentY: number,
  contentW: number,
  availableH: number
): void {
  const numStages = stages.length;
  if (numStages === 0) return;

  // Split into multiple horizontal rows if more than 7 stages to avoid cramping
  const stagesPerRow = numStages <= 7 ? numStages : Math.ceil(numStages / 2);
  const numRows = numStages <= 7 ? 1 : 2;

  const rowHeight = availableH / numRows;

  for (let r = 0; r < numRows; r++) {
    const rowStages = stages.slice(r * stagesPerRow, (r + 1) * stagesPerRow);
    const count = rowStages.length;
    if (count === 0) continue;

    const rY = contentY + r * rowHeight;
    const colW = contentW / count;
    const chevronH = 14;
    const arrowP = Math.min(5, colW * 0.18);
    const chevronY = rY + rowHeight / 2 - chevronH / 2;

    const cardH = Math.min(32, (rowHeight - chevronH) / 2 - 6);

    rowStages.forEach((stage, cIdx) => {
      const globalIdx = r * stagesPerRow + cIdx;
      const palette = CHEVRON_PALETTE[globalIdx % CHEVRON_PALETTE.length];
      const isFirst = cIdx === 0;
      const isLast = cIdx === count - 1;

      const chX = contentX + cIdx * colW;
      const chW = colW + (isLast ? 0 : arrowP);

      // ── Chevron Shape with doc.lines ──
      doc.setFillColor(...palette.rgb);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);

      let lines: number[][];
      if (isFirst && count === 1) {
        lines = [
          [chW, 0],
          [0, chevronH],
          [-chW, 0],
          [0, -chevronH],
        ];
      } else if (isFirst) {
        lines = [
          [chW - arrowP, 0],
          [arrowP, chevronH / 2],
          [-arrowP, chevronH / 2],
          [-(chW - arrowP), 0],
          [0, -chevronH],
        ];
      } else if (isLast) {
        lines = [
          [chW, 0],
          [0, chevronH],
          [-chW, 0],
          [arrowP, -chevronH / 2],
          [-arrowP, -chevronH / 2],
        ];
      } else {
        lines = [
          [chW - arrowP, 0],
          [arrowP, chevronH / 2],
          [-arrowP, chevronH / 2],
          [-(chW - arrowP), 0],
          [arrowP, -chevronH / 2],
          [-arrowP, -chevronH / 2],
        ];
      }

      doc.lines(lines, chX, chevronY, [1, 1], "FD", true);

      // Label inside chevron
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      const textX = chX + chW / 2 + (isFirst ? -arrowP / 2 : 0);
      doc.text(`STAGE ${stage.order + 1}`, textX, chevronY + chevronH / 2 + 1.2, { align: "center" });

      // ── Alternating Milestone Cards ──
      // Odd order = Top Card, Even order = Bottom Card
      const isTop = globalIdx % 2 === 0;
      const cardW = colW - 3;
      const cardX = chX + 1.5;
      const cardY = isTop ? chevronY - cardH - 4 : chevronY + chevronH + 4;

      // Dashed connector line between card and chevron
      doc.setDrawColor(...palette.rgb);
      doc.setLineWidth(0.4);
      (doc as any).setLineDashPattern?.([1, 1], 0);
      const connX = cardX + cardW / 2;
      if (isTop) {
        doc.line(connX, cardY + cardH, connX, chevronY);
      } else {
        doc.line(connX, chevronY + chevronH, connX, cardY);
      }
      (doc as any).setLineDashPattern?.([], 0); // reset dash

      // Card Box
      doc.setFillColor(...BG_LIGHT);
      doc.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, "F");
      doc.setDrawColor(...BORDER_COLOR);
      doc.setLineWidth(0.2);
      doc.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, "S");

      // Card top colored stripe
      doc.setFillColor(...palette.rgb);
      doc.roundedRect(cardX, cardY, cardW, 1.5, 1, 1, "F");

      // Card Header: Stage Name & Duration Badge
      const duration = stage.durationDays ?? computeDuration(stage.startDate, stage.endDate) ?? 1;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...BRAND_NAVY);
      doc.text(fitText(doc, stage.stageName, cardW - 16), cardX + 2, cardY + 5);

      // Duration pill badge
      doc.setFillColor(...palette.rgb);
      const durBadgeText = `${duration}d`;
      const durBadgeW = doc.getTextWidth(durBadgeText) + 3;
      doc.roundedRect(cardX + cardW - durBadgeW - 2, cardY + 2.5, durBadgeW, 3.5, 0.8, 0.8, "F");
      doc.setFontSize(5);
      doc.setTextColor(255, 255, 255);
      doc.text(durBadgeText, cardX + cardW - durBadgeW / 2 - 2, cardY + 5, { align: "center" });

      // Date Range
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...TEXT_MUTED);
      const datesStr = `${stage.startDate || "—"} - ${stage.endDate || "—"}`;
      doc.text(datesStr, cardX + 2, cardY + 9);

      // Assigned PIC / Members
      const membersText =
        stage.members && stage.members.length > 0
          ? stage.members.map((m) => m.name).join(", ")
          : stage.parties && stage.parties.length > 0
          ? stage.parties.map((p) => p.name).join(", ")
          : "—";
      doc.setTextColor(...TEXT_DARK);
      doc.setFontSize(5);
      doc.text(`PIC: ${fitText(doc, membersText, cardW - 6)}`, cardX + 2, cardY + 13);

      // Contention Buffer tag
      if (stage.extendedDays && stage.extendedDays > 0) {
        doc.setFillColor(254, 237, 222); // Orange tint
        doc.roundedRect(cardX + 2, cardY + 16, cardW - 4, 3.5, 0.8, 0.8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor(...ACCENT_ORANGE);
        doc.text(`+${stage.extendedDays}d Contention Buffer`, cardX + 3.5, cardY + 18.5);
      } else if (stage.backlogName) {
        doc.setFillColor(230, 246, 246); // Teal tint
        doc.roundedRect(cardX + 2, cardY + 16, cardW - 4, 3.5, 0.8, 0.8, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5);
        doc.setTextColor(0, 128, 128);
        doc.text(fitText(doc, stage.backlogName, cardW - 6), cardX + 3.5, cardY + 18.5);
      }
    });
  }
}

// ── 3. Main Export Controller ───────────────────────────────────────────────
export async function exportTimelineSimulationPdf(
  options: ExportTimelineSimulationPdfOptions
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const isGantt = (options.visualizationMode ?? "gantt") === "gantt";
  const doc = new jsPDF("l", "mm", "a4"); // Landscape A4 (297 x 210 mm)
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  // ── Normalize metrics to prevent any "undefined" in UI ──────────────────────
  const totalStages = options.stages?.length ?? 0;
  const totalDays =
    typeof options.totalDays === "number" && !isNaN(options.totalDays)
      ? options.totalDays
      : 0;
  const bufferDays =
    options.contentionTotals?.totalExtendedDays ??
    options.contentionTotals?.totalBufferDays ??
    0;
  const bottleneckCount =
    options.contentionTotals?.stagesWithBufferCount ??
    options.contentionTotals?.contendedStagesCount ??
    options.contentionTotals?.overloadedMembers?.length ??
    0;

  // Ensure stages have valid schedule dates
  const scheduledStages = autoScheduleStages(options.stages);
  const sortedStages = [...scheduledStages].sort((a, b) => a.order - b.order);

  // ── Helper: Draw Page Header & KPI Cards ────────────────────────────────────
  const drawPageHeaderAndKpis = () => {
    // Top Brand Bar
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(0, 0, pageW, 5, "F");

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND_NAVY);
    const headerTitle = isGantt
      ? "EXECUTIVE GANTT SCHEDULE REPORT"
      : "EXECUTIVE ROADMAP & CHEVRON TIMELINE REPORT";
    doc.text(headerTitle, margin, 13);

    // View mode badge
    const titleWidth = doc.getTextWidth(headerTitle);
    const badgeX = margin + titleWidth + 4;
    const badgeText = isGantt ? "DATA-DRIVEN GANTT CHART" : "DATA-DRIVEN ROADMAP";
    doc.setFontSize(6.5);
    doc.setFillColor(isGantt ? 235 : 243, isGantt ? 244 : 232, 255);
    doc.roundedRect(badgeX, 9, doc.getTextWidth(badgeText) + 5, 5, 1.2, 1.2, "F");
    doc.setTextColor(
      isGantt ? BRAND_BLUE[0] : 107,
      isGantt ? BRAND_BLUE[1] : 70,
      isGantt ? BRAND_BLUE[2] : 193
    );
    doc.text(badgeText, badgeX + 2.5, 12.5);

    // Subtitle & Print Info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);

    const subtitle = `Simulation: ${options.simulationName || "Default Simulation"}  •  Stream: ${options.activityType}${
      options.projectName ? `  •  Source: ${options.projectName}` : ""
    }`;
    const maxSubW = 170;
    const cleanSubtitle =
      doc.getTextWidth(subtitle) > maxSubW
        ? subtitle.slice(0, 75) + "…"
        : subtitle;
    doc.text(cleanSubtitle, margin, 18);

    const printMeta = `Generated: ${new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}  •  By: ${options.generatedBy || "PMO"}`;
    doc.text(printMeta, pageW - margin, 18, { align: "right" });

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 21, pageW - margin, 21);

    // Summary KPI Cards
    const cardY = 23;
    const cardH = 12;
    const gap = 4;
    const numCards = 4;
    const cardW = (contentW - gap * (numCards - 1)) / numCards;

    const cards = [
      {
        label: "TOTAL STAGES",
        value: `${totalStages} Stages`,
        color: BRAND_BLUE,
      },
      {
        label: "TOTAL DURATION",
        value: `${totalDays > 0 ? totalDays : 0} Days`,
        color: BRAND_NAVY,
      },
      {
        label: "CONTENTION BUFFER",
        value: bufferDays > 0 ? `+${bufferDays} Days` : "0 Days",
        color: bufferDays > 0 ? ACCENT_ORANGE : BRAND_BLUE,
      },
      {
        label: "CONTENTION BOTTLENECK",
        value: bottleneckCount > 0 ? `${bottleneckCount} Stages Affected` : "0 Stages Affected",
        color:
          bottleneckCount > 0
            ? ACCENT_ORANGE
            : ([16, 185, 129] as [number, number, number]),
      },
    ];

    cards.forEach((card, idx) => {
      const cx = margin + idx * (cardW + gap);
      doc.setFillColor(...BG_LIGHT);
      doc.roundedRect(cx, cardY, cardW, cardH, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx, cardY, cardW, cardH, 2, 2, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(card.label, cx + 4, cardY + 4);

      doc.setFontSize(9);
      doc.setTextColor(...card.color);
      doc.text(card.value, cx + 4, cardY + 9.5);
    });

    return cardY + cardH + 4;
  };

  // ── Render Page 1: Header + Pure Data-Driven Vector Visualization ─────────
  const chartStartY = drawPageHeaderAndKpis();
  const availableChartH = pageH - chartStartY - 12;

  if (isGantt) {
    const range = computeStagesDateRange(sortedStages);
    let axis: MonthWeekBucket[] = [];
    if (range.min && range.max) {
      axis = buildMonthWeekAxis(range.min, range.max);
    }
    if (axis.length === 0) {
      const today = new Date();
      const minStr = today.toISOString().slice(0, 10);
      const nextStr = new Date(today.getTime() + 60 * 86400000).toISOString().slice(0, 10);
      axis = buildMonthWeekAxis(minStr, nextStr);
    }

    drawGanttChart(
      doc,
      sortedStages,
      axis,
      margin,
      chartStartY,
      contentW,
      availableChartH
    );
  } else {
    drawChevronTimeline(
      doc,
      sortedStages,
      margin,
      chartStartY,
      contentW,
      availableChartH
    );
  }

  // ── Datatable Rows for Page 2: Comprehensive Audit Schedule ───────────────
  const tableData = sortedStages.map((stage, idx) => {
    const membersText =
      stage.members && stage.members.length > 0
        ? stage.members
            .map(
              (m) =>
                `${m.name}${
                  (m.activeProjectCount ?? 1) >= 2
                    ? ` (${m.activeProjectCount}P)`
                    : ""
                }`
            )
            .join(", ")
        : "—";

    const partiesText =
      stage.parties && stage.parties.length > 0
        ? stage.parties.map((p) => p.name).join(", ")
        : "—";

    const baseDays = stage.durationDays ?? 0;
    const extDays = stage.extendedDays ?? 0;
    const stageTotalDays = baseDays + extDays;

    return [
      String(idx + 1),
      stage.stageName,
      membersText,
      partiesText,
      stage.startDate || "—",
      stage.endDate || "—",
      `${baseDays}d`,
      extDays > 0 ? `+${extDays}d` : "0d",
      `${stageTotalDays}d`,
      stage.backlogName || "—",
    ];
  });

  // Always append Page 2 with the comprehensive Audit Schedule Table
  doc.addPage("a4", "landscape");
  const p2StartY = drawPageHeaderAndKpis();

  autoTable(doc, {
    startY: p2StartY,
    margin: { left: margin, right: margin },
    head: [[
      "No",
      isGantt ? "Stage / Aktivitas (Gantt)" : "Milestone Stage (Roadmap)",
      "Assigned Members",
      "Involved Parties",
      "Start Date",
      "End Date",
      "Base",
      "Buffer",
      "Total",
      "Backlog Item",
    ]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: BRAND_BLUE,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: TEXT_DARK,
      valign: "top",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 44, fontStyle: "bold" },
      2: { cellWidth: 53 },
      3: { cellWidth: 42 },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 22, halign: "center" },
      6: { cellWidth: 14, halign: "center" },
      7: { cellWidth: 16, halign: "center" },
      8: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      9: { cellWidth: 32 },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  });

  // Footnote on page 2
  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const noteY = (lastTable?.finalY ?? 150) + 6;

  if (noteY < pageH - 16) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `* Realistic Load & Contention Rule: ${WORKLOAD_ESTIMATION_RULES.metadata.title} (Gerald M. Weinberg Multi-Project Model: 1P = 0% loss, 2P = 20% loss [+40% buffer], 3P = 40% loss [+85% buffer], >=4P = 60% loss [+150% buffer]).`,
      margin,
      noteY
    );
  }

  // ── Page Footers on All Pages ─────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `Bank bjb IT Governance  •  Timeline Simulation Report (${isGantt ? "Gantt Schedule" : "Chevron Roadmap"})`,
      margin,
      pageH - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 6, {
      align: "right",
    });
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageH - 9, pageW - margin, pageH - 9);
  }

  // ── Save Document ─────────────────────────────────────────────────────────
  let fileName = "template_timeline.pdf";
  if (options.projectName && options.projectName.trim().length > 0) {
    const cleanProjectName = options.projectName
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
    fileName = `${cleanProjectName}_timeline.pdf`;
  }
  doc.save(fileName);
}
